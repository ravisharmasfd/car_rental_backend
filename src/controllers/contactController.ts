'use strict';

import ContactModel from '../models/contactModel';
import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { ERROR_TYPES, RESPONSE_MESSAGES, EMAIL_TYPES, CONTACT_STATUS } from '../commons/constants';
import { sendEmail } from '../utils/commonFunctions';
import config from '../config';

/**
 * Save contact/booking form submission in the database, and send confirmation & alert emails.
 * @param payload
 * @returns
 */
export const createContactRequest = async (payload: any) => {
	const { name, email, phone, service, pickupDate, passengers, message } = payload;

	// 1. Create a local contact request in MongoDB
	const contactRequest = await dbService.create(ContactModel, {
		name,
		email,
		phone,
		service,
		pickupDate: pickupDate || undefined,
		passengers: passengers || undefined,
		message,
		status: CONTACT_STATUS.PENDING
	});

	try {
		// 2. Send email to admin
		const adminEmail = process.env.CONTACT_EMAIL || config.SMTP?.SENDER;
		sendEmail(
			{
				email: adminEmail,
				clientEmail: email,
				name,
				phone,
				service,
				pickupDate,
				passengers,
				message: message.replace(/\n/g, '<br/>')
			},
			EMAIL_TYPES.CONTACT_ADMIN_ALERT
		);

		// 3. Send confirmation email to client
		sendEmail(
			{
				email,
				name
			},
			EMAIL_TYPES.CONTACT_USER_CONFIRMATION
		);
	} catch (emailError: any) {
		console.error('Failed to send contact emails:', emailError.message);
		// Do not fail the request if email dispatch fails, as the record is saved
	}

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CONTACT_REQUEST_SUBMITTED_SUCCESSFULLY, contactRequest);
};

/**
 * List contact requests with pagination and status filters. Only admin can call this.
 * @param payload
 * @returns
 */
export const listContactRequests = async (payload: any) => {
	const skip = Number(payload.skip) || 0;
	const limit = Number(payload.limit) || 10;
	const sortKey = payload.sortKey || 'createdAt';
	const sortOrder: 1 | -1 = Number(payload.sortOrder) === 1 ? 1 : -1;
	const status = payload.status;

	const matchStage: any = { deleted: { $ne: true } };
	if (status) {
		matchStage.status = status;
	}

	const aggregatePipeline: any[] = [
		{ $match: matchStage },
		{ $sort: { [sortKey]: sortOrder } },
		{
			$facet: {
				metadata: [{ $count: 'total' }],
				data: [{ $skip: skip }, { $limit: limit }]
			}
		}
	];

	const result = await ContactModel.aggregate(aggregatePipeline);
	const data = result[0]?.data || [];
	const total = result[0]?.metadata[0]?.total || 0;

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CONTACT_REQUEST_FETCHED_SUCCESSFULLY, {
		contacts: data,
		total
	});
};

/**
 * Update the status of a contact request. Only admin can call this.
 * @param payload
 * @returns
 */
export const updateContactStatus = async (payload: any) => {
	const { id, status } = payload;

	const updatedContact = await dbService.findOneAndUpdate(ContactModel, { _id: id }, { $set: { status } }, { new: true });

	if (!updatedContact) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CONTACT_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
	}

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CONTACT_REQUEST_UPDATED_SUCCESSFULLY, updatedContact);
};
