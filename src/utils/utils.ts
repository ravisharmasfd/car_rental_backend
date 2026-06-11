import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import admin from 'firebase-admin';
import crypto from 'crypto';
import CONFIG from '../config';
import { SPECIAL_CHARACTERS } from '../commons/constants';
import jwkToPem from 'jwk-to-pem';
// import FIREBASE_SERVICE_KEYS from '../../serviceAccountKey.json';
// import axios from 'axios';
import config from '../config';
import mongoose from 'mongoose';
import { SignedToken } from '../commons/interfaces';
// import apn from 'apn';
// import { log, logError } from './logger';

// Initialize Firebase Admin SDK
// admin.initializeApp({
// 	credential: admin.credential.cert(FIREBASE_SERVICE_KEYS as any)
// });

// const zendeskAuth = Buffer.from(`${config.ZENDESK.ZENDESK_EMAIL}/token:${config.ZENDESK.ZENDESK_API_TOKEN}`).toString('base64');

// const apnProvider = new apn.Provider({
// 	token: {
// 		key: 'frimuspushapikey.p8', // Path to your .p8 file
// 		keyId: config.APN_KEYID,
// 		teamId: config.APN_TEAMID
// 	},
// 	production: false // Set to true for production
// });

/**
 * Send a VoIP push notification to a device.
 *
 * @param deviceVoipToken - The device VoIP token.
 * @param payload - The payload of the notification.
 * @returns The response from the Apple Push Notification service.
 * @throws If the token is not provided.
 */
// export const sendVoipNotification = async (deviceVoipToken: any, payload: any) => {
// 	const notification: any = new apn.Notification();

// 	// VoIP push must use this topic:
// 	notification.topic = `${config.IOS_BUNDLE_ID}.voip`;
// 	notification.pushType = 'voip';
// 	notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
// 	notification.priority = 10;
// 	notification.payload = payload;

// 	apnProvider.send(notification, [ deviceVoipToken ]).then((response) => {
// 		log('Push sent', response.sent);
// 		log('Push failed', response.failed);
// 	});
// };

/**
 * Send a push notification to a device.
 *
 * @param token - The device token.
 * @param title - The title of the notification.
 * @param body - The body of the notification.
 * @param data - Optional data payload.
 * @returns The response from the Firebase Cloud Messaging service.
 * @throws If the token is not provided.
 */
// export const sendPushNotification = async (token: string, title: string, body: string, data?: Record<string, string>) => {
// 	try {
// 		if (!token) throw new Error('Token is required while sending notification');
// 		const message: admin.messaging.Message = {
// 			notification: {
// 				title,
// 				body
// 			},
// 			token, // Device token
// 			data: data || {} // Optional data payload
// 		};
// 		return await admin.messaging().send(message);
// 	} catch (error: any) {
// 		logError('Error sending message:', error.message);
// 		throw error;
// 	}
// };

/**
 * Send a push notification to multiple devices.
 *
 * @param tokens - The array of device tokens.
 * @param title - The title of the notification.
 * @param body - The body of the notification.
 * @param data - Optional data payload.
 * @returns The response from the Firebase Cloud Messaging service.
 * @throws If the tokens are not provided.
 */
// export const sendPushNotificationToMultipleDevices = async (tokens: string[], title: string, body: string, data?: Record<string, string>) => {
// 	try {
// 		if (!tokens) throw new Error('Tokens are required while sending notification');
// 		const message = {
// 			notification: {
// 				title,
// 				body
// 			},
// 			tokens, // Device token
// 			data: data || {} // Optional data payload
// 		};
// 		const response = await admin.messaging().sendEachForMulticast(message);
// 		log('Successfully sent message:', response);
// 		return response;
// 	} catch (error) {
// 		logError('Error sending message:', error);
// 		//   throw error;
// 	}
// };

/**
 * Verifies a Firebase ID token.
 *
 * @param idToken - The ID token to verify.
 * @returns A promise that resolves with the decoded token if verification is successful.
 * @throws An error if the token is invalid or verification fails.
 */

export const verifyFirebaseToken = async (idToken: string) => {
	// return await admin.auth().verifyIdToken(idToken);
	return idToken;
};

