import * as express from 'express';
import * as bodyParser from 'body-parser';
import { TaskManager } from '../task/TaskManager';
import { logger, Logger } from '../util/logger/Logger';

export class Server
{
	private static _instance: Server;

	@logger('Server')
	private _logger!: Logger;
	private _taskManager: TaskManager;
	private _express: express.Express;

	public constructor()
	{
		if (typeof Server._instance !== 'undefined')
			throw new Error('Cannot create multiple instances of Server');

		Server._instance = this;

		this._taskManager = new TaskManager();
		this._express = express();
		this._express.use(bodyParser.json());
		this._express.post('/:task/:id/:secret', (req, res) => {
			this._logger.log(`Received request for task \`${req.params.task}\``);
			this._taskManager.dispatch(req.params.task, req, res);
		});
	}

	/**
	 * Create or retrieve the Server instance
	 */
	public static instance(): Server
	{
		return Server._instance || new Server();
	}

	/**
	 * Start the server and listen to the given port
	 */
	public start(port: number): void
	{
		this._express.listen(port, () => this._logger.log(`CI server started on port ${port}`));
	}
}
