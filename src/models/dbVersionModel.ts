import mongoose, { Schema } from 'mongoose';

const DBVersionSchema: Schema = new Schema(
	{
		version: { type: Schema.Types.Number }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'dbVersion'
	}
);

export default mongoose.model<any>('dbVersion', DBVersionSchema);
