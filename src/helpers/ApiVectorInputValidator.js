const Joi = require('@hapi/joi');

const { APIErrorHandler } = require('./apiErrorHandler');
const { VECTOR_AGGREGATION_TYPES } = require('../constants');
const logger = require('../../logger');

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

const aggregationsWithSingleInput = [
	VECTOR_AGGREGATION_TYPES.COEFFICIENT_VARIATION,
	VECTOR_AGGREGATION_TYPES.DEVIATION,
	VECTOR_AGGREGATION_TYPES.MAX,
	VECTOR_AGGREGATION_TYPES.MEAN,
	VECTOR_AGGREGATION_TYPES.MEDIAN_ABSOLUTE_DEVIATION,
	VECTOR_AGGREGATION_TYPES.MEDIAN,
	VECTOR_AGGREGATION_TYPES.POP_STD_DEV,
	VECTOR_AGGREGATION_TYPES.POPULATION_VARIANCE,
	VECTOR_AGGREGATION_TYPES.SAMPLE_VARIANCE,
	VECTOR_AGGREGATION_TYPES.SKEWNESS,
	VECTOR_AGGREGATION_TYPES.SUM_OF_SQUARED_ERRORS,
];
const aggregationsWithDoubleInputs = [
	VECTOR_AGGREGATION_TYPES.COVARIANCE,
	VECTOR_AGGREGATION_TYPES.POP_CORR_COEFFICIENT,
];

const existsInAggregateRequiringSingleInput = (value) => {
	const existsInAggregationsWithSingleInput = aggregationsWithSingleInput.some(
		(aggregation) => {
			const result = value.includes(aggregation);
			return result;
		}
	);

	return existsInAggregationsWithSingleInput;
};

const existsInAggregateRequiringDoubleInputs = (value) => {
	const existsInAggregationsWithDoubleInput = aggregationsWithDoubleInputs.some(
		(aggregation) => {
			const result = value.includes(aggregation);
			return result;
		}
	);

	return existsInAggregationsWithDoubleInput;
};

/**
 * Aggregate value should not contain aggregation functions that
 * require both single and double vectors.
 *
 * E.g., Mean() requires single vector as input
 * Covariance() requires double vectors as input
 *
 * Aggregate should fail validation when it is ["mean", "covariance"].
 */
const validateAggregateNotToRequireMixInputTypes = (value, helpers) => {
	const pathObj = helpers.state.path;

	const existsInAggregationsWithSingleInput = existsInAggregateRequiringSingleInput(
		value
	);

	const existsInAggregationsWithDoubleInput = existsInAggregateRequiringDoubleInputs(
		value
	);

	if (
		existsInAggregationsWithSingleInput &&
		existsInAggregationsWithDoubleInput
	) {
		return helpers.message({
			custom: `${pathObj[0]}[${pathObj[1]}].${
				pathObj[2]
			} cannot be from both [${aggregationsWithSingleInput.join(
				', '
			)}] and [${aggregationsWithDoubleInputs}]`,
		});
	}

	return undefined;
};

const validateAggregateToBeFromEitherInputTypes = (value, helpers) => {
	const pathObj = helpers.state.path;

	const existsInAggregationsWithSingleInput = existsInAggregateRequiringSingleInput(
		value
	);

	const existsInAggregationsWithDoubleInput = existsInAggregateRequiringDoubleInputs(
		value
	);

	if (
		!existsInAggregationsWithSingleInput &&
		!existsInAggregationsWithDoubleInput
	) {
		const validInputs = [
			...aggregationsWithSingleInput,
			...aggregationsWithDoubleInputs,
		];

		return helpers.message({
			custom: `${pathObj[0]}[${pathObj[1]}].${
				pathObj[2]
			} must be one of [${validInputs.join(', ')}]`,
		});
	}

	return undefined;
};

const validateAggregate = (value, helpers) => {
	const aggregateContainsMixInputTypes = validateAggregateNotToRequireMixInputTypes(
		value,
		helpers
	);

	if (aggregateContainsMixInputTypes) {
		return aggregateContainsMixInputTypes;
	}

	const aggregateNotInBothInputTypes = validateAggregateToBeFromEitherInputTypes(
		value,
		helpers
	);

	if (aggregateNotInBothInputTypes) {
		return aggregateNotInBothInputTypes;
	}

	// Pass custom validation. Return the value unchanged
	return value;
};

const apiInputValidationSchema = Joi.object()
	.keys({
		schema_name: Joi.string().trim().required(),
		base_table_name: Joi.string().trim().required(),
		stats: Joi.array()
			.items({
				column: Joi.required()
					.when('aggregate', {
						is: Joi.array().items(
							VECTOR_AGGREGATION_TYPES.COVARIANCE,
							VECTOR_AGGREGATION_TYPES.POP_CORR_COEFFICIENT
						),
						then: Joi.array().items().length(2), // when aggregate contains 'covariance' or 'population correlation coefficient', then columns must have 2 items
					})
					.when('aggregate', {
						is: Joi.array().items(
							VECTOR_AGGREGATION_TYPES.MEAN,
							VECTOR_AGGREGATION_TYPES.POP_STD_DEV
						),
						then: Joi.array().items().length(1),
					}),
				aggregate: Joi.array()
					.required()
					.custom(validateAggregate, 'validate aggregate key'),
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

	.options({
		// abortEarly has to be true because validation of column property is dependant on aggregate property
		abortEarly: true,
	});

module.exports = ApiVectorInputValidator;
