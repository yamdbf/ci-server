import { Task } from './Task';
import { TaskConstructor } from '../types/TaskConstructor';
import { logger, Logger } from '../util/logger/Logger';

export class TaskQueue
{
	@logger('TaskQueue')
	private _logger!: Logger;
	private _queue: Task[];
	private _busy: boolean;

	public constructor()
	{
		this._queue = [];
		this._busy = false;
	}

	
	/**
	 * Add a Task to the queue and run the queue if it isn't busy
	 */
	public addTask(task: Task): void
	{
		this._queue.push(task);
		this._logger.log(`Task \`${(task.constructor as TaskConstructor).task}\` added to queue`);
		this._run();
	}

	/**
	 * Lock the queue, preventing any new tasks from running
	 */
	private _lock(): void
	{
		this._busy = true;
	}

	/**
	 * Unlocks the queue and runs the next Task
	 */
	private _unlock(): void
	{
		this._busy = false;
		return this._run();
	}

	/**
	 * Log an error, unlock the queue, and run the next Task
	 */
	private _error(err: string): void
	{
		this._logger.error(err);
		return this._unlock();
	}

	/**
	 * Run the next Task in the queue
	 */
	private _run(): void
	{
		if (this._queue.length === 0) return;
		this._executeTask(this._queue.shift()!);
	}

	/**
	 * Execute the given Task
	 */
	private async _executeTask(task: Task): Promise<void>
	{
		if (this._busy)
		{
			this._queue.unshift(task);
			return;
		}

		this._lock();

		if (!await task.shouldRun()) return this._unlock();

		const taskClass: typeof Task = task.constructor as typeof Task;

		try { await task.initialize(); }
		catch (err) { return this._error(`Task \`${taskClass.task}\` failed to initialize:\n${err.stack}`); }

		try { await task.execute(); }
		catch (err) { return this._error(`Task \`${taskClass.task}\` errored while running:\n${err.stack}`); }

		return this._unlock();
	}
}
