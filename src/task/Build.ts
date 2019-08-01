import fetch from 'node-fetch';
import { Logger, logger } from '../util/logger/Logger';
import { BuildData } from '../types/BuildData';
import { BuildState } from '../types/BuildState';

export class Build
{
	@logger('Build')
	private _logger!: Logger;
	private _data: BuildData;
	private _state!: BuildState;

	public constructor(data: BuildData)
	{
		this._data = data;
	}

	/**
	 * Start the build. Sets build state to `pending`
	 */
	public start(description?: string, url?: string): Promise<any>
	{
		this._state = 'pending';
		return this._updateBuild(description, url);
	}

	/**
	 * Mark the build as successful. Sets build state to `success`
	 */
	public success(description?: string, url?: string): Promise<any>
	{
		this._state = 'success';
		return this._updateBuild(description, url);
	}

	/**
	 * Mark the build as failed. Sets build state to `failure`
	 */
	public failure(description?: string, url?: string): Promise<any>
	{
		this._state = 'failure';
		return this._updateBuild(description, url);
	}

	/**
	 * Mark the build as errored. Sets build state to `error`
	 */
	public error(description?: string, url?: string): Promise<any>
	{
		this._state = 'error';
		return this._updateBuild(description, url);
	}

	/**
	 * Make the GitHub api request to update build status and information
	 */
	private async _updateBuild(
		description: string = this._data.description,
		target_url: string = this._data.target_url): Promise<any>
	{
		try
		{
			const method: string = 'POST';
			const url: string = `https://api.github.com/repos/${this._data.repo}/statuses/${this._data.sha}`;
			const context: string = this._data.context;
			const state: BuildState = this._state;
			const body: string = JSON.stringify({ description, target_url, context, state });
			const headers: any = {
				Authorization: `token ${this._data.token}`,
				'Content-Type': 'application/json'
			};
	
			return (await fetch(url, { method, body, headers })).json();
		}
		catch (err)
		{
			this._logger.error([
				`Error updating build info for commit \`${this._data.sha}\``,
				`with context '${this._data.context}':\n${err.stack}`
			].join(' '));
		}
	}
}
