const Joi = require('@hapi/joi');
const logger = require('../../logger');
const { APIErrorHandler } = require('./apiErrorHandler');
const { TEST_TYPES } = require('../constants');

class ApiTestInputValidator {
	constructor(
		schema_name,
		test_type,
		hypothetical_mean,
		populations_mean_difference,
		equal_variance,
		alternative_hypothesis,
		datasets
	) {
		this.schema_name = schema_name;
		this.test_type = test_type;
		this.hypothetical_mean = hypothetical_mean;
		this.populations_mean_difference = populations_mean_difference;
		this.equal_variance = equal_variance;
		this.alternative_hypothesis = alternative_hypothesis;
		this.datasets = datasets;
		this.clientApiRequestErrorMessage = [];
	}

	validate() {
		const validateBaseSchema = baseValidationSchema.validate({
			schema_name: this.schema_name,
			test_type: this.test_type,
		});

		if (validateBaseSchema.error) {
			return this.generateValidationErrorMessage(
				validateBaseSchema.error.details
			);
		}

		let validateTestSchema = {};

		switch (this.test_type) {
			case TEST_TYPES.F_TEST:
				validateTestSchema = fTestValidationSchema.validate({
					datasets: this.datasets,
				});
				break;
			case TEST_TYPES.ONE_SAMPLE_T_TEST:
				// TODO: Validate for 1 sample t test
				break;
			case TEST_TYPES.TWO_SAMPLE_T_TEST:
				// TODO: Validate for 2 sample t test
				break;
		}

		if (validateTestSchema.error) {
			this.generateValidationErrorMessage(validateTestSchema.error.details);
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
			`Invalid JSON input provided at route /stats/test. The JSON validation errors are `
		);

		throw new APIErrorHandler(
			400,
			'Invalid JSON request',
			this.clientApiRequestErrorMessage
		);
	}
}

const validTestOptions = [
	TEST_TYPES.F_TEST,
	TEST_TYPES.ONE_SAMPLE_T_TEST,
	TEST_TYPES.TWO_SAMPLE_T_TEST,
];

const fTestValidationSchema = Joi.object()
	.keys({
		datasets: Joi.array()
			.items({
				table: Joi.string().required(),
				column: Joi.string().required(),
				filter: Joi.array()
					.items({
						column: Joi.string().trim().required(),
						operator: Joi.string()
							.valid('=', '!=', '>', '>=', '<', '<=', 'contains')
							.required(),
						value: Joi.alternatives(
							Joi.number(),
							Joi.string().trim()
						).required(),
					})
					.required(),
			})
			.min(2)
			.required(),
	})
	.options({ abortEarly: false });

const baseValidationSchema = Joi.object()
	.keys({
		schema_name: Joi.string().trim().required(),
		test_type: Joi.string()
			.valid(...validTestOptions)
			.required(),
	})
	.options({ abortEarly: false });

module.exports = ApiTestInputValidator;
