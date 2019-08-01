import { TransportFunction } from '../../types/TransportFunction';
import { LogType } from './LogType';
export { logger } from './LoggerDecorator';

export class Logger
{
	private static _instance: Logger;
	private _transports: TransportFunction[];
	private _baseTransportRemoved: boolean;

	private constructor()
	{
		if (Logger._instance)
			throw new Error('Cannot create multiple instances of Logger singleton. Use Logger.instance() instead');

		Logger._instance = this;

		this._transports = [];
		this._baseTransportRemoved = false;

		type Color = [number, number];
		type Colors = 'red' | 'green' | 'yellow' | 'magenta' | 'cyan' | 'grey';
		const colors: { [key in Colors]: Color } = {
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			grey: [90, 39]
		};

		const wrapColor: (c: Color, ...text: string[]) => string =
			(c, ...text) => `\u001B[${c[0]}m${text.join(' ')}\u001B[${c[1]}m`;

		type ColorWrapper = (...text: string[]) => string;
		const createWrapper: (color: Color) => ColorWrapper =
			color => (...text) => wrapColor(color, ...text);

		type LogTypeColorWrappers = { [type: string]: ColorWrapper };
		const typeColorWrappers: LogTypeColorWrappers = {
			[LogType.LOG]: createWrapper(colors.green),
			[LogType.WARN]: createWrapper(colors.yellow),
			[LogType.ERROR]: createWrapper(colors.red),
			[LogType.DEBUG]: createWrapper(colors.magenta)
		};

		const zeroPad: (n: number | string) => string = n => `0${n}`.slice(-2);
		const transport: TransportFunction = data => {
			let { type, tag, text } = data;
			const d: Date = data.timestamp;
			const h: string = zeroPad(d.getHours());
			const m: string = zeroPad(d.getMinutes());
			const s: string = zeroPad(d.getSeconds());
			const t: string = wrapColor(colors.grey, `${h}:${m}:${s}`);

			type = typeColorWrappers[type](type);
			tag = wrapColor(colors.cyan, tag);

			process.stdout.write(`[${t}][${type}][${tag}]: ${text}\n`);
		};

		Logger.addTransport(transport);

	}

	/**
	 * Returns the Logger singleton instance
	 *
	 * When given a tag parameter, a Logger proxy will be returned
	 * that automatically applies the given tag to all logging methods
	 * in lieu of them requiring a tag parameter before the log content
	 */
	public static instance(tag?: string): Logger
	{
		if (typeof tag !== 'undefined')
			return Logger.taggedInstance(tag);

		return Logger._instance || new Logger();
	}

	/**
	 * Returns an instance proxy that prefixes logging
	 * method calls with the given tag
	 */
	private static taggedInstance(tag: string): Logger
	{
		return new Proxy(Logger.instance(), {
			get: (target: any, key: PropertyKey) => {
				switch (key)
				{
					case 'log': case 'warn': case 'error': case 'debug':
						return (...text: string[]) => target[key](tag, ...text);
					default: return target[key];
				}
			}
		});
	}

	/**
	 * Add a Transport for the Logger to use for logging.
	 * The logger will log to all provided transports
	 */
	public static addTransport(transport: TransportFunction): void
	{
		Logger.instance()._transports.push(transport);
	}

	/**
	 * Remove the default console logging transport
	 */
	public static removeBaseTransport(): void
	{
		if (Logger.instance()._baseTransportRemoved) return;
		Logger.instance()._baseTransportRemoved = true;
		Logger.instance()._transports.shift();
	}

	/**
	 * Log information to the Logger transports
	 */
	public async log(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogType.LOG, tag, text.join(' '));
	}

	/**
	 * Log warning text to the logger transports
	 */
	public async warn(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogType.WARN, tag, text.join(' '));
	}

	/**
	 * Log error text to the logger transports
	 */
	public async error(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogType.ERROR, tag, text.join(' '));
	}

	/**
	 * Log debug text to the logger transports
	 */
	public async debug(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogType.DEBUG, tag, text.join(' '));
	}

	/**
	 * Send log data to all transports
	 */
	private _write(type: LogType, tag: string, text: string): void
	{
		const timestamp: Date = new Date();
		for (const transport of this._transports)
			transport({ timestamp, type, tag, text });
	}
}