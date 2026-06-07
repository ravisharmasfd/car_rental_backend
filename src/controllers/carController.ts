'use strict';

import CarModel from '../models/carModel';
import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { ERROR_TYPES, RESPONSE_MESSAGES } from '../commons/constants';

/**
 * Fetch all active cars from the database.
 * @param payload
 * @returns
 */
export const getCars = async (payload: any) => {
	const cars = await dbService.find(CarModel, { status: 1 });
	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.DATA_FETCHED_SUCCESSFULLY, cars);
};

/**
 * Create a new car in the database. Only admin can call this.
 * @param payload
 * @returns
 */
export const createCar = async (payload: any) => {
	const { name, model, image, passengers, luggage, category, badge, features, description } = payload;

	const newCar = await dbService.create(CarModel, {
		name,
		model,
		image,
		passengers,
		luggage,
		category,
		badge: badge || undefined,
		features,
		description,
		status: 1
	});

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CAR_CREATED_SUCCESSFULLY, newCar);
};

/**
 * Update an existing car by ID. Only admin can call this.
 * @param payload
 * @returns
 */
export const updateCar = async (payload: any) => {
	const { id, name, model, image, passengers, luggage, category, badge, features, description } = payload;

	const updatedCar = await dbService.findOneAndUpdate(
		CarModel,
		{ _id: id },
		{
			$set: {
				name,
				model,
				image,
				passengers,
				luggage,
				category,
				badge: badge || undefined,
				features,
				description
			}
		},
		{ new: true }
	);

	if (!updatedCar) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CAR_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
	}

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CAR_UPDATED_SUCCESSFULLY, updatedCar);
};

/**
 * Soft delete a car by ID. Only admin can call this.
 * @param payload
 * @returns
 */
export const deleteCar = async (payload: any) => {
	const { id } = payload;

	const car = await dbService.findOne(CarModel, { _id: id });
	if (!car) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CAR_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
	}

	await dbService.deleteOne(CarModel, { _id: id });

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.CAR_DELETED_SUCCESSFULLY, {});
};
