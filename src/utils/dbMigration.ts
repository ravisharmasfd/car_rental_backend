'use strict';

import CONFIG from '../config';
import { hashPassword } from './utils';
import dbVersionModel from '../models/dbVersionModel';
import { DATABASE_VERSIONS, USER_ROLE, USER_STATUS } from '../commons/constants';
import userModel from '../models/userModel';
import CarModel from '../models/carModel';

/**
 * function to migerate database based on version number.
 */
export const migerateDatabase = async () => {
	let dbVersion = await dbVersionModel.findOne({});

	if (!dbVersion || dbVersion.version < DATABASE_VERSIONS.ONE) {
		const dataToInsert = {
			name: CONFIG.ADMIN_CRED.NAME,
			email: CONFIG.ADMIN_CRED.EMAIL,
			password: await hashPassword(CONFIG.ADMIN_CRED.PASSWORD),
			role: USER_ROLE.ADMIN,
			status: USER_STATUS.ACTIVE,
			isVerified: true
		};

		await new userModel(dataToInsert).save();

		dbVersion = await dbVersionModel.findOneAndUpdate({}, { $set: { version: DATABASE_VERSIONS.ONE } }, { upsert: true, new: true }).lean();
	}

	if (!dbVersion || dbVersion.version < DATABASE_VERSIONS.TWO) {
		const initialCars = [
			{
				name: 'Luxury SUV',
				model: 'GMC DENALI',
				image: 'https://plain-apac-prod-public.komododecks.com/202605/22/syshXQYLzyvAoma7xru8/image.png',
				passengers: 6,
				luggage: 6,
				category: 'suv',
				badge: 'Best Value',
				features: ['Leather Seats', 'Climate Control', 'WiFi', 'USB Charging', 'Entertainment System', 'Extra Legroom'],
				description: 'Spacious luxury SUV ideal for group travel, family airport runs, and executive team transportation.',
				status: 1
			}
		];

		// Seed initial cars
		await CarModel.deleteMany({});
		await CarModel.insertMany(initialCars);

		dbVersion = await dbVersionModel.findOneAndUpdate({}, { $set: { version: DATABASE_VERSIONS.TWO } }, { upsert: true, new: true }).lean();
	}
};
