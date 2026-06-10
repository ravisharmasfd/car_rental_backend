import mongoose, { Schema } from 'mongoose';
import mongooseDelete, { SoftDeleteModel } from 'mongoose-delete';
import { IContactModel } from '../commons/interfaces';
import { CONTACT_STATUS } from '../commons/constants';

const ContactSchema: Schema = new Schema(
	{
		name: { type: String, required: true, index: true },
		email: { type: String, required: true, index: true },
		phone: { type: String, required: true },
		service: { type: String, required: true, index: true },
		pickupDate: { type: String },
		passengers: { type: String },
		message: { type: String, required: true },
		status: {
			type: String,
			default: CONTACT_STATUS.PENDING,
			enum: Object.values(CONTACT_STATUS),
			index: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'contacts'
	}
);

// Apply the soft delete plugin
ContactSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all', validateBeforeDelete: false });

// Create the model with proper typing for soft delete
const ContactModel = mongoose.model<IContactModel>('contacts', ContactSchema);
export default ContactModel as any as SoftDeleteModel<IContactModel>;
