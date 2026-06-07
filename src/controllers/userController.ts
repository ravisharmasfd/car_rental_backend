import UserModel from '../models/userModel';
import dbService from '../services/databaseService';
import { sendEmail } from '../utils/commonFunctions';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { comparePassword, generateJWTToken, generateRandomKey, generateSecureOTP, hashPassword } from '../utils/utils';
// import errorLogsModel from '../models/errorLogsModel';
import { ERROR_TYPES, RESPONSE_MESSAGES, EMAIL_TYPES, LOGIN_TYPE, USER_STATUS, USER_VALIDATION_CHECK } from '../commons/constants';
/**
 * Handles user login by verifying email and password, and generating a JWT token.
 * @param payload
 * @returns
 */
export const loginUser = async (payload: any) => {
	const { email, password, type, languagePreference, deviceToken, deviceVoipToken } = payload;

	let user;
	if (type === LOGIN_TYPE.NORMAL) {
		// Check if user exists
		const userValidationCheck: any = { ...USER_VALIDATION_CHECK };
		delete userValidationCheck.status;
		user = await dbService.findOne(UserModel, { email, ...userValidationCheck });
		if (!user) {
			throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
		} else if (!user?.isVerified) {
			throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.PLEASE_VERIFY_YOUR_EMAIL, ERROR_TYPES.BAD_REQUEST);
		}

		// Compare password
		const isMatch = user.password ? await comparePassword(password, user.password || '') : false;
		if (!isMatch) {
			throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.INVALID_EMAIL_OR_PASSWORD, ERROR_TYPES.BAD_REQUEST);
		}
	}
	// else if (type === LOGIN_TYPE.APPLE) {
	// 	try {
	// 		const decodedHeader = jwt.decode(appleToken, { complete: true });
	// 		if (!decodedHeader) {
	// 			throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.APPLE_SIGIN_FAILED, ERROR_TYPES.BAD_REQUEST);
	// 		}

	// 		const applePublicKey = await getApplePublicKey(decodedHeader.header.kid);

	// 		// Verify JWT using Apple's public key
	// 		const decodedToken: any = jwt.verify(appleToken, applePublicKey, { algorithms: [ 'RS256' ] });
	// 		if (decodedToken?.aud !== process.env.APPLE_CLIENT_ID) {
	// 			throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.APPLE_SIGIN_FAILED, ERROR_TYPES.BAD_REQUEST);
	// 		}

	// 		user = await dbService.findOne(UserModel, { appleSub: decodedToken?.sub });
	// 		if (!user) {
	// 			const newUser = {
	// 				name: decodedToken?.email.split('@')[0] || 'Unknown',
	// 				email: decodedToken?.email,
	// 				appleSub: decodedToken?.sub,
	// 				status: USER_STATUS.ACTIVE,
	// 				isVerified: true,
	// 				emailVerifiedAt: new Date(),
	// 				languagePreference,
	// 				registrationInComplete: true
	// 			};

	// 			user = await dbService.create(UserModel, newUser);
	// 		}
	// 	} catch (e: any) {
	// 		await dbService.create(errorLogsModel, { message: RESPONSE_MESSAGES.APPLE_SIGIN_FAILED, errorType: ERROR_LOGS_TYPES.APPLE_SIGIN_FAILED, stackTrace: e.stack });
	// 		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.APPLE_SIGIN_FAILED, ERROR_TYPES.BAD_REQUEST);
	// 	}
	// } else if (type === LOGIN_TYPE.FACEBOOK) {
	// 	try {
	// 		const decodedToken = await getFacebookUserData(facebookToken);
	// 		if (!decodedToken) {
	// 			throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.FACEBOOK_SIGIN_FAILED, ERROR_TYPES.BAD_REQUEST);
	// 		}

	// 		user = await dbService.findOne(UserModel, { email: decodedToken?.email });

	// 		if (!user) {
	// 			user = await dbService.findOne(UserModel, { facebookId: decodedToken?.id });

	// 			if (!user) {
	// 				const newUser = {
	// 					name: decodedToken?.name || decodedToken?.email.split('@')[0] || 'Unknown',
	// 					email: decodedToken?.email,
	// 					facebookId: decodedToken?.id,
	// 					status: USER_STATUS.ACTIVE,
	// 					isVerified: true,
	// 					languagePreference,
	// 					emailVerifiedAt: new Date(),
	// 					registrationInComplete: true
	// 				};
	// 				user = await dbService.create(UserModel, newUser);
	// 			}
	// 		} else {
	// 			const dataToBeUpdated: any = {};
	// 			if (!user?.isVerified) {
	// 				dataToBeUpdated.emailVerifiedAt = new Date();
	// 				dataToBeUpdated.status = USER_STATUS.ACTIVE;
	// 				dataToBeUpdated.isVerified = true;
	// 			}
	// 			if (!user?.facebookId) {
	// 				dataToBeUpdated.facebookId = decodedToken?.id;
	// 			}
	// 			if (!user.isVerified || !user.facebookId) {
	// 				await dbService.findOneAndUpdate(UserModel, { email: decodedToken?.email }, { $set: dataToBeUpdated });
	// 			}
	// 		}
	// 	} catch (e: any) {
	// 		await dbService.create(errorLogsModel, { message: RESPONSE_MESSAGES.FACEBOOK_SIGIN_FAILED, errorType: ERROR_LOGS_TYPES.FACEBOOK_SIGIN_FAILED, stackTrace: e.stack });
	// 		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.FACEBOOK_SIGIN_FAILED, ERROR_TYPES.BAD_REQUEST);
	// 	}
	// } else {
	// 	let googleDetails: any = {};
	// 	try {
	// 		googleDetails = await verifyFirebaseToken(googleToken);
	// 	} catch (e: any) {
	// 		await dbService.create(errorLogsModel, { message: RESPONSE_MESSAGES.GOOGLE_SIGIN_FAILED, errorType: ERROR_LOGS_TYPES.GOOGLE_SIGIN_FAILED, stackTrace: e.stack });
	// 		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.GOOGLE_SIGIN_FAILED, ERROR_TYPES.BAD_REQUEST);
	// 	}

	// 	if (!googleDetails.email) {
	// 		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
	// 	}

	// 	user = await dbService.findOne(UserModel, { email: googleDetails.email });
	// 	if (!user) {
	// 		const newUser = {
	// 			name: googleDetails?.name || googleDetails?.email.split('@')[0] || 'Unknown',
	// 			email: googleDetails?.email,
	// 			status: USER_STATUS.ACTIVE,
	// 			isVerified: true,
	// 			emailVerifiedAt: new Date(),
	// 			registrationInComplete: true
	// 		};

	// 		user = await dbService.create(UserModel, newUser);
	// 	}

	// 	const dataToBeUpdated: any = {};
	// 	if (!user?.isVerified) {
	// 		dataToBeUpdated.emailVerifiedAt = new Date();
	// 		dataToBeUpdated.status = USER_STATUS.ACTIVE;
	// 		dataToBeUpdated.isVerified = true;
	// 	}
	// 	if (!user?.googleId) {
	// 		dataToBeUpdated.googleId = googleDetails.user_id;
	// 	}
	// 	if (!user.isVerified || !user.googleId) {
	// 		await dbService.findOneAndUpdate(UserModel, { email: googleDetails.email }, { $set: dataToBeUpdated });
	// 	}
	// }

	if (user.status === USER_STATUS.INACTIVE) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.ACCOUNT_SUSPENDED, ERROR_TYPES.BAD_REQUEST);
	}

	// create JWT token here.
	const { token, sessionKey } = generateJWTToken(user._id as string);

	if (deviceToken) {
		await dbService.updateMany(UserModel, { deviceToken, _id: { $ne: user._id } }, { $unset: { deviceToken: 1 } });
	}
	if (deviceVoipToken) {
		await dbService.updateMany(UserModel, { deviceVoipToken, _id: { $ne: user._id } }, { $unset: { deviceVoipToken: 1 } });
	}

	user = await dbService.findOneAndUpdate(
		UserModel,
		{ _id: user._id },
		{
			$set: { sessions: sessionKey, deviceToken, deviceVoipToken },
			$unset: { resetPasswordToken: 1, emailVerificationSecret: 1, registerationEmailSentAt: 1 }
		},
		{ new: true }
	);

	delete user.password;
	delete user.googleId;
	delete user.passwordKey;
	delete user.sessions;
	delete user.emailVerifiedAt;
	delete user.emailVerificationToken;
	delete user.emailVerificationTokenLimit;
	delete user.forgotPasswordVerificationTokenLimit;

	// disconnect user from previous socket connections
	// socketConnection.disconnectUser(user._id);

	return createSuccessResponse(languagePreference, RESPONSE_MESSAGES.LOGIN_SUCCESSFUL, { user, token, changePasswordRequired: user.changePassword || false });
};

