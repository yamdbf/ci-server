import { Task } from '../task/Task';
import { Request, Response } from 'express';

export type TaskConstructor = {
	task: string,
	new (req: Request, res: Response): Task
};
