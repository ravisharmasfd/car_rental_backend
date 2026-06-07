import mongoose, { Schema } from 'mongoose';
import mongooseDelete, { SoftDeleteModel } from 'mongoose-delete';
import { ICarModel } from '../commons/interfaces';

const CarSchema: Schema = new Schema(
	{
		name: { type: String, required: true, index: true },
		model: { type: String, required: true },
		image: { type: String, required: true },
		passengers: { type: Number, required: true },
		luggage: { type: Number, required: true },
		category: { type: String, required: true, index: true },
		badge: { type: String },
		features: { type: [String], required: true },
		description: { type: String, required: true },
		status: { type: Number, default: 1 }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'cars'
	}
);

// Apply the soft delete plugin
CarSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all', validateBeforeDelete: false });

// Create the model
const CarModel = mongoose.model<ICarModel>('cars', CarSchema);
export default CarModel as any as SoftDeleteModel<ICarModel>;
