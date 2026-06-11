import { Server } from 'socket.io';

import { logger } from '../services/logger';
import routeUtils from '../utils/routeUtils';
import socketRoutes from '../routes/socket/socketRoutes';
import { SOCKET_EVENTS } from '../commons/socketHelpers';
import authService from '../services/authService';
import { log } from '../utils/logger';
// import { markUserActiveStatus } from '../controllers/userController';

export const initSocketIoService = async (server: any) => {
	const global = globalThis as any;
	const io = new Server(server, {
		cors: {
			origin: '*',
			methods: [ 'GET', 'POST' ]
		}
	});

	const topics: any = [ { eventName: SOCKET_EVENTS.CONNECTION, handler: 'binded', status: 'success' } ];
	socketRoutes.forEach((route: any) => {
		topics.push({ eventName: route.eventName, handler: route?.handler ? 'binded' : 'not binded', status: route?.handler ? 'success' : 'failed' });
	});
	console.table(topics);

	io.use(authService.socketAuthentication);
	io.on(SOCKET_EVENTS.CONNECTION, async (socket: any) => {
		socket.use(async (packet: any, next: any) => {
			/** validate here **/
			try {
				log('Whole packet is ', packet);
				log('Socket hit :- ', packet[0]);
				await routeUtils.socketRoute(packet);
				next();
			} catch (error: any) {
				log(error.message);
				if (packet[2] && typeof packet[2] === 'function') {
					packet[2]({ success: false, message: error.message });
				}
			}
		});

		// await markUserActiveStatus({ userId: socket.id }, true);

		// Iterate over all the routes and create a socket event for each route
		socketRoutes.forEach((route: any) => {
			socket.on(route.eventName, (payload: any, callback: any = (data: any) => logger.error('No Callback Provided', data)) => {
				route.handler({ ...payload, userId: socket.id, user: socket.user }, callback);
			});
		});

		//         const socketQuery = socket.handshake.query as Record<string, any>; // Ensure it's a valid object
		// const serial: string | undefined = socketQuery?.serial;
		const socketQuery = JSON.parse(JSON.stringify(socket.handshake.query));
		logger.info(`Socket handshake query params: , ${socketQuery?.serial}`);
		logger.info(`Socket Connected :  ${socket?.id}`);
		socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
			// await markUserActiveStatus({ userId: socket.id }, false);
			logger.info(`Socket Disconnected :  ${socket?.id}`);
		});
	});
	global.io = io;
	return io;
};
