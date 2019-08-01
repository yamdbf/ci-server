import { Logger } from './Logger';

export function logger(key: string): PropertyDecorator;
export function logger<T>(target: T, key: string): void;
export function logger(...args: any[]): PropertyDecorator | void
{
	if (typeof args[0] === 'string')
		return (<T>(target: T, key: string): void => {
			Object.defineProperty(target, key, { value: Logger.instance(args[0]) });
		}) as PropertyDecorator;

	Object.defineProperty(args[0], args[1], { value: Logger.instance() });
}