// function for facebooksocial login
export const getFacebookUserData = async (accessToken: string) => {
	const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch Facebook user data: ${response.statusText}`);
	}
	return await response.json();
};

// Function to fetch Apple's public key
export const getApplePublicKey = async (kid: any) => {
	const response = await fetch(CONFIG.APPLE_KEYS_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch Apple's public keys: ${response.statusText}`);
	}

	const data = await response.json();
	const key = data.keys.find((k: any) => k.kid === kid);

	if (!key) throw new Error('Public key not found');

	return jwkToPem(key);
};

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, 10);
};

/**
 * Compares a plain text password with a hashed password using bcrypt.
 *
 * @param password - The plain text password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating whether the passwords match.
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
	return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 *
 * @param userId - The ID of the user for whom to generate the token.
 * @returns A JWT as a string.
 */

export const generateJWTToken = (userId: string): SignedToken => {
	const sessionKey = crypto.randomBytes(16).toString('hex') + userId; // 32-char random session key

	const payload = {
		id: userId,
		timestamp: Date.now(),
		sessionKey // special session key to maintain session
	};

	return {
		sessionKey,
		token: jwt.sign(
			payload,
			process.env.JWT_SECRET || 'secret'
			// { expiresIn: '24h' }
		)
	};
};

/**
 * Generates a JSON Web Token (JWT) for a given user ID with a short expiration time of 1 minute.
 *
 * @param userId - The ID of the user for whom to generate the token.
 * @returns A JWT as a string.
 */
