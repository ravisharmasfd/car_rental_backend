import joiUtils from '../../../utils/joiUtils';
import { getCars, createCar, updateCar, deleteCar } from '../../../controllers/carController';
import { AVAILABLE_AUTHS } from '../../../commons/constants';

const Joi = joiUtils.Joi;

const routes = [
	{
		method: 'GET',
		path: '/v1/car',
		joiSchemaForSwagger: {
			group: 'Car',
			description: 'Route to get list of all cars in fleet.',
			model: 'GetCarsList'
		},
		handler: getCars
	},
	{
		method: 'POST',
		path: '/v1/car',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Your JWT token.')
			},
			body: {
				name: Joi.string().required().description('Name of the vehicle (e.g., Luxury SUV)'),
				model: Joi.string().required().description('Specific vehicle model (e.g., GMC DENALI)'),
				image: Joi.string().required().uri().description('Image URL of the vehicle'),
				passengers: Joi.number().integer().min(1).required().description('Passenger carrying capacity'),
				luggage: Joi.number().integer().min(0).required().description('Luggage/bag carrying capacity'),
				category: Joi.string().required().valid('sedan', 'suv', 'limo', 'van').description('Vehicle category class'),
				badge: Joi.string().optional().allow('').description('Marketing badge (e.g., Best Value)'),
				features: Joi.array().items(Joi.string()).min(1).required().description('Array of comfort features/amenities'),
				description: Joi.string().required().description('Detailed description of the vehicle')
			},
			group: 'Car',
			description: 'Route to create a new vehicle in fleet (Admin only).',
			model: 'CreateCar'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: createCar
	},
	{
		method: 'PUT',
		path: '/v1/car/:id',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Your JWT token.')
			},
			params: {
				id: Joi.string().required().description('ID of the vehicle to update.')
			},
			body: {
				name: Joi.string().required().description('Name of the vehicle'),
				model: Joi.string().required().description('Specific vehicle model'),
				image: Joi.string().required().uri().description('Image URL of the vehicle'),
				passengers: Joi.number().integer().min(1).required().description('Passenger capacity'),
				luggage: Joi.number().integer().min(0).required().description('Luggage capacity'),
				category: Joi.string().required().valid('sedan', 'suv', 'limo', 'van').description('Vehicle category class'),
				badge: Joi.string().optional().allow('').description('Marketing badge'),
				features: Joi.array().items(Joi.string()).min(1).required().description('Array of features'),
				description: Joi.string().required().description('Detailed description')
			},
			group: 'Car',
			description: 'Route to update a vehicle in fleet by ID (Admin only).',
			model: 'UpdateCar'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: updateCar
	},
	{
		method: 'DELETE',
		path: '/v1/car/:id',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Your JWT token.')
			},
			params: {
				id: Joi.string().required().description('ID of the vehicle to delete.')
			},
			group: 'Car',
			description: 'Route to soft-delete a vehicle in fleet by ID (Admin only).',
			model: 'DeleteCar'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: deleteCar
	}
];

export default routes;
