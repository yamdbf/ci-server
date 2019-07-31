import { Request, Response } from 'express';
import { Logger } from '../util/logger/Logger';
import { TaskConstructor } from '../types/TaskConstructor';

/**
 * A class extending Task must have a static `task` property for use in the task loader
 */
export abstract class Task
{
	public static task: string;

	protected _logger: Logger;
	protected _req: Request;
	protected _res: Response;

	public constructor(req: Request, res: Response)
	{
		this._logger = Logger.instance(
			`Task:${(this.constructor as TaskConstructor).task}`);

		this._req = req;
		this._res = res;
	}

	public abstract shouldRun(): Promise<boolean>;
	public abstract initialize(): Promise<void>
	public abstract execute(): Promise<void>
}
