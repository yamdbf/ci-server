import { TaskQueue } from '../task/TaskQueue';
import { Task } from '../task/Task';
import { Build } from '../task/Build';
import { BuildData } from '../types/BuildData';
import { Server } from '../server/Server';
import { Logger } from '../util/logger/Logger';
import { Config } from '../util/Config';

const logger: Logger = Logger.instance('Test');

//@ts-ignore
let queue: TaskQueue = new TaskQueue();

// Should execute normally
class TestTask extends Task
{
	public name: string;

	public constructor(n: number)
	{
		super({} as any, {} as any);
		this.name = 'TestTask' + n;
	}

	public async shouldRun() { return true; }
	public async initialize() {}

	public async execute()
	{
		logger.log(`Task ${this.name} starting`);
		await new Promise(r => setTimeout(r, 2e3));
		logger.log(`Task ${this.name} ended`);
	}
}

// Should not run
//@ts-ignore
class TestTask2 extends TestTask
{
	public async shouldRun()
	{
		logger.log(`${this.name} should not run`);
		return false;
	}
}

// Should error on initialize
//@ts-ignore
class TestTask3 extends TestTask
{
	public async initialize() { throw new Error(this.name); }
}

// Should error on execute
//@ts-ignore
class TestTask4 extends TestTask
{
	public async execute() { throw new Error(this.name); }
}

let buildData: BuildData = {
	repo: 'yamdbf/core',
	token: Config.get('token'),
	sha: '51af680a530849a4e04e92d3a8648d7774d8252d',
	context: 'yamdbf/test1',
	description: 'testing new build system',
	target_url: 'github.com/yamdbf/core'
}

// Should create a build and display it on github normally
//@ts-ignore
class TestTask5 extends TestTask
{
	public async execute()
	{
		const build: Build = new Build(buildData);

		logger.log(`Task ${this.name} starting`);
		await build.start();
		logger.log('Build status updated successfully');
		await new Promise(r => setTimeout(r, 30e3));
		await build.success();
		logger.log('Build finished');
	}
}

// Should create a build and display a build failure on github
//@ts-ignore
class TestTask6 extends TestTask
{
	public async execute()
	{
		buildData.context = 'yamdbf/test2';
		const build: Build = new Build(buildData);

		logger.log(`Task ${this.name} starting`);
		await build.start('failure test');
		logger.log('Build status updated successfully');
		await new Promise(r => setTimeout(r, 30e3));
		await build.failure('test build failure');
		logger.log('Build finished');
	}
}

// Should create a build and display a build error on github
//@ts-ignore
class TestTask7 extends TestTask
{
	public async execute()
	{
		buildData.context = 'yamdbf/test3';
		const build: Build = new Build(buildData);

		logger.log(`Task ${this.name} starting`);
		await build.start('error test');
		logger.log('Build status updated successfully');
		await new Promise(r => setTimeout(r, 30e3));
		await build.error('test build error');
		logger.log('Build finished');
	}
}

// queue.addTask(new TestTask(1));
// queue.addTask(new TestTask2(2));
// queue.addTask(new TestTask3(3));
// queue.addTask(new TestTask4(4));
// queue.addTask(new TestTask5(5));
// queue.addTask(new TestTask6(6));
// queue.addTask(new TestTask7(7));

const server: any = Server.instance();
server.start(Config.get('port'));
logger.log(Object.keys(server._taskManager._tasks).toString());
server._taskManager.dispatch('test');
