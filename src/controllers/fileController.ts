'use strict';

import { uploadFile } from '../services/fileUploadService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { ERROR_TYPES, RESPONSE_MESSAGES, UPLOAD_FILE_TYPE } from '../commons/constants';

/**
 * Function to upload file.
 * @param payload
 * @returns
 */
export const uploadSingleFile = async (payload: any) => {
	if (!Object.values(payload.file)?.length) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.FILE_NOT_FOUND, ERROR_TYPES.BAD_REQUEST);
	}

	switch (payload.type) {
		case UPLOAD_FILE_TYPE.USER_PROFILE:
			if (!payload.file.mimetype || !(payload.file.mimetype.startsWith('image/') || payload.file.mimetype.startsWith('video/'))) {
				throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.INVALID_FILE_TYPE, ERROR_TYPES.BAD_REQUEST);
			}
			break;
	}

	const filePath = await uploadFile(payload);

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.FILE_UPLOADED_SUCCESSFULLY, filePath);
};

/**
 * Function to upload file array.
 * @param payload
 * @returns
 */
export const uploadManyFiles = async (payload: any) => {
	const files = [];

	if (!payload.files?.length) {
		throw createErrorResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.FILE_NOT_FOUND, ERROR_TYPES.BAD_REQUEST);
	}

	for (let count = 0; count < payload.files.length; count++) {
		const filePath = await uploadFile({ ...payload, file: payload.files[count], type: payload.type, pathName: payload.pathName });
		files.push(filePath);
	}

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.FILE_UPLOADED_SUCCESSFULLY, { files });
};
