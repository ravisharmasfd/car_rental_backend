type Config = {
	PORT: number | string;
	JWT_SECRET: string | undefined;
	SMTP: any;
	DB: any;
	ADMIN_CRED: any;
	S3_BUCKET: any;
	UPLOAD_TO_S3_BUCKET: boolean;
	PROTOCOL: string;
	HOST: string;
	SERVER_URL: string;
	PATH_TO_UPLOAD_FILES_ON_LOCAL: string;
	SWAGGER_AUTH: any;
	APPLE_KEYS_URL: string;
	CLOUDFRONT_URL: string;
	FILE_BASE_URL: string;
	AI_API_ACCESS_KEY: string;
	DUMMY_DATA_FOR_TRY_ON: boolean;
	DUMMY_DATA_FOR_MEASUREMENT: boolean;
	ZENDESK: {
		ZENDESK_SUBDOMAIN: string;
		ZENDESK_EMAIL: string;
		ZENDESK_API_TOKEN: string;
	};
	OPENAI_API_KEY: string;
	IS_DUMMY_DATA_FOR_GARMENT_ANALYSIS: boolean;
	APN_KEYID: string;
	APN_TEAMID: string;
	IOS_BUNDLE_ID: string;
	AGORA_APP_ID: string;
	AGORA_APP_CERTIFICATE: string;
	WARDROBE_SEARCH_VECTOR_INDEX: string;
};

const config: Config = {
	JWT_SECRET: process.env.JWT_SECRET,
	UPLOAD_TO_S3_BUCKET: process.env.UPLOAD_TO_S3_BUCKET === 'true',
	PATH_TO_UPLOAD_FILES_ON_LOCAL: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL || 'uploads',

	PROTOCOL: process.env.SERVER_PROTOCOL || 'http',
	HOST: process.env.SERVER_HOST || '0.0.0.0',
	PORT: process.env.PORT || 3000,
	get SERVER_URL() {
		return process.env.SERVER_URL || `${this.PROTOCOL}://${this.HOST}:${this.PORT}`;
	},
	SMTP: {
		TRANSPORT: {
			host: process.env.NODEMAILER_HOST || 'node-mailer-host-name',
			port: process.env.NODEMAILER_PORT || 25,
			service: process.env.NODEMAILER_SERVICE,
			auth: {
				user: process.env.NODEMAILER_USER || 'node-mailer-user',
				pass: process.env.NODEMAILER_PASSWORD || 'node-mailer-password'
			},
			secure: true
			// tls: { rejectUnauthorized: true }
		},
		SENDER: process.env.SENDER_EMAIL || 'test.user@yopmail.com'
	},
	ZENDESK: {
		ZENDESK_SUBDOMAIN: process.env.ZENDESK_SUBDOMAIN || 'subdomain',
		ZENDESK_EMAIL: process.env.ZENDESK_EMAIL || 'email',
		ZENDESK_API_TOKEN: process.env.ZENDESK_API_TOKEN || 'api-token'
	},
	S3_BUCKET: {
		region: process.env.S3_REGION || 'region',
		accessKeyId: process.env.S3_ACCESS_KEY_ID || 'access-key-id',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'secret-access-key',
		bucketName: process.env.S3_BUCKET_NAME || 'bucket-name',
		cloudfrontUrl: process.env.CLOUDFRONT_URL || 'cloudfront-url'
	},
	ADMIN_CRED: {
		NAME: process.env.ADMIN_NAME || 'Admin',
		EMAIL: process.env.ADMIN_EMAIL || 'admin@yopmail.com',
		PASSWORD: process.env.ADMIN_PASSWORD || '123456'
	},
	SWAGGER_AUTH: {
		USERNAME: process.env.SWAGGER_AUTH_USERNAME || 'username',
		PASSWORD: process.env.SWAGGER_AUTH_PASSWORD || 'password'
	},
	DB: {
		PROTOCOL: process.env.DB_PROTOCOL || 'mongodb',
		HOST: process.env.DB_HOST || '127.0.0.1',
		PORT: process.env.DB_PORT || 27017,
		NAME: process.env.DB_NAME || 'car-rental-db',
		USER: process.env.DB_USER || '',
		PASSWORD: process.env.DB_PASSWORD || '',
		get DATABASE_URI() {
			return process.env.DATABASE_URI || `${this.PROTOCOL}://${this.HOST}:${this.PORT}/${this.NAME}`;
		}
	},
	APPLE_KEYS_URL: process.env.APPLE_KEYS_URL || 'https://appleid.apple.com/auth/keys',
	CLOUDFRONT_URL: process.env.CLOUDFRONT_URL || 'https://your-cloudfront-url.cloudfront.net',
	FILE_BASE_URL: (process.env.UPLOAD_TO_S3_BUCKET ? process.env.CLOUDFRONT_URL : process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL) || 'https://your-cloudfront-url.cloudfront.net',
	AI_API_ACCESS_KEY: process.env.AI_API_ACCESS_KEY || 'sample-access-key',
	DUMMY_DATA_FOR_TRY_ON: process.env.DUMMY_DATA_FOR_TRY_ON === '1' || false,
	DUMMY_DATA_FOR_MEASUREMENT: process.env.DUMMY_DATA_FOR_MEASUREMENT === '1' || false,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key',
	IS_DUMMY_DATA_FOR_GARMENT_ANALYSIS: process.env.DUMMY_DATA_FOR_GARMENT_ANALYSIS === '1' || false,
	APN_KEYID: process.env.APN_KEY_ID || 'your-apn-keyid',
	APN_TEAMID: process.env.APN_TEAM_ID || 'your-apn-teamid',
	IOS_BUNDLE_ID: process.env.IOS_BUNDLE_ID || 'com.yourcompany.yourapp',
	AGORA_APP_ID: process.env.AGORA_APP_ID || 'your-agora-app-id',
	AGORA_APP_CERTIFICATE: process.env.AGORA_APP_CERTIFICATE || 'your-agora-app-certificate',
	WARDROBE_SEARCH_VECTOR_INDEX: process.env.WARDROBE_SEARCH_VECTOR_INDEX || 'wardrobe_suggestion'
};

export default config;
