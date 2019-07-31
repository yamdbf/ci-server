import { Logger } from './Logger';

export function logger(key: string): PropertyDecorator;
export function logger<T>(target: T, key: string): void;
export function logger(...args: any[]): any
{
	if (typeof args[0] === 'string')
		return (target: any, key: string) => {
			Object.defineProperty(target, key, { value: Logger.instance(args[0]) });
		};

	Object.defineProperty(args[0], args[1], { value: Logger.instance() });
}