export const generateSecuredToken = (): string => {
	const payload = {
		timestamp: Date.now()
	};

	return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

/**
 * Verifies a JSON Web Token (JWT) and returns the decoded payload.
 *
 * @param token - The JWT to verify.
 * @returns The decoded payload.
 * @throws An error if the token is invalid or verification fails.
 */
export const decryptJWTToken = (token: string): any => {
	return jwt.verify(token, process.env.JWT_SECRET || ('secret' as string));
};

/**
 * Generates a random key of specified length with numeric and alphabetic characters in uppercase.
 *
 * @param length - The length of the random key to generate.
 * @returns A random key as a string.
 */
export const generateRandomKey = (length: number = 36): string => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

/**
 * Function to make special searching.
 */
export const makeRegexForSpecialCharacter = (searchQuery = '') => {
	let searchStringForRegex = '';

	for (let i = 0; i < searchQuery.length; i++) {
		if (SPECIAL_CHARACTERS.includes(searchQuery[i])) searchStringForRegex += '\\';
		searchStringForRegex += searchQuery[i];
	}
	return new RegExp(searchStringForRegex);
};

export const generateSecureOTP = (length = 6) => {
	return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
};

/**
 * Generate a random password with specified length
 * Contains uppercase, lowercase, numbers, and special characters
 * @param length - Length of password (default: 12)
 * @returns Random password string
 */
export const generateRandomPassword = (length = 12): string => {
	const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lowercase = 'abcdefghijklmnopqrstuvwxyz';
	const numbers = '0123456789';
	const specialChars = '!@#$%^&*';
	const allChars = uppercase + lowercase + numbers + specialChars;

	let password = '';

	// Ensure at least one character from each category
	password += uppercase[crypto.randomInt(0, uppercase.length)];
	password += lowercase[crypto.randomInt(0, lowercase.length)];
	password += numbers[crypto.randomInt(0, numbers.length)];
	password += specialChars[crypto.randomInt(0, specialChars.length)];

	// Fill the rest randomly
	for (let i = password.length; i < length; i++) {
		password += allChars[crypto.randomInt(0, allChars.length)];
	}

	// Shuffle the password
	return password
		.split('')
		.sort(() => crypto.randomInt(0, 2) - 0.5)
		.join('');
};

// export const getZendeskTickets = async (page = 1, perPage = 10) => {
// 	return await axios.get(`${config.ZENDESK.ZENDESK_SUBDOMAIN}/api/v2/tickets.json?page=${page}&per_page=${perPage}`, {
// 		headers: { Authorization: `Basic ${zendeskAuth}`, 'Content-Type': 'application/json' }
// 	});
// };

// export const getZendeskTicketsCount = async () => {
// 	return await axios.get(`${config.ZENDESK.ZENDESK_SUBDOMAIN}/api/v2/tickets/count.json`, {
// 		headers: { Authorization: `Basic ${zendeskAuth}`, 'Content-Type': 'application/json' }
// 	});
// };

export const urlValidator = (...urls: any) => {
	const result = urls?.find((url: any) => {
		try {
			const urlParsed = new URL(url);
			if (urlParsed.origin !== CONFIG.FILE_BASE_URL) {
				url = '1';
				return true;
			}
			return false;
		} catch {
			url = '2';
			return true;
		}
	});
	if (result) {
		throw new Error('Invalid URL');
	}
	return true;
};

/**
 * Safely converts a value to a Mongoose ObjectId.
 * Returns null if the value is not a valid ObjectId.
 */
export const convertIdToMongooseId = (id: string | mongoose.Types.ObjectId | null | undefined): mongoose.Types.ObjectId | null => {
	if (!id) return null;

	// If already an ObjectId
	if (id instanceof mongoose.Types.ObjectId) return id;

	// If it's a valid ObjectId string
	if (mongoose.Types.ObjectId.isValid(id)) {
		return new mongoose.Types.ObjectId(id);
	}

	return null;
};

/**
 * Replaces all occurrences of specified substrings in a string with their corresponding replacements.
 *
 * @param str - The original string where replacements are to be made.
 * @param replacementArr - An array of objects containing 'base' strings to be replaced and their corresponding 'replacement' strings.
 * @returns The modified string with all specified replacements applied.
 */

export const parseTemplate = (str: string, replacementArray: Array<{ base: string; replacement: string }>) => {
	if (!replacementArray || !replacementArray.length) {
		return str;
	}
	let result = str;
	for (const replacer of replacementArray) {
		result = result.replace(replacer.base, replacer.replacement);
	}
	return result;
};

/**
 * Generates a complete URL for a file, including the secured token required to access the file.
 *
 * @param file - The name of the file to generate a URL for.
 * @returns The complete URL of the file, or undefined if the file name is not provided.
 */
export const generateCompleteFileUrl = (file: string) => {
	if (!file) return undefined;
	return config.SERVER_URL + '/v1/file/' + file + '?securedToken=' + generateSecuredToken();
};

/**
 * Generates a complete URL for a file, without any secured token required to access the file.
 *
 * @param file - The name of the file to generate a URL for.
 * @returns The complete URL of the file, or undefined if the file name is not provided.
 */
export const generateCompleteFileUrlWithOutToken = (file: string) => {
	if (!file) return undefined;
	return config.FILE_BASE_URL + '/' + file;
};

/**
 * Generates a MongoDB aggregation pipeline operator that will generate a complete URL for a file, including the secured token required to access the file.
 *
 * @param path - The path of the file to generate a URL for, or undefined/null if no file is present.
 * @returns An object containing a MongoDB aggregation pipeline operator that will generate the complete URL of the file, or will remove the field if the file path is not provided.
 */
export const generateCompleteFileUrlAggregate = (path: string) => {
	return {
		$cond: {
			if: { $ifNull: [ path, false ] },
			then: { $concat: [ config.SERVER_URL, '/v1/file/', path, '?securedToken=', generateSecuredToken() ] },
			else: '$$REMOVE'
		}
	};
};

/**
 * Generates a MongoDB aggregation pipeline operator that will generate a complete URL for an array of files, including the secured token required to access the files.
 *
 * @param pathKey - The key of the field in the document that contains the array of file paths.
 * @returns An object containing a MongoDB aggregation pipeline operator that will generate the complete URL of the files, or will remove the field if the array is empty or not an array.
 */
export const generateCompleteFileUrlArrayAggregate = (pathKey: string) => {
	return {
		$cond: {
			if: { $and: [ { $isArray: `$${pathKey}` }, { $gt: [ { $size: `$${pathKey}` }, 0 ] } ] },
			then: {
				$map: {
					input: `$${pathKey}`,
					as: 'img',
					in: {
						$concat: [ config.SERVER_URL, '/v1/file/', '$$img', '?securedToken=', generateSecuredToken() ]
					}
				}
			},
			else: '$$REMOVE'
		}
	};
};

export const USER_BASIC_PROJECTION = () => {
	return {
		_id: 1,
		name: 1,
		userName: 1,
		email: 1,
		gender: 1,
		privateAccount: 1,
		description: 1,
		address: 1,
		tags: 1,
		isOnline: 1,
		profilePicture: {
			$cond: {
				if: { $ifNull: [ '$profilePicture', false ] },
				then: { $concat: [ config.SERVER_URL, '/v1/file/', '$profilePicture', '?securedToken=', generateSecuredToken() ] },
				else: '$$REMOVE'
			}
		},
		link: 1
	};
};
