/**
 * Validates the JSON input during API call.
 *
 * @param {String} schema_name Name of database schema
 * @param {String} base_table_name Name of the base database table to perform query on
 * @param {Array[String]} columns Database columns to retrieve
 * @param {Array[JSON]} join Details of database join
 * @param {Array[JSON]} filter Details of SQL filter
 */

const logger = require('../logger');
const { APIErrorHandler } = require('./apiErrorHandler');

class ApiJsonInputValidator {
	constructor(schema_name, base_table_name, columns, join, filter) {
		this.schema_name = schema_name;
		this.base_table_name = base_table_name;
		this.columns = columns;
		this.join = join;
		this.filter = filter;
		this.clientApiRequestErrorMessage = [];
	}

	validate() {
		this.isSchemaProvided();
		this.isDatabaseTableProvided();
		this.areJoinInputsValid();
		this.areFilterInputsValid();

		if (this.clientApiRequestErrorMessage.length >= 1) {
			this.generateValidationErrorMessage();
		}
	}

	generateValidationErrorMessage() {
		let jsonErrorMsg = {
			errorType: 'Invalid API request option',
			errorMessage: this.clientApiRequestErrorMessage,
		};

		logger.info(
			jsonErrorMsg,
			`Invalid JSON input provided at route /pdfImage. The JSON validation errors are `
		);

		throw new APIErrorHandler(
			400,
			'Invalid API request option',
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

const validateApiJsonInput = (
	schema_name,
	base_table_name,
	columns,
	join,
	filter
) => {
	// TODO: Test robustness of log. Test that errors are logged.

	/////////// Start: Validation of JSON input
	// TODO: Validate the input JSON. Extract in separate file
	// validate is proper JSON
	// validate that fields are provided
	// validate whether the value should be string, array of string/json, digit etc

	let clientApiRequestErrorMessage = [];

	if (!schema_name) {
		clientApiRequestErrorMessage.push('Database schema must be provided.');
	}
	if (!base_table_name) {
		clientApiRequestErrorMessage.push('Database table must be provided.');
	}

	if (join) {
		join.forEach((joinObj) => {
			let acceptableJoinTypes = ['inner join', 'left join', 'right join'];
			if (acceptableJoinTypes.indexOf(joinObj.join_type) == -1) {
				clientApiRequestErrorMessage.push(
					`Join type \'${joinObj.join_type}\' is not a valid input. Acceptable values are: ${acceptableJoinTypes}`
				);
			}
		});
	}

	if (filter) {
		filter.forEach((filterObj) => {
			let acceptableFilterTypes = ['=', '!=', '>', '>=', '<', '<=', 'contains'];
			if (acceptableFilterTypes.indexOf(filterObj.operator) == -1) {
				clientApiRequestErrorMessage.push(
					`Filter operator \'${filterObj.operator}\' is not a valid input. Acceptable values are: ${acceptableFilterTypes}`
				);
			}
		});
	}

	if (clientApiRequestErrorMessage.length >= 1) {
		let jsonErrorMsg = {
			errorType: 'Invalid API request option',
			errorMessage: clientApiRequestErrorMessage,
		};

		logger.info(
			jsonErrorMsg,
			`Invalid JSON input provided at route /pdfImage. The JSON validation errors are `
		);

		throw new APIErrorHandler(
			400,
			'Invalid API request option',
			clientApiRequestErrorMessage
		);
	}
	/////////// End: Validation of JSON input
	return clientApiRequestErrorMessage;
};

module.exports = ApiJsonInputValidator;