/**
 * Handles forgot password functionality by generating a reset token and sending it to the user's email.
 * @param payload
 * @returns
 */
export const forgotPassword = async (payload: any) => {
	const { email, languagePreference } = payload;

	// Check if user exists
	const user = await dbService.findOne(UserModel, { email, ...USER_VALIDATION_CHECK });
	if (!user) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
	}
	if (user?.registerationEmailSentAt && new Date().getTime() - new Date(user.registerationEmailSentAt).getTime() < 30000) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.TRY_AFTER_SOMETIME, ERROR_TYPES.BAD_REQUEST);
	}
	const otp = generateSecureOTP();

	// Generate reset token
	const resetToken = generateRandomKey();
	const emailVerificationSecret = await hashPassword(otp);

	// Send email with reset token
	sendEmail({ otp, email }, EMAIL_TYPES.FORGOT_PASSWORD_EMAIL);

	await dbService.updateOne(UserModel, { _id: user._id }, { $set: { resetPasswordToken: resetToken, emailVerificationSecret, registerationEmailSentAt: new Date(), forgotPasswordVerificationTokenLimit: 0 } });

	return createSuccessResponse(languagePreference, RESPONSE_MESSAGES.RESET_LINK_SENT, { email: user.email, resetToken });
};

/**
 * Handles change password functionality by verifying the reset token and updating the user's password.
 * @param payload
 * @returns
 */
