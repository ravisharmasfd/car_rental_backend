import { Request, Response, NextFunction } from 'express';
import CONFIG from '../config';
import userModel from '../models/userModel';
import { decryptJWTToken } from '../utils/utils';
import { createErrorResponse } from '../commons/responseHelpers';
import { AVAILABLE_AUTHS, AVAILABLE_WEBHOOK_AUTHS, ERROR_TYPES, RESPONSE_MESSAGES, USER_ROLE, USER_STATUS, USER_VALIDATION_CHECK, USER_VALIDATION_CHECK_WITH_ROLE } from '../commons/constants';
import { log } from '../utils/logger';

const authService: any = {};

/**
 * function to authenticate user.
 */
authService.userValidate = (auth: number) => {
	return (request: Request, response: Response, next: NextFunction) => {
		validateUser(request, auth)
			.then((result) => {
				if (result) {
					return next();
				}
				const responseObject = createErrorResponse(1, RESPONSE_MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			})
			.catch(() => {
				const responseObject = createErrorResponse(1, RESPONSE_MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			});
	};
};

/**
 * Function to validate webhook user.
 *
 * @param auth - The type of validation required. Possible values are
 *               AVAILABLE_WEBHOOK_AUTHS.AI, AVAILABLE_WEBHOOK_AUTHS.WEBHOOK, etc.
 * @returns A middleware function that validates the webhook user.
 *
 * @throws Will return a 401 status code if the validation fails.
 */
authService.webhookValidate = (auth: number) => {
	return (request: Request, response: Response, next: NextFunction) => {
		validateWebhookUser(request, auth)
			.then((result) => {
				if (result) {
					return next();
				}
				const responseObject = createErrorResponse(1, RESPONSE_MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			})
			.catch(() => {
				const responseObject = createErrorResponse(1, RESPONSE_MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
				return response.status(responseObject.statusCode).json(responseObject);
			});
	};
};

/**
 * function to validate user's jwt token and fetch its details from the system.
 * @param {} request
 */
const validateUser = async (request: any, auth: number) => {
	try {
		const token = request?.headers?.authorization || '';

		if (!token) {
			return false;
		}

		const tokenDetails = decryptJWTToken(token);

		if (!tokenDetails || !tokenDetails?.id) {
			return false;
		}

		let authenticatedUser;

		if (auth === AVAILABLE_AUTHS.ADMIN) {
			authenticatedUser = await userModel.findOne({ _id: tokenDetails.id, ...USER_VALIDATION_CHECK, sessions: tokenDetails.sessionKey, role: USER_ROLE.ADMIN });
		} else if (auth === AVAILABLE_AUTHS.USER) {
			authenticatedUser = await userModel.findOne({ _id: tokenDetails.id, ...USER_VALIDATION_CHECK_WITH_ROLE, sessions: tokenDetails.sessionKey });
		} else if (auth === AVAILABLE_AUTHS.USER_WITH_DATA_RELAXATION) {
			authenticatedUser = await userModel.findOne({ _id: tokenDetails.id, isVerified: true, status: USER_STATUS.ACTIVE, sessions: tokenDetails.sessionKey, role: USER_ROLE.USER });
		} else if (auth === AVAILABLE_AUTHS.ADMIN_OR_USER) {
			authenticatedUser = await userModel.findOne({ _id: tokenDetails.id, ...USER_VALIDATION_CHECK_WITH_ROLE, sessions: tokenDetails.sessionKey });
			if (!authenticatedUser) {
				authenticatedUser = await userModel.findOne({ _id: tokenDetails.id, ...USER_VALIDATION_CHECK, sessions: tokenDetails.sessionKey, role: USER_ROLE.ADMIN });
			}
		}

		if (!authenticatedUser) {
			return false;
		}

		request.user = authenticatedUser;
		return true;
	} catch (e: any) {
		log(e?.message);
		return false;
	}
};

/**
 * Validate the webhook user.
 *
 * @param request - The express request object.
 * @param auth - The type of validation required. Possible values are
 *               AVAILABLE_WEBHOOK_AUTHS.AI, AVAILABLE_WEBHOOK_AUTHS.WEBHOOK, etc.
 * @returns True if the validation is successful, false otherwise.
 *
 * @throws Will return a 401 status code if the validation fails.
 */
const validateWebhookUser = async (request: any, auth: number) => {
	const token = request?.headers?.authorization || '';
	if (!token) {
		return false;
	}
	if (auth === AVAILABLE_WEBHOOK_AUTHS.AI) {
		if (token === CONFIG.AI_API_ACCESS_KEY) {
			return true;
		}
	}
};

/** -- function to authenticate socket token */
authService.socketAuthentication = async (socket: any, next: any) => {
	try {
		const token: string = socket?.handshake?.headers?.auth;
		if (!token) {
			return next({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
		}

		const tokenDetails = decryptJWTToken(token);

		if (!tokenDetails || !tokenDetails?.id) {
			return next({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
		}

		const userData = await userModel.findOne({ _id: tokenDetails.id, sessions: tokenDetails.sessionKey, ...USER_VALIDATION_CHECK });

		if (!userData) {
			return next({ success: false, message: RESPONSE_MESSAGES.UNAUTHORIZED });
		}

		const userId = userData._id.toString();

		socket.id = userId;
		socket.user = userData;
		socket.user.accessToken = token;

		// const socketRooms = [ ];

		// for (const room of socketRooms) {
		// 	socket.join(room._id.toString());
		// }

		return next();
	} catch {
		return next({ success: false, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
	}
};

export default authService;
