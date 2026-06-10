import mongoose, { Schema } from 'mongoose';
import mongooseDelete, { SoftDeleteModel } from 'mongoose-delete';
import { IInvoiceModel } from '../commons/interfaces';

const InvoiceSchema: Schema = new Schema(
	{
		email: { type: String, required: true, index: true },
		amount: { type: Number, required: true },
		currency: { type: String, required: true, default: 'usd' },
		description: { type: String, required: true },
		stripeCustomerId: { type: String },
		stripeInvoiceId: { type: String, index: true },
		status: { type: String, required: true, default: 'draft' },
		hostedInvoiceUrl: { type: String },
		invoicePdfUrl: { type: String },
		invoiceNumber: { type: String }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'invoices'
	}
);

// Apply the soft delete plugin
InvoiceSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all', validateBeforeDelete: false });

// Create the model
const InvoiceModel = mongoose.model<IInvoiceModel>('invoices', InvoiceSchema);
export default InvoiceModel as any as SoftDeleteModel<IInvoiceModel>;
