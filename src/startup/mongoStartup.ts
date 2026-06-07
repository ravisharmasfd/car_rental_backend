import mongoose from 'mongoose';
import config from '../config';
import { log, logError } from '../utils/logger';

const connectToDatabase = async () => {
	try {
		const connectionString = config.DB.DATABASE_URI || 'mongodb://localhost:27017/yourdbname';
		log('Connecting to MongoDB...', connectionString);
		await mongoose.connect(connectionString, {
			serverSelectionTimeoutMS: 30000,
			socketTimeoutMS: 45000
		});
		log('MongoDB connected successfully');
	} catch (error) {
		logError('Error connecting to MongoDB:', error);
		process.exit(1); // Exit the process if unable to connect
	}
};

export default connectToDatabase;
