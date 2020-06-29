'use strict';

const expect = require('chai').expect;

const ApiVectorInputValidator = require('../../src/helpers/ApiVectorInputValidator');
const constants = require('../../src/constants');
const Joi = require('@hapi/joi');

describe('Aggregation Vector Validation', function () {
	let getNamesOfValidAggregateFunctions = () => {
		return `[${Object.values(constants.VECTOR_AGGREGATION_TYPES).join(', ')}]`;
	};

	it('Should inform what are the valid aggregation functions when an empty array is provided', function () {
		let stats = [
			{
				column: ['height'],
				aggregate: [],
			},
		];

		let apiVectorInputValidator = new ApiVectorInputValidator(
			'dummySchema',
			'dummyTable',
			stats,
			null
		);

		let result = null;

		try {
			apiVectorInputValidator.validate();
		} catch (err) {
			result = err;
		}

		let validAggregates = getNamesOfValidAggregateFunctions();

		let expectedResult = {
			errorType: 'Invalid JSON request',
			errorMessage: [`stats[0].aggregate must be one of ${validAggregates}`],
		};

		expect(result.statusCode).to.equal(400);
		expect(result.errorType).to.equal(expectedResult.errorType);
		expect(result.errorMessage.toString()).to.equal(
			expectedResult.errorMessage.toString()
		);
	});

	it('Should inform what are the valid aggregation functions when user inputs unsupported functions for single column request', function () {
		let stats = [
			{
				column: ['height'],
				aggregate: ['min', 'maximum'],
			},
		];

		let apiVectorInputValidator = new ApiVectorInputValidator(
			'dummySchema',
			'dummyTable',
			stats,
			null
		);

		let result = null;

		try {
			apiVectorInputValidator.validate();
		} catch (err) {
			result = err;
		}

		let validAggregates = getNamesOfValidAggregateFunctions();

		let expectedResult = {
			errorType: 'Invalid JSON request',
			errorMessage: [`stats[0].aggregate must be one of ${validAggregates}`],
		};

		expect(result.statusCode).to.equal(400);
		expect(result.errorType).to.equal(expectedResult.errorType);
		expect(result.errorMessage.toString()).to.equal(
			expectedResult.errorMessage.toString()
		);
	});

	it('Should inform what are the valid aggregation functions when user inputs unsupported functions for double columns request', function () {
		let stats = [
			{
				column: ['height', 'weight'],
				aggregate: ['covar', 'population correlation coefficient'],
			},
		];

		let apiVectorInputValidator = new ApiVectorInputValidator(
			'dummySchema',
			'dummyTable',
			stats,
			null
		);

		let result = null;

		try {
			apiVectorInputValidator.validate();
		} catch (err) {
			result = err;
		}

		let validAggregates = getNamesOfValidAggregateFunctions();

		let expectedResult = {
			errorType: 'Invalid JSON request',
			errorMessage: [`stats[0].aggregate must be one of ${validAggregates}`],
		};

		expect(result.statusCode).to.equal(400);
		expect(result.errorType).to.equal(expectedResult.errorType);
		expect(result.errorMessage.toString()).to.equal(
			expectedResult.errorMessage.toString()
		);
	});

	it('Should inform that a single aggregate cannot consists of functions that takes in both single and double vectors as parameter', function () {
		let stats = [
			{
				column: ['height'],
				aggregate: ['min', 'covariance'],
			},
		];

		let apiVectorInputValidator = new ApiVectorInputValidator(
			'dummySchema',
			'dummyTable',
			stats,
			null
		);

		let result = null;

		try {
			apiVectorInputValidator.validate();
		} catch (err) {
			result = err;
		}

		let validAggregates = getNamesOfValidAggregateFunctions();

		let aggregationsWithSingleInput =
			constants.VECTOR_AGGREGATION_TYPES_SINGLE_VECTOR_PARAM;
		let aggregationsWithDoubleInputs =
			constants.VECTOR_AGGREGATION_TYPES_DOUBLE_VECTOR_PARAM;

		let expectedResult = {
			errorType: 'Invalid JSON request',
			errorMessage: [
				`stats[0].aggregate cannot be from both [${aggregationsWithSingleInput.join(
					', '
				)}] and [${aggregationsWithDoubleInputs}]`,
			],
		};

		expect(result.statusCode).to.equal(400);
		expect(result.errorType).to.equal(expectedResult.errorType);
		expect(result.errorMessage.toString()).to.equal(
			expectedResult.errorMessage.toString()
		);
	});

	it('Should inform of extra column when the aggregation functions only require 1 vector array as parameter', function () {
		let stats = [
			{
				column: ['height', 'weight'],
				aggregate: ['min', 'max'],
			},
		];

		let apiVectorInputValidator = new ApiVectorInputValidator(
			'dummySchema',
			'dummyTable',
			stats
		);

		let result = null;

		try {
			apiVectorInputValidator.validate();
		} catch (err) {
			result = err;
		}

		let expectedResult = {
			errorType: 'Invalid JSON request',
			errorMessage: '"stats[0].column" must contain 1 item',
		};

		expect(result.statusCode).to.equal(400);
		expect(result.errorType).to.equal(expectedResult.errorType);
		expect(result.errorMessage.toString()).to.equal(
			expectedResult.errorMessage.toString()
		);
	});

	it('Should inform of missing column when the aggregation functions require 2 vector array as parameter', function () {
		let stats = [
			{
				column: ['height'],
				aggregate: ['covariance', 'population correlation coefficient'],
			},
		];

		let apiVectorInputValidator = new ApiVectorInputValidator(
			'dummySchema',
			'dummyTable',
			stats
		);

		let result = null;

		try {
			apiVectorInputValidator.validate();
		} catch (err) {
			result = err;
		}

		let expectedResult = {
			errorType: 'Invalid JSON request',
			errorMessage: '"stats[0].column" must contain 2 items',
		};

		expect(result.statusCode).to.equal(400);
		expect(result.errorType).to.equal(expectedResult.errorType);
		expect(result.errorMessage.toString()).to.equal(
			expectedResult.errorMessage.toString()
		);
	});
});
