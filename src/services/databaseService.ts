/* eslint-disable no-unused-vars */
import { Document, FilterQuery, UpdateQuery, QueryOptions, ProjectionType } from 'mongoose';
import { SoftDeleteModel } from 'mongoose-delete';

interface DbService {
	create: <T extends Document>(model: SoftDeleteModel<T>, payload: Partial<T>) => Promise<T>;
	insertMany: <T extends Document>(model: SoftDeleteModel<T>, payload: Partial<T>[]) => Promise<T[]>;
	find: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>, projection?: ProjectionType<T>) => Promise<T[]>;
	findWithDeleted: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>, projection?: ProjectionType<T>) => Promise<T[]>;
	findOne: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>, projection?: ProjectionType<T>) => Promise<T | null>;
	findOneWithDeleted: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>, projection?: ProjectionType<T>) => Promise<T | null>;
	findOneAndUpdate: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>, dataToUpdate: UpdateQuery<T>, options?: QueryOptions) => Promise<T | null>;
	updateOne: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>, payload: Partial<T>) => Promise<T | null>;
	updateMany: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>, dataToUpdate: UpdateQuery<T>) => Promise<void>;
	deleteOne: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>) => Promise<void>;
	deleteMany: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>) => Promise<void>;
	restoreOne: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>) => Promise<void>;
	restoreMany: <T extends Document>(model: SoftDeleteModel<T>, criteria: FilterQuery<T>) => Promise<void>;
}

const dbService: DbService = {
	create: async (model, payload) => {
		return await new model(payload).save();
	},

	insertMany: async (model, payload) => {
		return (await model.insertMany(payload)) as any;
	},

	find: async (model, criteria, projection = {}) => {
		return (await model.find(criteria, projection).lean()) as any;
	},

	findWithDeleted: async (model, criteria, projection = {}) => {
		return (await model.findWithDeleted(criteria, projection).lean()) as any;
	},

	findOne: async (model, criteria, projection = {}) => {
		return (await model.findOne(criteria, projection).lean()) as any;
	},

	findOneWithDeleted: async (model, criteria, projection = {}) => {
		return (await model.findOneWithDeleted(criteria, projection).lean()) as any;
	},

	updateOne: async (model, criteria, payload) => {
		return (await model.updateOne(criteria, payload)) as any;
	},

	updateMany: async (model, criteria, dataToUpdate) => {
		await model.updateMany(criteria, dataToUpdate);
	},

	findOneAndUpdate: async (model, criteria, dataToUpdate, options = { new: true }) => {
		return (await model.findOneAndUpdate(criteria, dataToUpdate, options).lean()) as any;
	},

	deleteOne: async (model, criteria) => {
		await model.delete(criteria);
	},

	deleteMany: async (model, criteria) => {
		await model.deleteMany(criteria);
	},

	restoreOne: async (model, criteria) => {
		await model.restore(criteria);
	},

	restoreMany: async (model, criteria) => {
		await model.restore(criteria);
	}
};

export default dbService;
