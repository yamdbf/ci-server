import { Task } from '../task/Task';
import { Request, Response } from 'express';

/**
 * Represents a class extending `Task` that can be instantiated
 */
export interface TaskConstructor
{
	task: string;
	new (req: Request, res: Response): Task;
}
