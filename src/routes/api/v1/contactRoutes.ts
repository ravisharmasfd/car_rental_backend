import joiUtils from '../../../utils/joiUtils';
import { createContactRequest, listContactRequests, updateContactStatus } from '../../../controllers/contactController';
import { AVAILABLE_AUTHS, CONTACT_STATUS } from '../../../commons/constants';

const Joi = joiUtils.Joi;

const routes = [
	{
		method: 'POST',
		path: '/v1/contact',
		joiSchemaForSwagger: {
			body: {
				name: Joi.string().required().description('Name of the sender'),
				email: Joi.string().email().required().description('Email address of the sender'),
				phone: Joi.string().required().description('Phone number of the sender'),
				service: Joi.string().required().description('Selected service type'),
				pickupDate: Joi.string().optional().allow('').description('Pickup date (if any)'),
				passengers: Joi.string().optional().allow('').description('Number of passengers (if any)'),
				message: Joi.string().required().description('Message or description of booking request')
			},
			group: 'Contact',
			description: 'Create a new contact request and notify admin & sender.',
			model: 'CreateContactRequest'
		},
		handler: createContactRequest
	},
	{
		method: 'GET',
		path: '/v1/contact',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Your JWT token.')
			},
			query: {
				skip: Joi.number().integer().min(0).optional().default(0).description('Number of records to skip'),
				limit: Joi.number().integer().min(1).optional().default(10).description('Max number of records to return'),
				sortKey: Joi.string().optional().default('createdAt').description('Key to sort by'),
				sortOrder: Joi.number().valid(1, -1).optional().default(-1).description('Sort order (1 for asc, -1 for desc)'),
				status: Joi.string()
					.valid(...Object.values(CONTACT_STATUS))
					.optional()
					.description('Filter by request status')
			},
			group: 'Contact',
			description: 'Retrieve all contact/booking requests (Admin only).',
			model: 'ListContactRequests'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: listContactRequests
	},
	{
		method: 'PUT',
		path: '/v1/contact/:id',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Your JWT token.')
			},
			params: {
				id: Joi.string().required().description('ID of the contact request to update.')
			},
			body: {
				status: Joi.string()
					.valid(...Object.values(CONTACT_STATUS))
					.required()
					.description('New status of the contact request')
			},
			group: 'Contact',
			description: 'Update the status of a contact request by ID (Admin only).',
			model: 'UpdateContactStatus'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: updateContactStatus
	}
];

export default routes;
