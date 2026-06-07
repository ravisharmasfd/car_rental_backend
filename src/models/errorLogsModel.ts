import mongoose, { Schema } from 'mongoose';
import { ERROR_LOGS_TYPES } from '../commons/constants';
import mongooseDelete, { SoftDeleteModel } from 'mongoose-delete';
import { IErrorLogModel } from '../commons/interfaces';

const errorLogsSchema: Schema = new Schema(
	{
		message: { type: String, required: true },
		stackTrace: { type: String },
		userId: { type: mongoose.Types.ObjectId, ref: 'users' },
		errorType: { type: Number, required: true, enum: Object.values(ERROR_LOGS_TYPES) }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'errorLogs'
	}
);

// Apply the soft delete plugin
errorLogsSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all', validateBeforeDelete: false });

// Create the model with proper typing for soft delete
const ErrorLogsModel = mongoose.model<IErrorLogModel>('errorLogs', errorLogsSchema);
export default ErrorLogsModel as any as SoftDeleteModel<IErrorLogModel>;
