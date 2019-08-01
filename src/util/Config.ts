import * as Path from 'path';

/**
 * Singleton for retrieving config values depending on
 * NODE_ENV 'production' or 'development'
 */
export class Config
{
	private static _instance: Config;

	private readonly _config: any;

	private constructor()
	{
		if (Config._instance)
			throw new Error('Cannot create multiple instances of Config`');

		Config._instance = this;
		this._config = require(Path.join(__dirname, './config.json'));
	}

	/**
	 * Get the singleton instance
	 */
	private static instance()
	{
		return Config._instance || new Config();
	}

	/**
	 * Get the specified config value. Supports nested key paths
	 * with dot notation
	 */
	public static get(keyPath: string): any
	{
		return Config._getNestedValue(Config.instance()._config, [...keyPath.split('.')]);
	}

	/**
	 * Fetch a nested value from within an object via the provided path
	 */
	private static _getNestedValue(obj: any, path: string[]): any
	{
		if (typeof obj === 'undefined') return;
		if (path.length === 0) return obj;

		const first: string = path.shift()!;
		if (typeof obj[first] === 'undefined') return;
		if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array))
			return;

		return Config._getNestedValue(obj[first], path);
	}
}