import { logWarning } from '../utils/logger';

const global = globalThis as any;
/** Initialize socket connection **/
const socketConnection = {
	emit: async (eventName: string, socketId: string, sendData: any): Promise<boolean> => {
		global.io.to(socketId).emit(eventName, sendData);
		return true;
	},
	emitToManyUsers: async (eventName: string, users: string[], sendData: any): Promise<boolean> => {
		for await (const userId of users) {
			global.io.to(userId.toString()).emit(eventName, sendData);
		}
		return true;
	},
	emitToRoom: async (eventName: string, roomId: string, sender: string, sendData: any): Promise<boolean> => {
		/** -- Broadcast to room except the sender. */
		const senderSocket = global.io.sockets.sockets.get(sender.toString());
		if (senderSocket) {
			senderSocket.to(roomId.toString()).emit(eventName, sendData);
			return true;
		} else {
			logWarning(`Socket not found for sender ID: ${sender}`);
			return false;
		}
	},
	joinRoom: async (roomId: string, userId: string): Promise<boolean> => {
		const senderSocket = global.io.sockets.sockets.get(userId.toString());
		if (senderSocket) {
			senderSocket.join(roomId.toString());
			return true;
		} else {
			logWarning(`Socket not found for sender ID: ${userId}`);
			return false;
		}
	},
	leaveRoom: async (roomId: string, userId: string): Promise<void> => {
		Array.from(global.io.sockets.sockets).forEach((socket: any) => {
			if (socket[0] === userId.toString()) {
				socket[1].leave(roomId.toString());
			}
		});
	},
	emitInRoom: async (eventName: string, roomId: string, sendData: any): Promise<boolean> => {
		/** -- Broadcast in room. */
		global.io.sockets.in(roomId.toString()).emit(eventName, sendData);
		return true;
	},
	checkUserInRoom: (userId: string, roomId: string): boolean => {
		if (global.io && global.io.sockets && global.io.sockets.adapter && global.io.sockets.adapter.sids && global.io.sockets.adapter.sids[userId.toString()] && global.io.sockets.adapter.sids[userId.toString()][roomId.toString()]) {
			return true;
		}
		return false;
	},
	emitToAll: (eventName: string, sendData: any): void => {
		global.io.emit(eventName, sendData);
	},
	emitToAllExceptItsSelf: (eventName: string, userId: string, sendData: any): void => {
		if (global.io && global.io.sockets && global.io.sockets.connected && global.io.sockets.connected[userId.toString()]) {
			global.io.sockets.connected[userId.toString()].broadcast.emit(eventName, sendData);
		} else {
			global.io.emit(eventName, sendData);
		}
	},
	disconnectUser: (userId: string): void => {
		const senderSocket = global.io.sockets.sockets.get(userId.toString());
		if (senderSocket) {
			senderSocket.disconnect();
		}
	}
};

export default socketConnection;
