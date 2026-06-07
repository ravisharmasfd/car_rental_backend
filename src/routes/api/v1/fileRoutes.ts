import joiUtils from '../../../utils/joiUtils';
import { AVAILABLE_AUTHS, UPLOAD_FILE_TYPE } from '../../../commons/constants';
import { uploadSingleFile, uploadManyFiles } from '../../../controllers/fileController';

const Joi = joiUtils.Joi;

const routes = [
	{
		method: 'POST',
		path: '/v1/file/upload',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Authorization')
			},
			formData: {
				file: Joi.file({ name: 'file', description: 'Single image file' }),
				body: {
					type: Joi.number()
						.valid(...Object.values(UPLOAD_FILE_TYPE))
						.description('File type')
				}
			},
			group: 'File',
			description: 'Route to upload image',
			model: 'UploadFile'
		},
		auth: AVAILABLE_AUTHS.ADMIN_OR_USER,
		handler: uploadSingleFile
	},
	{
		method: 'POST',
		path: '/v1/file/uploadMany',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Authorization')
			},
			formData: {
				fileArray: Joi.fileArray({ name: 'fileArray', description: 'Item file array', maxCount: 99 }),
				body: {
					type: Joi.number()
						.valid(...Object.values(UPLOAD_FILE_TYPE))
						.description('File type')
				}
			},
			group: 'File',
			description: 'Route to upload multiple images.',
			model: 'UploadFiles'
		},
		auth: AVAILABLE_AUTHS.ADMIN_OR_USER,
		handler: uploadManyFiles
	}
];

export default routes;
