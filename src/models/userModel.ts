import mongoose, { Schema } from 'mongoose';
import { GENDERS, LANGUAGE, USER_ROLE, USER_STATUS } from '../commons/constants';
import mongooseDelete, { SoftDeleteModel } from 'mongoose-delete';
import { IUserModel } from '../commons/interfaces';

const UserSchema: Schema = new Schema(
	{
		name: { type: String, required: true, index: true },
		email: { type: String, required: true, index: true },
		role: { type: String, default: USER_ROLE.USER, enum: Object.values(USER_ROLE) },
		latestUpdates: { type: Boolean, default: false },
		gender: { type: Number, enum: Object.values(GENDERS) },
		passwordKey: { type: String },
		password: { type: String },
		googleId: { type: String, index: true },
		appleSub: { type: String, index: true },
		facebookId: { type: String, index: true },
		isVerified: { type: Boolean, default: false },
		status: { type: Number, default: USER_STATUS.INACTIVE, enum: Object.values(USER_STATUS) },
		resetPasswordToken: { type: String },
		registerationEmailSentAt: { type: Date },
		emailVerifiedAt: { type: Date },
		emailVerificationToken: { type: String },
		emailVerificationSecret: { type: String },
		emailVerificationTokenLimit: { type: Number },
		forgotPasswordVerificationTokenLimit: { type: Number },
		sessions: { type: String },
		skipTour: { type: Boolean, default: false },
		deviceToken: { type: String },
		languagePreference: { type: Number, enum: Object.values(LANGUAGE), default: LANGUAGE.ENGLISH },
		registrationInComplete: { type: Boolean },
		profilePicture: { type: String },
		deviceVoipToken: { type: String },
		mobileNumber: { type: String, index: true },
		changePassword: { type: Boolean, default: false },
		countryCode: { type: String, index: true }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'users'
	}
);
// Apply the soft delete plugin
UserSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all', validateBeforeDelete: false });

// Create the model with proper typing for soft delete
const UserModel = mongoose.model<IUserModel>('users', UserSchema);
export default UserModel as any as SoftDeleteModel<IUserModel>;
