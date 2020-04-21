const Joi = require('@hapi/joi');
const logger = require('../logger');
const { APIErrorHandler } = require('./apiErrorHandler');

class ApiJsonInputValidator {
	/**
	 * @param {String} schema_name Name of database schema
	 * @param {String} base_table_name Name of the base database table to perform query on
	 * @param {Array[String]} columns Database columns to retrieve
	 * @param {Array[JSON]} join Details of database join
	 * @param {Array[JSON]} filter Details of SQL filter
	 */
	constructor(schema_name, base_table_name, columns, join, filter) {
		this.schema_name = schema_name;
		this.base_table_name = base_table_name;
		this.columns = columns;
		this.join = join;
		this.filter = filter;
		this.clientApiRequestErrorMessage = [];
	}

	validate() {
		// TODO: Check that input is a JSON
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

	validate_depreciated() {
		this.isSchemaProvided();
		this.isDatabaseTableProvided();
		this.areJoinInputsValid();
		this.areFilterInputsValid();

		if (this.clientApiRequestErrorMessage.length >= 1) {
			this.generateValidationErrorMessage();
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

	generateValidationErrorMessage_depreciated() {
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

	isSchemaProvided() {
		if (!this.schema_name) {
			this.clientApiRequestErrorMessage.push(
				'Database schema must be provided.'
			);
		}
	}

	isDatabaseTableProvided() {
		if (!this.base_table_name) {
			this.clientApiRequestErrorMessage.push(
				'Database table must be provided.'
			);
		}
	}

	areJoinInputsValid() {
		if (this.join) {
			this.join.forEach((joinObj) => {
				let acceptableJoinTypes = ['inner join', 'left join', 'right join'];
				if (acceptableJoinTypes.indexOf(joinObj.join_type) == -1) {
					this.clientApiRequestErrorMessage.push(
						`Join type \'${joinObj.join_type}\' is not a valid input. Acceptable values are: ${acceptableJoinTypes}`
					);
				}
			});
		}
	}

	areFilterInputsValid() {
		if (this.filter) {
			this.filter.forEach((filterObj) => {
				let acceptableFilterTypes = [
					'=',
					'!=',
					'>',
					'>=',
					'<',
					'<=',
					'contains',
				];
				if (acceptableFilterTypes.indexOf(filterObj.operator) == -1) {
					this.clientApiRequestErrorMessage.push(
						`Filter operator \'${filterObj.operator}\' is not a valid input. Acceptable values are: ${acceptableFilterTypes}`
					);
				}
			});
		}
	}
}

// options is for Joi to return all validation errors instead of the 1st error
const apiInputValidationSchema_depreciated = Joi.object()
	.keys({
		schema_name: Joi.string().trim().required().messages({
			'string.base': `'schema_name' should be a type of 'text'`,
			'any.required': `Database schema, 'schema_name', is required`,
		}),
		base_table_name: Joi.string().trim().required().messages({
			'string.base': `'schema_name' should be a type of 'text'`,
			'any.required': `Database table, 'base_table_name', is required`,
		}),
		columns: Joi.optional(),
		join: Joi.array().items({
			join_type: Joi.string()
				.valid('inner join', 'left join', 'right join')
				.required(),
		}),
	})
	.options({ abortEarly: false });

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
			value: Joi.alternatives(
				Joi.number(),
				Joi.string().alphanum().trim()
			).required(),
		}),
	})
	.options({ abortEarly: false });

module.exports = ApiJsonInputValidator;