export const resetPasswordVerify = async (payload: any) => {
	const { resetToken, otp, languagePreference } = payload;

	// Check if user exists
	const user = await dbService.findOne(UserModel, { resetPasswordToken: resetToken, ...USER_VALIDATION_CHECK });
	if (!user) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.BAD_REQUEST);
	} else if (user?.registerationEmailSentAt && new Date().getTime() - new Date(user.registerationEmailSentAt).getTime() > 600000) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.BAD_REQUEST);
	}

	if (user.forgotPasswordVerificationTokenLimit > 2) {
		await dbService.updateOne(UserModel, { resetPasswordToken: resetToken }, { $unset: { resetPasswordToken: 1, emailVerificationSecret: 1 } });
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.UNAUTHORIZED);
	}

	if (!user.emailVerificationSecret) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.BAD_REQUEST);
	}

	const isMatch = await comparePassword(otp, user.emailVerificationSecret);
	if (!isMatch) {
		await dbService.updateOne(UserModel, { resetPasswordToken: resetToken }, { $inc: { forgotPasswordVerificationTokenLimit: 1 } });
		if (user.forgotPasswordVerificationTokenLimit === 2) {
			throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.UNAUTHORIZED);
		}
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.INVALID_OTP, ERROR_TYPES.BAD_REQUEST);
	}

	const token = generateRandomKey();
	await dbService.updateOne(UserModel, { _id: user._id }, { $set: { resetPasswordToken: token, registerationEmailSentAt: new Date() }, $unset: { passwordKey: 1, emailVerificationSecret: 1 } });

	return createSuccessResponse(languagePreference, RESPONSE_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY, { resetPasswordToken: token });
};

/**
 * Resets the user's password by verifying the reset token and updating the user's password.
 * @param payload
 * @returns
 */
export const resetPassword = async (payload: any) => {
	const { resetPasswordToken, newPassword, languagePreference } = payload;

	const user = await dbService.findOne(UserModel, { resetPasswordToken, ...USER_VALIDATION_CHECK });
	if (!user) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
	}
	if (user?.registerationEmailSentAt && new Date().getTime() - new Date(user.registerationEmailSentAt).getTime() > 600000) {
		throw createErrorResponse(languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.BAD_REQUEST);
	}
	// Hash new password
	const hashedPassword = await hashPassword(newPassword);

	// Update user's password
	await dbService.updateOne(UserModel, { _id: user._id }, { $set: { password: hashedPassword, changePassword: false }, $unset: { resetPasswordToken: 1, passwordKey: 1 } });

	return createSuccessResponse(languagePreference, RESPONSE_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY);
};

