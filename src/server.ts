import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import express, { Application } from 'express';

import CONFIG from './config';
import app from './startup/app';
import { startNotificationCron } from './startup/cron';
import { logger } from './services/logger';
import connectToDatabase from './startup/mongoStartup';
import { log, logWarning } from './utils/logger';
// import { initSocketIoService } from './startup/socketStartup';

const application: Application = express();
const server = http.createServer(application);
const PORT = CONFIG.PORT || 3000;

const startServerInitSequence = async () => {
	connectToDatabase();
	await app(application);
	// initSocketIoService(server);
	await startNotificationCron();
};

server
	.listen(PORT, () => {
		console.clear();
		logger.info(`Server is running on port ${PORT}`);
		logWarning(`Server is running on: http://localhost:${PORT}/documentation`);
		logger.info('Running Startup services');
		startServerInitSequence();
	})
	.on('error', (error: any) => {
		logger.error(`Error occurred while starting the server: \n ${error}`);
		process.exit(1);
	});

process.on('unhandledRejection', (error: any) => {
	logger.error(`Error occurred while starting the server: \n ${error}`);
	log(error.message);
});
