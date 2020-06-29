const Joi = require('@hapi/joi');

const { APIErrorHandler } = require('./apiErrorHandler');
const {
	VECTOR_AGGREGATION_TYPES,
	VECTOR_AGGREGATION_TYPES_SINGLE_VECTOR_PARAM,
	VECTOR_AGGREGATION_TYPES_DOUBLE_VECTOR_PARAM,
} = require('../constants');
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

const aggregationsWithSingleInput = VECTOR_AGGREGATION_TYPES_SINGLE_VECTOR_PARAM;
const aggregationsWithDoubleInputs = VECTOR_AGGREGATION_TYPES_DOUBLE_VECTOR_PARAM;

/**
 * Checks that all aggregate functions requested by users are
 * within the list of supported aggregation functions which takes in single vector as param
 * @param {*} aggregates
 */
const allSingleInputAggregates = (aggregates) => {
	if (aggregates.length === 0) {
		return false;
	}

	const existsInAggregationsWithSingleInput = aggregates.every((aggregate) =>
		aggregationsWithSingleInput.includes(aggregate)
	);

	return existsInAggregationsWithSingleInput;
};

/**
 * Checks that all aggregate functions requested by users are
 * within the list of supported aggregation functions which takes in 2 vectors as param
 * @param {*} aggregates
 */
const allDoubleInputsAggregates = (aggregates) => {
	if (aggregates.length === 0) {
		return false;
	}

	const existsInAggregationsWithDoubleInput = aggregates.every((aggregate) =>
		aggregationsWithDoubleInputs.includes(aggregate)
	);

	return existsInAggregationsWithDoubleInput;
};

/**
 * Checks that there is at least one aggregate function which takes
 * in single vector as param
 * @param {*} aggregates
 */
const atLeastOneSingleInputAggregate = (aggregates) => {
	if (aggregates.length === 0) {
		return false;
	}

	let atLeastOneAggregationWithSingleInput = aggregates.some((aggregate) =>
		aggregationsWithSingleInput.includes(aggregate)
	);

	return atLeastOneAggregationWithSingleInput;
};

/**
 * Checks that there is at least one aggregate function which takes
 * in two vectors as param
 * @param {*} aggregates
 */
const atLeastOneDoubleInputAggregate = (aggregates) => {
	if (aggregates.length === 0) {
		return false;
	}

	let atLeastOneAggregationWithDoubleInput = aggregates.some((aggregate) =>
		aggregationsWithDoubleInputs.includes(aggregate)
	);

	return atLeastOneAggregationWithDoubleInput;
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
const validateAggregateNotToRequireMixInputTypes = (values, helpers) => {
	const pathObj = helpers.state.path;

	const existsInAggregationsWithSingleInput = atLeastOneSingleInputAggregate(
		values
	);

	const existsInAggregationsWithDoubleInput = atLeastOneDoubleInputAggregate(
		values
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

/**
 * Method to check whether if all the aggregate inputs are from either
 * - aggregation functions that take in a single array parameter, or,
 * - aggregation functions that take in a double array parameters
 */
const validateAggregateToBeFromEitherInputTypes = (values, helpers) => {
	const pathObj = helpers.state.path;

	const existsInAggregationsWithSingleInput = allSingleInputAggregates(values);

	const existsInAggregationsWithDoubleInput = allDoubleInputsAggregates(values);

	if (
		!existsInAggregationsWithSingleInput &&
		!existsInAggregationsWithDoubleInput
	) {
		const validInputs = [
			...aggregationsWithSingleInput,
			...aggregationsWithDoubleInputs,
		];

		validInputs.sort();

		return helpers.message({
			custom: `${pathObj[0]}[${pathObj[1]}].${
				pathObj[2]
			} must be one of [${validInputs.join(', ')}]`,
		});
	}

	return undefined;
};

const validateAggregate = (values, helpers) => {
	const aggregateContainsMixInputTypes = validateAggregateNotToRequireMixInputTypes(
		values,
		helpers
	);

	if (aggregateContainsMixInputTypes) {
		return aggregateContainsMixInputTypes;
	}

	const aggregateNotInBothInputTypes = validateAggregateToBeFromEitherInputTypes(
		values,
		helpers
	);

	if (aggregateNotInBothInputTypes) {
		return aggregateNotInBothInputTypes;
	}

	// Pass custom validation. Return the value unchanged
	return values;
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
							...VECTOR_AGGREGATION_TYPES_DOUBLE_VECTOR_PARAM
						),
						then: Joi.array().items().length(2), // when aggregate contains 'covariance' or 'population correlation coefficient', then columns must have 2 items
					})
					.when('aggregate', {
						is: Joi.array().items(
							...VECTOR_AGGREGATION_TYPES_SINGLE_VECTOR_PARAM
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
