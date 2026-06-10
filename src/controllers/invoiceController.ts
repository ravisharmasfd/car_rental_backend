import Stripe from 'stripe';
import InvoiceModel from '../models/invoiceModel';
import dbService from '../services/databaseService';
import { createErrorResponse, createSuccessResponse } from '../commons/responseHelpers';
import { ERROR_TYPES, RESPONSE_MESSAGES, EMAIL_TYPES } from '../commons/constants';
import { sendEmail } from '../utils/commonFunctions';
import config from '../config';

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

/**
 * Create a new invoice in Stripe, finalize it, save locally, and send email.
 * @param payload
 * @returns
 */
export const createAndSendInvoice = async (payload: any) => {
	const { email, amount, description, currency = 'usd' } = payload;

	// 1. Find or create Stripe Customer
	const customers = await stripe.customers.list({ email, limit: 1 });
	let customerId = '';
	if (customers.data.length > 0) {
		customerId = customers.data[0].id;
	} else {
		const customer = await stripe.customers.create({ email });
		customerId = customer.id;
	}

	// 2. Create Stripe Invoice (draft)
	const invoice = await stripe.invoices.create({
		customer: customerId,
		collection_method: 'send_invoice',
		due_date: Math.floor(Date.now() / 1000) + 3600 * 24 * 7, // due in 7 days
		payment_settings: {
			payment_method_types: ['card']
		}
	});

	// 3. Create Invoice Item (price detail) and link to the draft invoice
	await stripe.invoiceItems.create({
		customer: customerId,
		invoice: invoice.id,
		amount: Math.round(amount * 100), // convert to cents
		currency: currency.toLowerCase(),
		description: description
	});

	// 4. Finalize Stripe Invoice to get hosted payment link & pdf
	const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

	// 5. Save local invoice record
	const localInvoice = await dbService.create(InvoiceModel, {
		email,
		amount,
		currency: currency.toLowerCase(),
		description,
		stripeCustomerId: customerId,
		stripeInvoiceId: finalizedInvoice.id,
		status: finalizedInvoice.status || 'open',
		hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url || '',
		invoicePdfUrl: finalizedInvoice.invoice_pdf || '',
		invoiceNumber: finalizedInvoice.number || ''
	});

	// 6. Send email to client
	await sendEmail(
		{
			email,
			amount,
			description,
			hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url,
			currencySymbol: currency.toLowerCase() === 'eur' ? '€' : currency.toLowerCase() === 'gbp' ? '£' : '$'
		},
		EMAIL_TYPES.INVOICE_CREATED
	);

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.INVOICE_CREATED_SUCCESSFULLY, localInvoice);
};

/**
 * Handle Stripe Webhook to process invoice payments.
 * @param payload
 * @returns
 */
export const handleStripeWebhook = async (payload: any) => {
	const { request, response } = payload;
	const sig = request.headers['stripe-signature'];
	const rawBody = request.rawBody;

	if (!sig || !rawBody) {
		return response.status(400).send('Missing signature or raw body');
	}

	let event: any;

	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, config.STRIPE_WEBHOOK_SECRET);
	} catch (err: any) {
		console.error(`Webhook signature verification failed: ${err.message}`);
		return response.status(400).send(`Webhook Error: ${err.message}`);
	}

	try {
		if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
			const stripeInvoice = event.data.object as any;

			// Find and update local invoice status
			const localInvoice = await dbService.findOneAndUpdate(
				InvoiceModel,
				{ stripeInvoiceId: stripeInvoice.id },
				{
					$set: {
						status: 'paid',
						invoicePdfUrl: stripeInvoice.invoice_pdf || ''
					}
				},
				{ new: true }
			);

			if (localInvoice) {
				// Send confirmation email with the paid invoice as PDF attachment
				const currencySymbol = localInvoice.currency === 'eur' ? '€' : localInvoice.currency === 'gbp' ? '£' : '$';

				await sendEmail(
					{
						email: localInvoice.email,
						amount: localInvoice.amount,
						description: localInvoice.description,
						invoiceNumber: localInvoice.invoiceNumber || stripeInvoice.number,
						currencySymbol,
						attachments: stripeInvoice.invoice_pdf
							? [
									{
										filename: `invoice_${localInvoice.invoiceNumber || stripeInvoice.number}.pdf`,
										path: stripeInvoice.invoice_pdf // Nodemailer automatically downloads from URL
									}
								]
							: []
					},
					EMAIL_TYPES.INVOICE_PAID
				);
				console.log(`Payment confirmed and email sent for invoice ${localInvoice.invoiceNumber}`);
			}
		}

		return response.status(200).json({ received: true });
	} catch (error: any) {
		console.error(`Error processing Stripe webhook: ${error.message}`);
		return response.status(500).send(`Internal Server Error: ${error.message}`);
	}
};

export const listInvoices = async (payload: any) => {
	const skip = Number(payload.skip) || 0;
	const limit = Number(payload.limit) || 10;
	const sortKey = payload.sortKey || 'createdAt';
	const sortOrder: 1 | -1 = Number(payload.sortOrder) === 1 ? 1 : -1;

	const aggregatePipeline: any[] = [
		{ $match: { deleted: { $ne: true } } },
		{ $sort: { [sortKey]: sortOrder } },
		{
			$facet: {
				metadata: [{ $count: 'total' }],
				data: [{ $skip: skip }, { $limit: limit }]
			}
		}
	];

	const result = await InvoiceModel.aggregate(aggregatePipeline);
	const data = result[0]?.data || [];
	const total = result[0]?.metadata[0]?.total || 0;

	return createSuccessResponse(payload?.user?.languagePreference, RESPONSE_MESSAGES.INVOICE_FETCHED_SUCCESSFULLY, {
		invoices: data,
		total
	});
};
