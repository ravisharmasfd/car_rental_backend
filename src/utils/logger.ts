/**
 * Logs a message to the console with an "LOG" prefix.
 * @param message The message to log
 * @param arg Any additional arguments to log
 */
export const log = (message: string, ...arg: any[]): void => {
	console.log(`[LOG]: ${message}`, ...arg);
};

/**
 * Logs a message to the console with an "ERROR" prefix.
 * @param message The message to log
 * @param arg Any additional arguments to log
 */
export const logError = (message: string, ...arg: any[]): void => {
	console.error(`[ERROR]: ${message}`, ...arg);
};

/**
 * Logs a message to the console with an "WARNING" prefix.
 * @param message The message to log
 * @param arg Any additional arguments to log
 */
export const logWarning = (message: string, ...arg: any[]): void => {
	console.warn(`[WARNING]: ${message}`, ...arg);
};
