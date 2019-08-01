import { LogData } from './LogData';

/**
 * Represents a function that transports logger data
 * to some output medium
 */
export type TransportFunction = (data: LogData) => void;