/**
 * Changes the user's password.
 * @param payload
 * @returns
 */
export const changePassword = async (payload: any) => {
	const { oldPassword, newPassword } = payload;

	const user = await dbService.findOne(UserModel, { _id: payload.user._id, ...USER_VALIDATION_CHECK }, { password: 1 });

	// Validate the old password
	const isOldPasswordValid = await comparePassword(oldPassword, user.password);
	if (!isOldPasswordValid) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
	}

	// Hash the new password
	const hashedPassword = await hashPassword(newPassword);

	// Update the user's password and remove resetPasswordToken and passwordKey
	await dbService.updateOne(UserModel, { _id: user._id }, { $set: { password: hashedPassword, changePassword: false } });

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY);
};

/**
 * Logs out a user by removing the session token.
 * @param payload
 * @returns
 */
export const logoutUser = async (payload: any) => {
	const userId = payload?.user?._id;

	const user = await dbService.findOne(UserModel, { _id: userId, ...USER_VALIDATION_CHECK });
	if (!user) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
	}
	await dbService.updateOne(UserModel, { _id: userId }, { $unset: { sessions: 1, deviceToken: 1, deviceVoipToken: 1 } });

	// socketConnection.disconnectUser(userId);

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.LOGOUT_SUCCESSFUL);
};

/**
 * Registers a user via email.
 * @param payload
 * @returns
 */
