import joiUtils from '../../../utils/joiUtils';
import { resetPassword, forgotPassword, loginUser, logoutUser, changePassword, registerUserViaEmail, verifyUserEmail, resetPasswordVerify, getUserDetails, skipTour, selectLanguage, updateUserDetails } from '../../../controllers/userController';
import { AVAILABLE_AUTHS, LOGIN_TYPE, REGEX, LANGUAGE, RESPONSE_MESSAGES, USER_TYPES } from '../../../commons/constants';

const Joi = joiUtils.Joi;

const routes = [
	{
		method: 'POST',
		path: '/v1/user/register/email',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().required().lowercase().email().description('Email of the user.'),
				languagePreference: Joi.number()
					.optional()
					.valid(...Object.values(LANGUAGE))
					.default(LANGUAGE.ENGLISH)
					.description('Your Preferred language')
					.error(new Error(RESPONSE_MESSAGES.PLEASE_SELECT_VALID_LANGUAGE)),
				name: Joi.string().required().description('Name of the user.'),
				password: Joi.string().regex(REGEX.PASSWORD).required().description('Password for the user.').error(new Error('Password is not strong enough !')),
				mobileNumber: Joi.string()
					.required()
					.pattern(/^[0-9]{10}$/)
					.description('Mobile number of the user.')
					.error(new Error('Mobile number is not valid !')),
				countryCode: Joi.string()
					.required()
					.pattern(/^\+\d{1,3}$/)
					.description('Country code of the user.')
					.error(new Error('Country code is not valid !')),
				userType: Joi.number()
					.required()
					.valid(...Object.values(USER_TYPES))
					.description('User type of the user.')
			},
			group: 'User',
			description: 'Route to register a new user using email.',
			model: 'RegisterUserEmail'
		},
		handler: registerUserViaEmail
	},
	{
		method: 'POST',
		path: '/v1/user/email/verify',
		joiSchemaForSwagger: {
			body: {
				emailVerificationToken: Joi.string().required().description('Temporary token of the user.'),
				otp: Joi.string().required().description('OTP from email'),
				languagePreference: Joi.number()
					.optional()
					.valid(...Object.values(LANGUAGE))
					.default(LANGUAGE.ENGLISH)
					.description('Your Preferred language')
					.error(new Error(RESPONSE_MESSAGES.PLEASE_SELECT_VALID_LANGUAGE))
			},
			group: 'User',
			description: 'Route to register a new user using email.',
			model: 'UserEmailVerify'
		},
		handler: verifyUserEmail
	},
	{
		method: 'PUT',
		path: '/v1/user',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("Your's JWT token.")
			},
			body: {
				name: Joi.string().required().description('Name of the user.'),
				mobileNumber: Joi.string()
					.optional()
					.pattern(/^[0-9]{10}$/)
					.description('Mobile number of the user.')
					.error(new Error('Mobile number is not valid !')),
				countryCode: Joi.string()
					.optional()
					.pattern(/^\+\d{1,3}$/)
					.description('Country code of the user.')
					.error(new Error('Country code is not valid !')),
				userType: Joi.number()
					.optional()
					.valid(...Object.values(USER_TYPES))
					.description('User type of the user.'),
				deviceToken: Joi.string().optional().description('Device token of the user.'),
				deviceVoipToken: Joi.string().optional().description('Device VoIP token of the user.'),
				profilePicture: Joi.string().optional().description('Profile picture of the user.')
			},
			group: 'User',
			description: 'Route to update new user.',
			model: 'UpdateUserDetails'
		},
		auth: AVAILABLE_AUTHS.USER_WITH_DATA_RELAXATION,
		handler: updateUserDetails
	},
	{
		method: 'POST',
		path: '/v1/user/skipTour',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("Your's JWT token.")
			},
			group: 'User',
			description: 'Route to skip user tour.',
			model: 'skipHelpTour'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: skipTour
	},
	{
		method: 'GET',
		path: '/v1/user/details',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("Your's JWT token.")
			},
			group: 'User',
			description: 'Route to fetch user details.',
			model: 'GetUserDetails'
		},
		auth: AVAILABLE_AUTHS.ADMIN_OR_USER,
		handler: getUserDetails
	},
	{
		method: 'POST',
		path: '/v1/user/login',
		joiSchemaForSwagger: {
			body: {
				deviceToken: Joi.string().optional().description('Device token'),
				deviceVoipToken: Joi.string().optional().description('Device VoIP token of the user.'),
				languagePreference: Joi.number()
					.optional()
					.valid(...Object.values(LANGUAGE))
					.default(LANGUAGE.ENGLISH)
					.description('Your Preferred language')
					.error(new Error(RESPONSE_MESSAGES.PLEASE_SELECT_VALID_LANGUAGE)),
				type: Joi.number().optional().default(LOGIN_TYPE.NORMAL).description('Login type').valid(LOGIN_TYPE.GOOGLE, LOGIN_TYPE.NORMAL, LOGIN_TYPE.APPLE, LOGIN_TYPE.FACEBOOK).error(new Error('type is invalid !')),
				appleToken: Joi.string().when('type', {
					is: LOGIN_TYPE.APPLE,
					then: Joi.required().description('Apple token is required for Apple login'),
					otherwise: Joi.forbidden()
				}),
				googleToken: Joi.string().when('type', {
					is: LOGIN_TYPE.GOOGLE,
					then: Joi.required().description('Google token is required for Google login'),
					otherwise: Joi.forbidden()
				}),
				facebookToken: Joi.string().when('type', {
					is: LOGIN_TYPE.FACEBOOK,
					then: Joi.required().description('Facebook token is required for Social login'),
					otherwise: Joi.forbidden()
				}),
				email: Joi.string()
					.when('type', {
						is: LOGIN_TYPE.NORMAL,
						then: Joi.required().description('Email is required for NORMAL login'),
						otherwise: Joi.forbidden()
					})
					.lowercase(),
				password: Joi.string().when('type', {
					is: LOGIN_TYPE.NORMAL,
					then: Joi.required().description('Password is required for NORMAL login'),
					otherwise: Joi.forbidden()
				})
			},
			group: 'User',
			description: 'Route to login a user.',
			model: 'LoginUser'
		},
		handler: loginUser
	},
	{
		method: 'POST',
		path: '/v1/user/forgotPassword',
		joiSchemaForSwagger: {
			body: {
				languagePreference: Joi.number()
					.optional()
					.valid(...Object.values(LANGUAGE))
					.default(LANGUAGE.ENGLISH)
					.description('Your Preferred language')
					.error(new Error(RESPONSE_MESSAGES.PLEASE_SELECT_VALID_LANGUAGE)),
				email: Joi.string().required().email().description('Email of the user.')
			},
			group: 'User',
			description: 'Route to initiate forgot password process.',
			model: 'ForgotPassword'
		},
		handler: forgotPassword
	},
	{
		method: 'POST',
		path: '/v1/user/forgotPassword/verify',
		joiSchemaForSwagger: {
			body: {
				languagePreference: Joi.number()
					.optional()
					.valid(...Object.values(LANGUAGE))
					.default(LANGUAGE.ENGLISH)
					.description('Your Preferred language')
					.error(new Error('Language is not valid')),
				resetToken: Joi.string().required().description('Temporary token of the user.'),
				otp: Joi.string().required().description('OTP from email')
			},
			group: 'User',
			description: 'Route to initiate forgot password process.',
			model: 'ForgotPasswordVerify'
		},
		handler: resetPasswordVerify
	},
	{
		method: 'POST',
		path: '/v1/user/resetPassword',
		joiSchemaForSwagger: {
			body: {
				languagePreference: Joi.number()
					.optional()
					.valid(...Object.values(LANGUAGE))
					.default(LANGUAGE.ENGLISH)
					.description('Your Preferred language')
					.error(new Error('Language is not valid')),
				resetPasswordToken: Joi.string().required().description('Reset token for changing the password.'),
				newPassword: Joi.string().regex(REGEX.PASSWORD).required().description('New password for the user.').error(new Error('Password is not strong enough !'))
			},
			group: 'User',
			description: 'Route to reset the password for a user.',
			model: 'UserResetPassword'
		},
		handler: resetPassword
	},
	{
		method: 'POST',
		path: '/v1/user/changePassword',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("Your's JWT token.")
			},
			body: {
				oldPassword: Joi.string().required().description('Old password for the user.'),
				newPassword: Joi.string().regex(REGEX.PASSWORD).required().description('New password for the user.').error(new Error('Password is not strong enough !'))
			},
			group: 'User',
			description: 'Route to changed the password for a user.',
			model: 'UserChangePassword'
		},
		auth: AVAILABLE_AUTHS.ADMIN_OR_USER,
		handler: changePassword
	},
	{
		method: 'POST',
		path: '/v1/user/logout',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("Your's JWT token.")
			},
			group: 'User',
			description: 'Route to logout a user.',
			model: 'LogoutUser'
		},
		auth: AVAILABLE_AUTHS.ADMIN_OR_USER,
		handler: logoutUser
	},
	{
		method: 'PUT',
		path: '/v1/user/selectLanguage',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("Your's JWT token.")
			},
			body: {
				languagePreference: Joi.number()
					.required()
					.valid(...Object.values(LANGUAGE))
					.description('Your Preferred language')
					.error(new Error(RESPONSE_MESSAGES.PLEASE_SELECT_VALID_LANGUAGE))
			},
			group: 'User',
			description: 'Route to select the Language',
			model: 'UserSelectLanguage'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: selectLanguage
	}
];

export default routes;
