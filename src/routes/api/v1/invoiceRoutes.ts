import joiUtils from '../../../utils/joiUtils';
import { createAndSendInvoice, handleStripeWebhook, listInvoices } from '../../../controllers/invoiceController';
import { AVAILABLE_AUTHS } from '../../../commons/constants';

const Joi = joiUtils.Joi;

const routes = [
	{
		method: 'POST',
		path: '/v1/stripe/invoice',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Your JWT token.')
			},
			body: {
				email: Joi.string().email().required().description('Customer email address'),
				amount: Joi.number().positive().required().description('Invoice amount (e.g. 150.00)'),
				description: Joi.string().required().description('Invoice description or list of items'),
				currency: Joi.string().optional().default('usd').description('Currency code (usd, eur, gbp)')
			},
			group: 'Invoice',
			description: 'Create a Stripe invoice, finalize it, and email it to the user.',
			model: 'CreateInvoice'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: createAndSendInvoice
	},
	{
		method: 'GET',
		path: '/v1/stripe/invoice',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('Your JWT token.')
			},
			query: {
				skip: Joi.number().integer().min(0).optional().default(0).description('Number of records to skip'),
				limit: Joi.number().integer().min(1).optional().default(10).description('Max number of records to return'),
				sortKey: Joi.string().optional().default('createdAt').description('Key to sort by'),
				sortOrder: Joi.number().valid(1, -1).optional().default(-1).description('Sort order (1 for asc, -1 for desc)')
			},
			group: 'Invoice',
			description: 'Retrieve all invoices.',
			model: 'ListInvoices'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: listInvoices
	},
	{
		method: 'POST',
		path: '/v1/stripe/webhook',
		joiSchemaForSwagger: {
			group: 'Invoice',
			description: 'Stripe webhook endpoint for handling async payment notifications.',
			model: 'StripeWebhook'
		},
		getExactRequest: true,
		notSendResponse: true,
		handler: handleStripeWebhook
	}
];

export default routes;
