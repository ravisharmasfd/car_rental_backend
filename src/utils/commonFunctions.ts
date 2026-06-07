import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from '../config';
import { EMAIL_CONTENTS, EMAIL_SUBJECTS, EMAIL_TYPES } from '../commons/constants';
import mongoose from 'mongoose';

const transporter = nodemailer.createTransport(config.SMTP.TRANSPORT);

/**
 * function to convert an error into a readable form.
 * @param {} error
 */
export const convertErrorIntoReadableForm = (error: any) => {
	let errorMessage = '';
	if (error.message.indexOf('[') > -1) {
		errorMessage = error.message.substr(error.message.indexOf('['));
	} else {
		errorMessage = error.message;
	}
	errorMessage = errorMessage.replace(/"/g, '');
	errorMessage = errorMessage.replace('[', '');
	errorMessage = errorMessage.replace(']', '');
	error.message = errorMessage;
	return error;
};

/**
 * Send an email to perticular user mail
 * @param {*} email email address
 * @param {*} subject  subject
 * @param {*} content content
 * @param {*} cb callback
 */
export const sendEmail = async (userData: any, type: any) => {
	if (!userData.email) {
		throw new Error('Email is required');
	}
	/** setup email data with unicode symbols **/
	const mailData = emailTypes(userData, type),
		email = userData.email,
		ccEmail = userData.ccEmail,
		bccEmail = userData.bccEmail;

	let template: HandlebarsTemplateDelegate<any> | string = '';
	let result = '';
	if (mailData && mailData.template) {
		handlebars.registerHelper('if_lte', function (this: any, a: number, b: number, opts: any) {
			return a <= b ? opts.fn(this) : opts.inverse(this);
		});

		handlebars.registerHelper('if_gt', function (this: any, a: number, b: number, opts: any) {
			return a > b ? opts.fn(this) : opts.inverse(this);
		});

		template = handlebars.compile(mailData.template);
	}
	if (typeof template === 'function') {
		result = template(mailData.data);
	}

	const emailToSend: any = {
		to: email,
		cc: ccEmail,
		bcc: bccEmail,
		from: config.SMTP.SENDER,
		subject: mailData.Subject
	};

	if (userData.attachments && userData.attachments.length) {
		emailToSend.attachments = userData.attachments;
	}
	if (result) {
		emailToSend.html = result;
	}

	return await transporter.sendMail(emailToSend);
};

const emailTypes = (user: any, type: any) => {
	const EmailStatus: any = {
		Subject: '',
		data: {
			serverUrl: process.env.SERVER_URL || 'https://www.example.xyz',
			frontendUrl: process.env.FRONTEND_URL || 'https://www.example.xyz'
		},
		template: ''
	};

	switch (type) {
	case EMAIL_TYPES.FORGOT_PASSWORD_EMAIL:
		EmailStatus.Subject = EMAIL_SUBJECTS.FORGOT_PASSWORD_EMAIL;
		EmailStatus.template = EMAIL_CONTENTS.FORGOT_PASSWORD_EMAIL;
		EmailStatus.data.otp = user.otp;
		break;
	case EMAIL_TYPES.WELCOME_EMAIL:
		EmailStatus.Subject = EMAIL_SUBJECTS.WELCOME_EMAIL;
		EmailStatus.template = EMAIL_CONTENTS.WELCOME_EMAIL;
		EmailStatus.data.otp = user.otp;
		break;
	case EMAIL_TYPES.REGISTER_COMPLETE:
		EmailStatus.Subject = EMAIL_SUBJECTS.REGISTER_COMPLETE;
		EmailStatus.template = EMAIL_CONTENTS.REGISTER_COMPLETE;
		EmailStatus.data.name = user.name;
		break;
	case EMAIL_TYPES.STAFF_CREDENTIALS:
		EmailStatus.Subject = EMAIL_SUBJECTS.STAFF_CREDENTIALS;
		EmailStatus.template = EMAIL_CONTENTS.STAFF_CREDENTIALS;
		EmailStatus.data.name = user.name;
		EmailStatus.data.email = user.email;
		EmailStatus.data.password = user.password;
		EmailStatus.data.organizationName = user.organizationName;
		EmailStatus.data.hotelName = user.hotelName;
		EmailStatus.data.employeeId = user.employeeId;
		break;
	default:
		EmailStatus.Subject = 'Welcome Email!';
		break;
	}
	return EmailStatus;
};

export const convertIdToMongooseId = (stringId: string) => {
	return new mongoose.Types.ObjectId(stringId);
};
