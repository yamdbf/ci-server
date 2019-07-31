import { BuildData } from '../types/BuildData';
import { BuildState } from '../types/BuildState';
import fetch from 'node-fetch';

export class Build
{
	private _data: BuildData;
	private _state: BuildState;

	public constructor(data: BuildData)
	{
		this._data = data;
		this._state = 'pending';
	}

	public start(description?: string, url?: string): Promise<any>
	{
		this._state = 'pending';
		return this._updateBuild(description, url);
	}

	public success(description?: string, url?: string): Promise<any>
	{
		this._state = 'success';
		return this._updateBuild(description, url);
	}

	public failure(description?: string, url?: string): Promise<any>
	{
		this._state = 'failure';
		return this._updateBuild(description, url);
	}

	public error(description?: string, url?: string): Promise<any>
	{
		this._state = 'error';
		return this._updateBuild(description, url);
	}

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
			return err;
		}
	}
}
