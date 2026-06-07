import joiUtils from '../../utils/joiUtils';
import { SOCKET_EVENTS } from '../../commons/socketHelpers';
import { log } from '../../utils/logger';

const Joi = joiUtils.Joi;

const routes = [
	{
		action: 'on',
		eventName: SOCKET_EVENTS.TEST,
		joiSchemaForSocket: {
			message: Joi.string().required()
		},
		group: 'message',
		description: 'socket event to read message',
		handler: async (payload: any) => log('Test', payload.message)
	}
];

export default routes;
