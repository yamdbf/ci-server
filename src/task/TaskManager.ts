import * as Path from 'path';
import { Request, Response } from 'express';
import { TaskQueue } from './TaskQueue';
import { Task } from './Task';
import { TaskConstructor } from '../types/TaskConstructor';
import { TaskLoader } from './TaskLoader';

export class TaskManager
{
	private _taskLoader: TaskLoader;
	private _queue: TaskQueue;
	private _tasks: { [task: string]: TaskConstructor };

	public constructor()
	{
		this._taskLoader = new TaskLoader(this);
		this._queue = new TaskQueue();
		this._tasks = {};

		this._taskLoader.loadTasksFrom(Path.join(__dirname, '../ci-tasks'));
	}

	/**
	 * Push the given `Task` class to the `Task` class storage
	 */
	public push(taskClass: TaskConstructor): void
	{
		this._tasks[taskClass.task] = taskClass;
	}

	/**
	 * Creates the given `Task` by `Task` name and adds it to the queue
	 */
	public dispatch(task: string, req: Request, res: Response): void
	{
		if (typeof this._tasks[task] === 'undefined') return;

		const newTask: Task = new this._tasks[task](req, res);
		this._queue.addTask(newTask);
	}
}
