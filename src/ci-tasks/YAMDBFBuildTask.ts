import { Task } from '../task/Task';
import { Build } from '../task/Build';
import { Config } from '../util/Config';
import { execSync, ExecSyncOptions } from 'child_process';

export default class extends Task
{
	public static task: string = 'build';

	private _branch: string = (this._req.body.ref as string).match(/refs\/heads\/(.+)/)![1];
	private _build!: Build;

	public async shouldRun(): Promise<boolean>
	{
		if (Config.get(this._req.params.id) !== this._req.params.secret)
		{
			this._logger.warn('Rejected task: Forbidden');
			this._res.send({ status: 403, body: 'Forbidden'});
			return false;
		}

		if (this._req.headers['x-github-event'] !== 'push')
		{
			this._logger.log(`Rejected task: Untracked event - ${this._req.headers['x-github-event']}`);
			this._res.send({ status: 204, body: 'Untracked event'});
			return false;
		}

		if (this._branch !== 'master')
		{
			this._logger.log(`Rejected task: Untracked branch - ${this._branch}`);
			this._res.send({ status: 204, body: 'Untracked branch'});
			return false;
		}

		if (this._req.body.before === this._req.body.after)
		{
			this._logger.log('Rejected task: No changes');
			this._res.send({ status: 204, body: 'No changes'});
			return false;
		}

		return true;
	}

	public async initialize(): Promise<any>
	{
		this._build = new Build({
			repo: 'yamdbf/core',
			sha: this._req.body.after,
			token: Config.get('token'),
			context: 'YAMDBF Prebuilt Build',
			description: 'Building YAMDBF...',
			target_url: `https://github.com/yamdbf/core/tree/indev`
		});
	}

	public async execute(): Promise<void>
	{
		enum Messages
		{
			noChange = 'No code changes',
			buildPass = 'Successfully built YAMDBF',
			buildFail = 'YAMDBF build failed'
		}

		try
		{
			await this._build.start();

			const opts: ExecSyncOptions = { cwd: Config.get('yamdbf.indev') };

			this._logger.log(`Task started: YAMDBF indev build - yamdbf/master#${this._req.body.after}`);
			execSync('git clean -df && git checkout .', opts);
			execSync('git pull', opts);
			try { execSync('rm -rf node_modules', opts); } catch {}
			execSync('yarn && gulp gh-prebuild', opts)

			const gitStatus: string = execSync(`cd ../yamdbf-prebuilt && git status`, opts).toString();

			if (gitStatus.includes('nothing to commit'))
			{
				this._logger.log(`Task finished: ${Messages.noChange}`);
				this._build.success(Messages.noChange);
				this._res.send({ status: 200, body: Messages.noChange });
			}
			else
			{
				const command: string = [
					'cd ../yamdbf-prebuilt',
					'git add --all',
					`git commit -m "Build YAMDBF Prebuilt: ${this._req.body.after}"`,
					'git push'
				].join(' && ');

				const result: string = execSync(command, opts).toString();
				
				this._logger.log(result);
				this._logger.log(`Task finished: ${Messages.buildPass}`);
				this._build.success(Messages.buildPass);
				this._res.send({ status: 200, body: Messages.buildPass });
			}
			
		}
		catch (err)
		{
			this._logger.error(err);
			this._logger.error(`Task failed: ${Messages.buildFail}`);
			this._build.failure(Messages.buildFail);
			this._res.send({ status: 500, body: Messages.buildFail });
		}
	}
}
