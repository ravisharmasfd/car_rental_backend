'use strict';

import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

import CONFIG from '../config';
import { UPLOAD_FILE_TYPE } from '../commons/constants';

const s3Client = new S3Client({
	region: CONFIG.S3_BUCKET.region,
	credentials: { accessKeyId: CONFIG.S3_BUCKET.accessKeyId, secretAccessKey: CONFIG.S3_BUCKET.secretAccessKey }
});

/**
 * function to Upload file using File stream pipeline
 */
export const uploadFileToLocal = async (readableFile: any, filePath: any, pathToUpload: any) => {
	if (!fs.existsSync(pathToUpload)) {
		fs.mkdirSync(pathToUpload, { recursive: true });
	}

	const fullFilePath = path.join(pathToUpload, path.basename(filePath));
	const fileWriteStream = fs.createWriteStream(fullFilePath);
	return new Promise((resolve, reject) => {
		fileWriteStream.write(readableFile.file.buffer);
		fileWriteStream.end((err: any) => {
			if (err) {
				reject(err);
			} else {
				// As api gateway will only forward when file is added.
				const fileUrl = `${CONFIG.SERVER_URL}/${filePath}`;
				resolve({ filePath, fileUrl });
			}
		});
	});
};

/**
 * Function to upload file on s3.
 * @param {*} payload
 * @param {*} fileName
 * @param {*} bucketName
 * @returns
 */
export const uploadFileToS3 = async (payload: any, fileName: any) => {
	const command = new PutObjectCommand({
		Bucket: CONFIG.S3_BUCKET.bucketName,
		Key: fileName,
		Body: payload.file.buffer,
		ContentType: payload.file.mimetype
	});

	await s3Client.send(command);
};

/**
 * Fuction to format file details before uploading on server.
 * @param {*} payload
 * @returns
 */
export const uploadFile = async (payload: any) => {
	const fileNameArray = payload.file.originalname.split('.');
	const fileExtention = fileNameArray[fileNameArray.length - 1];
	let filePath = 'user-uploads/',
		fileUrls,
		fileName = `${Date.now()}_${fileNameArray.filter((ele: any) => ele !== fileExtention).join('_')}.${fileExtention}`;

	switch (payload.type) {
		case UPLOAD_FILE_TYPE.USER_PROFILE:
			filePath = 'user-profile/';
			break;
		default:
			filePath = 'other/';
			break;
	}
	if (CONFIG.UPLOAD_TO_S3_BUCKET) {
		fileName = `${payload?.user._id || '0'}/${filePath}${fileName}`;
		await uploadFileToS3(payload, fileName);
		fileUrls = { filePath: fileName, fileUrl: `${CONFIG.S3_BUCKET.cloudfrontUrl}/${fileName}` };
	} else {
		const pathToUpload = path.resolve(__dirname + `../../../${CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL}/${filePath}`);
		fileName = `file/${filePath}${fileName}`;
		fileUrls = await uploadFileToLocal(payload, fileName, pathToUpload);
	}

	return fileUrls;
};

/**
 * Checks if the given file exists in the S3 bucket.
 * @param {string} filePath The path to the file in the S3 bucket.
 * @returns {Promise<boolean>} A promise that resolves to true if the file exists, false otherwise.
 */
export const checkFileExistence = async (filePath: any) => {
	try {
		await s3Client.send(new HeadObjectCommand({ Bucket: CONFIG.S3_BUCKET.bucketName, Key: filePath }));
		return true; // Object exists
	} catch {
		return false;
	}
};

/**
 * Checks if all the given files exists in the S3 bucket.
 * @param {string[]} filePaths The paths to the files in the S3 bucket.
 * @returns {Promise<boolean>} A promise that resolves to true if all the files exist, false otherwise.
 */
export const checkAllFilesExistence = async (filePaths: any) => {
	try {
		const response = await Promise.all(filePaths.map((filePath: any) => checkFileExistence(filePath)));
		let allExist = true;
		response.forEach((exist: any) => {
			if (!exist) {
				allExist = false;
			}
		});
		return allExist;
	} catch {
		return false;
	}
};
