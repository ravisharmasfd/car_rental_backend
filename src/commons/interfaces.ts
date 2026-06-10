import { Types } from 'mongoose';
import { SoftDeleteDocument } from 'mongoose-delete';
import { ERROR_LOGS_TYPES, GENDERS, LANGUAGE, USER_STATUS } from './constants';
export interface DbConfig {
	PROTOCOL: string;
	HOST: string;
	PORT: number | string;
	NAME: string;
	USER: string;
	PASSWORD: string;
	DATABASE_URI: string;
}

export interface UserUpdateData {
	name: string;
	dob: Date | string;
	gender: number;
	sessions?: string;
	token?: string;
}

export interface SignedToken {
	sessionKey: string;
	token: string;
}

export interface IUserModel extends Document, SoftDeleteDocument {
	_id: Types.ObjectId;
	name: string;
	email: string;
	role: string;
	latestUpdates: boolean;
	gender?: typeof GENDERS;
	passwordKey?: string;
	password?: string;
	googleId?: string;
	appleSub?: string;
	facebookId?: string;
	isVerified: boolean;
	status: typeof USER_STATUS;
	resetPasswordToken?: string;
	registerationEmailSentAt?: Date;
	emailVerifiedAt?: Date;
	emailVerificationToken?: string;
	emailVerificationSecret?: string;
	emailVerificationTokenLimit?: number;
	forgotPasswordVerificationTokenLimit?: number;
	sessions?: string;
	skipTour: boolean;
	deviceToken?: string;
	languagePreference: typeof LANGUAGE;
	registrationInComplete?: boolean;
	profilePicture?: string;
	deviceVoipToken?: string;
	mobileNumber?: string;
	countryCode?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IErrorLogModel extends Document, SoftDeleteDocument {
	_id: Types.ObjectId;
	message: string;
	stackTrace?: string;
	userId?: Types.ObjectId;
	errorType: typeof ERROR_LOGS_TYPES;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface ICarModel extends Document, SoftDeleteDocument {
	_id: Types.ObjectId;
	name: string;
	model: any;
	image: string;
	passengers: number;
	luggage: number;
	category: string;
	badge?: string;
	features: string[];
	description: string;
	status: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IInvoiceModel extends Document, SoftDeleteDocument {
	_id: Types.ObjectId;
	email: string;
	amount: number;
	currency: string;
	description: string;
	stripeCustomerId?: string;
	stripeInvoiceId?: string;
	status: string;
	hostedInvoiceUrl?: string;
	invoicePdfUrl?: string;
	invoiceNumber?: string;
	createdAt?: Date;
	updatedAt?: Date;
}


