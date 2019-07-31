import * as Path from 'path';
import * as Glob from 'glob';
import { TaskConstructor } from '../types/TaskConstructor';
import { Task } from './Task';
import { TaskManager } from './TaskManager';
import { logger, Logger } from '../util/logger/Logger';

export class TaskLoader
{
	@logger('TaskLoader')
	private _logger!: Logger;
	private _manager: TaskManager;

	public constructor(manager: TaskManager)
	{
		this._manager = manager;
	}

	/**
	 * Load Task class files from the given directory
	 */
	public loadTasksFrom(dir: string): void
	{
		const path: string = Path.resolve(dir);
		const taskFiles: string[] = Glob.sync(`${path}/**/*.js`);

		for (const file of taskFiles)
		{
			const loadedFile: any = require(file);
			const taskClasses: TaskConstructor[] = this._findTaskClasses(loadedFile);
			for (const taskClass of taskClasses)
			{
				this._logger.log(`Loaded task \`${taskClass.task}\``);
				this._manager.push(taskClass);
			}
		}
	}

	/**
	 * Recursively search for Task classes within the given object
	 */
	private _findTaskClasses(obj: any): TaskConstructor[]
	{
		const foundClasses: (TaskConstructor | TaskConstructor[])[] = [];
		const keys: string[] = Object.keys(obj);
		if (Task.prototype.isPrototypeOf(obj.prototype))
			foundClasses.push(obj);

		else if (keys.length > 0)
			for (const key of keys)
				if (Task.prototype.isPrototypeOf(obj[key].prototype))
					foundClasses.push(this._findTaskClasses(obj[key]));

		return this._flattenArray(foundClasses);
	}

	/**
	 * Flatten an array that may contain nested arrays
	 */
	private _flattenArray<T>(array: (T | T[])[]): T[]
	{
		const result: T[] = [];
		for (const item of array)
			item instanceof Array
				? result.push(...this._flattenArray(item))
				: result.push(item);
		return result;
	}
}
