const Joi = require('@hapi/joi');
const logger = require('../../logger');
const { APIErrorHandler } = require('./apiErrorHandler');

class ApiVectorInputValidator {
	/**
	 * @param {String} schema_name Name of database schema
	 * @param {String} base_table_name Name of the base database table to perform query on
	 * @param {Array[JSON]} stats Columns to perform statistical aggregates on
	 * @param {Array[JSON]} filter Details of SQL filter
	 */
	constructor(schema_name, base_table_name, stats, filter) {
		this.schema_name = schema_name;
		this.base_table_name = base_table_name;
		this.stats = stats;
		this.filter = filter;
		this.clientApiRequestErrorMessage = [];
	}

	validate() {
		const validateResult = apiInputValidationSchema.validate({
			schema_name: this.schema_name,
			base_table_name: this.base_table_name,
			stats: this.stats,
			filter: this.filter,
		});

		if (validateResult.error) {
			this.generateValidationErrorMessage(validateResult.error.details);
		}
	}

	generateValidationErrorMessage(validationErrors) {
		validationErrors.forEach((validationError) => {
			this.clientApiRequestErrorMessage.push(validationError.message);
		});

		let jsonErrorMsg = {
			errorType: 'Invalid JSON request',
			errorMessage: this.clientApiRequestErrorMessage,
		};

		logger.info(
			jsonErrorMsg,
			`Invalid JSON input provided at route /stats/vector. The JSON validation errors are `
		);

		throw new APIErrorHandler(
			400,
			'Invalid JSON request',
			this.clientApiRequestErrorMessage
		);
	}
}

const validAggregationOptions = [
	// 'coefficient variation',
	'covariance',
	// 'deviation',
	// 'geomean',
	// 'kurtosis',
	// 'max',
	'mean',
	// 'mean absolute deviation',
	// 'mean squared error',
	// 'median',
	// 'median absolute deviation',
	// 'min',
	// 'mode',
	// 'percentile',
	'population correlation coefficient',
	'population standard deviation',
	// 'population variance',
	// 'product',
	// 'range',
	// 'sample standard deviation',
	// 'sample variance',
	// 'skewness',
	// 'sum',
	// 'sum squared',
	// 'sum squared errors',
];

// abortEarly in options method is for Joi to return all validation errors instead of the 1st error
const apiInputValidationSchema = Joi.object()
	.keys({
		schema_name: Joi.string().trim().required(),
		base_table_name: Joi.string().trim().required(),
		stats: Joi.array()
			.items({
				column: Joi.required().when('aggregate', {
					is: Joi.array().items(
						Joi.string().valid(
							'covariance',
							'population correlation coefficient'
						)
					),
					then: Joi.array().items().length(2), // when aggregate contains 'covariance' or 'population correlation coefficient', then columns must have 2 items
					otherwise: Joi.array().items().length(1), // when aggregate do not contain 'covariance' or 'population correlation coefficient', then columns must have 1 item
				}),
				aggregate: Joi.array()
					.items(Joi.string().valid(...validAggregationOptions))
					.required(),
			})
			.required(),
		filter: Joi.array().items({
			column: Joi.string().trim().required(),
			operator: Joi.string()
				.valid('=', '!=', '>', '>=', '<', '<=', 'contains')
				.required(),
			value: Joi.alternatives(Joi.number(), Joi.string().trim()).required(),
		}),
	})
	.options({ abortEarly: false });

module.exports = ApiVectorInputValidator;