export const registerUserViaEmail = async (payload: any) => {
	const { email } = payload;

	// Check if user already exists
	const existingUser = await dbService.findOne(UserModel, { email });
	if (existingUser?.isVerified) {
		throw createErrorResponse(payload?.languagePreference, RESPONSE_MESSAGES.USER_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
	} else if (existingUser?.registerationEmailSentAt && new Date().getTime() - new Date(existingUser.registerationEmailSentAt).getTime() < 30000) {
		throw createErrorResponse(payload?.languagePreference, RESPONSE_MESSAGES.TRY_AFTER_SOMETIME, ERROR_TYPES.BAD_REQUEST);
	}

	const otp = generateSecureOTP();
	// Create new user
	const registerationEmailSentAt = new Date();
	const emailVerificationToken = generateRandomKey();
	const emailVerificationSecret = await hashPassword(otp);
	const password = await hashPassword(payload.password);
	const newUser = { emailVerificationToken, emailVerificationSecret, registerationEmailSentAt, isVerified: false, emailVerificationTokenLimit: 0, password, name: payload.name, mobileNumber: payload.mobileNumber, countryCode: payload.countryCode, userType: payload.userType, languagePreference: payload.languagePreference };

	const createdUser = await dbService.findOneAndUpdate(UserModel, { email }, newUser, { upsert: true, new: true });

	sendEmail({ otp, email }, EMAIL_TYPES.WELCOME_EMAIL);

	return createSuccessResponse(payload?.languagePreference, RESPONSE_MESSAGES.EMAIL_SENT_TO_YOUR_EMAIL, { email: createdUser.email, emailVerificationToken: createdUser.emailVerificationToken });
};

/**
 * Verify the user's email by sending a verification token.
 * @param payload
 * @returns
 */
export const verifyUserEmail = async (payload: any) => {
	const { emailVerificationToken, otp } = payload;

	const user = await dbService.findOne(UserModel, { emailVerificationToken });
	if (!user) {
		throw createErrorResponse(payload?.languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.BAD_REQUEST);
	} else if (user?.registerationEmailSentAt && new Date().getTime() - new Date(user.registerationEmailSentAt).getTime() > 600000) {
		throw createErrorResponse(payload?.languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.BAD_REQUEST);
	} else if (user.emailVerificationTokenLimit > 2) {
		await dbService.updateOne(UserModel, { emailVerificationToken }, { $unset: { emailVerificationToken: 1, emailVerificationSecret: 1 } });
		throw createErrorResponse(payload?.languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.UNAUTHORIZED);
	}

	const isMatch = await comparePassword(otp, user.emailVerificationSecret);
	if (!isMatch) {
		await dbService.updateOne(UserModel, { emailVerificationToken }, { $inc: { emailVerificationTokenLimit: 1 } });
		if (user.emailVerificationTokenLimit === 2) {
			throw createErrorResponse(payload?.languagePreference, RESPONSE_MESSAGES.TOKEN_EXPIRED_ERROR, ERROR_TYPES.UNAUTHORIZED);
		}
		throw createErrorResponse(payload?.languagePreference, RESPONSE_MESSAGES.INVALID_OTP, ERROR_TYPES.BAD_REQUEST);
	}

	const { token, sessionKey } = generateJWTToken(user._id as string);

	await dbService.updateOne(UserModel, { emailVerificationToken }, { $set: { emailVerifiedAt: new Date(), sessions: sessionKey, isVerified: true, status: USER_STATUS.ACTIVE }, $unset: { emailVerificationToken: 1, emailVerificationSecret: 1, emailVerificationTokenLimit: 1, registerationEmailSentAt: 1 } });
	const data = { email: user.email, token };

	return createSuccessResponse(payload?.languagePreference, RESPONSE_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY, data);
};

/**
 * Update user details with name, date of birth, gender, and latest updates.
 * @param payload
 * @returns
 */
export const updateUserDetails = async (payload: any) => {
	const { deviceToken, deviceVoipToken } = payload;

	if (!payload.user?.isVerified) {
		throw createErrorResponse(payload?.user?.languagePreference || 0, RESPONSE_MESSAGES.USER_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
	}

	const newUser: any = payload;

	if (deviceToken) {
		await dbService.updateMany(UserModel, { deviceToken, _id: { $ne: payload.user._id } }, { $unset: { deviceToken: 1 } });
	}
	if (deviceVoipToken) {
		await dbService.updateMany(UserModel, { deviceVoipToken, _id: { $ne: payload.user._id } }, { $unset: { deviceVoipToken: 1 } });
	}

	let jwtToken: any = { sessionKey: '', token: '' };
	if (payload?.user?.registrationInComplete) {
		jwtToken = generateJWTToken(payload?.user._id as string);
		newUser.sessions = jwtToken.sessionKey;
	}

	const createdUser = await dbService.updateOne(UserModel, { _id: payload.user._id }, { $set: newUser, $unset: { registrationInComplete: 1 } });

	if (!createdUser) {
		throw createErrorResponse(payload?.user?.languagePreference || 0, RESPONSE_MESSAGES.ERROR_REGISTERING_USER, ERROR_TYPES.INTERNAL_SERVER_ERROR);
	}
	if (newUser.sessions) {
		delete newUser['sessions'];
		newUser.token = jwtToken.token;
	}

	return createSuccessResponse(payload?.user?.languagePreference || 0, RESPONSE_MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, newUser);
};

/**
 * Gets a user's details from the database.
 * @param payload
 * @returns
 */
export const getUserDetails = async (payload: any) => {
	const user = await dbService.findOne(UserModel, { _id: payload?.user?._id, ...USER_VALIDATION_CHECK }, { password: 0, googleId: 0, passwordKey: 0, sessions: 0, resetPasswordToken: 0, emailVerificationSecret: 0, emailVerificationToken: 0, emailVerificationTokenLimit: 0, registerationEmailSentAt: 0 });
	if (!user) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
	}

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.DATA_FETCHED_SUCCESSFULLY, user);
};

/**
 * Sets the user's skipTour flag to true.
 * @param payload
 * @returns
 */
export const skipTour = async (payload: any) => {
	const user = await dbService.findOneAndUpdate(UserModel, { _id: payload?.user?._id, ...USER_VALIDATION_CHECK }, { $set: { skipTour: true } }, { new: true });
	if (!user) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
	}
	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.TOUR_SKIPPED_SUCCESSFULLY);
};

/**
 * Updates the user's language preference.
 * @param payload
 * @returns
 */
export const selectLanguage = async (payload: any) => {
	const { languagePreference } = payload;

	const user = await dbService.findOneAndUpdate(UserModel, { _id: payload?.user?._id, ...USER_VALIDATION_CHECK }, { $set: { languagePreference } });
	if (!user) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
	}

	return createSuccessResponse(languagePreference, RESPONSE_MESSAGES.LANGUAGE_UPDATED_SUCCESSFULLY);
};
