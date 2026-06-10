import cors from 'cors';
import path from 'path';
import healthcheck from 'express-healthcheck';
import express, { Application, Request, Response, NextFunction } from 'express';

import { routes } from '../routes/api';
import routeUtils from '../utils/routeUtils';
import { migerateDatabase } from '../utils/dbMigration';
import { requestLogger } from '../middleware/requestLogger';

export default async (app: Application) => {
	/** middleware for each api call to logging **/
	app.use(requestLogger);
	app.use(cors());

	// Middleware
	app.use(
		express.json({
			limit: '50mb',
			verify: (req: any, res, buf) => {
				if (req.originalUrl && req.originalUrl.startsWith('/v1/stripe/webhook')) {
					req.rawBody = buf.toString();
				}
			}
		})
	);
	app.use(express.urlencoded({ extended: true, limit: '50mb' }));

	/********************************
	 ***** For handling CORS Error ***
	 *********************************/
	app.all('/*', (request: Request, response: Response, next: NextFunction) => {
		response.header('Access-Control-Allow-Origin', '*');
		response.header('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message');
		response.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS');
		response.header('Access-Control-Max-Age', '1800');
		next();
	});

	// initalize routes.
	await routeUtils.route(app, routes);

	app.use('/swagger', express.static(path.join(__dirname, '../../swagger.json')));
	// serve static folder.
	app.use('/health', healthcheck({ healthy: () => ({ status: 'healthy' }) }));

	app.use('/public', express.static('public'));

	app.use('/file', express.static('uploads'));

	// Serve Privacy Policy HTML
	app.get('/privacy-policy', (req: Request, res: Response) => {
		res.sendFile(path.join(process.cwd(), 'public/templates/privacyPolicy.html'));
	});
	app.get('/security', (req: Request, res: Response) => {
		res.sendFile(path.join(process.cwd(), 'public/templates/security.html'));
	});

	await migerateDatabase();
};
