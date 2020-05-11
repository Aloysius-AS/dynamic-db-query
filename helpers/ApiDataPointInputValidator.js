const Joi = require('@hapi/joi');
const logger = require('../logger');
const { APIErrorHandler } = require('./apiErrorHandler');

class ApiDataPointInputValidator {
	/**
	 * @param {String} schema_name Name of database schema
	 * @param {String} base_table_name Name of the base database table to perform query on
	 * @param {Array[String]} columns Database columns to retrieve
	 * @param {Array[JSON]} join Details of database join
	 * @param {Array[JSON]} filter Details of SQL filter
	 * @param {Array[String]} groupBy Details of grouping
	 * @param {Array[String]} orderBy Details of ordering
	 */
	constructor(
		schema_name,
		base_table_name,
		columns,
		join,
		filter,
		groupBy,
		orderBy
	) {
		this.schema_name = schema_name;
		this.base_table_name = base_table_name;
		this.columns = columns;
		this.join = join;
		this.filter = filter;
		this.groupBy = groupBy;
		this.orderBy = orderBy;
		this.clientApiRequestErrorMessage = [];
	}

	validate() {
		const validateResult = apiInputValidationSchema.validate({
			schema_name: this.schema_name,
			base_table_name: this.base_table_name,
			columns: this.columns,
			join: this.join,
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
			`Invalid JSON input provided at route /pdfImage. The JSON validation errors are `
		);

		throw new APIErrorHandler(
			400,
			'Invalid JSON request',
			this.clientApiRequestErrorMessage
		);
	}
}

// abortEarly in options method is for Joi to return all validation errors instead of the 1st error
const apiInputValidationSchema = Joi.object()
	.keys({
		schema_name: Joi.string().trim().required(),
		base_table_name: Joi.string().trim().required(),
		columns: Joi.optional(),
		join: Joi.array().items({
			join_type: Joi.string()
				.valid('inner join', 'left join', 'right join')
				.required(),
			join_condition: Joi.object().keys({
				base_table_column: Joi.string().trim().required(),
				joined_table: Joi.string().trim().required(),
				joined_table_column: Joi.string().trim().required(),
			}),
		}),
		filter: Joi.array().items({
			column: Joi.string().trim().required(),
			operator: Joi.string()
				.valid('=', '!=', '>', '>=', '<', '<=', 'contains')
				.required(),
			value: Joi.alternatives(Joi.number(), Joi.string().trim()).required(),
		}),
		groupBy: Joi.optional(),
		orderBy: Joi.optional(),
	})
	.options({ abortEarly: false });

module.exports = ApiDataPointInputValidator;
