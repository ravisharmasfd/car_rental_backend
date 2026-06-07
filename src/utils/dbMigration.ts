'use strict';

import CONFIG from '../config';
import { hashPassword } from './utils';
import dbVersionModel from '../models/dbVersionModel';
import { DATABASE_VERSIONS, USER_ROLE, USER_STATUS } from '../commons/constants';
import userModel from '../models/userModel';

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
};
