'use strict';

const expect = require('chai').expect;

const VectorService = require('../../src/services/VectorService');

describe('Aggregation Vector', function () {
	let initData = () => {
		return {
			data: [
				{
					height: 1,
					weight: 10,
				},
				{
					height: 2,
					weight: 20,
				},
				{
					height: 3,
					weight: 30,
				},
				{
					height: 4,
					weight: 40,
				},
				{
					height: 5,
					weight: 50,
				},
			],
			columns: ['height', 'weight'],
		};
	};
	describe('Single column aggregation request', function () {
		let data,
			columns = [];

		beforeEach(function () {
			data = initData().data;
			columns = initData().columns;
		});

		describe('Mean', function () {
			it('Should return a single JSON object with the mean property and mean value calculated correctly', function () {
				let stats = [
					{
						column: ['height'],
						aggregate: ['mean'],
					},
				];

				let vectorService = new VectorService(data, columns);
				let result = vectorService.processAggregation(stats);

				expect(result).to.deep.equal({ height: { mean: 3 } });
			});
		});

		describe('Min and Max', function () {
			it('Should return a single JSON object with the min, max property and min, max value calculated correctly', function () {
				let stats = [
					{
						column: ['height'],
						aggregate: ['min', 'max'],
					},
				];

				let vectorService = new VectorService(data, columns);
				let result = vectorService.processAggregation(stats);

				let expectedResult = {
					height: { min: 1, max: 5 },
				};

				expect(result).to.deep.equal(expectedResult);
			});
		});
	});

	describe('Double columns aggregation request', function () {
		let data,
			columns = [];

		beforeEach(function () {
			data = initData().data;
			columns = initData().columns;
		});

		it('Should calculate covariance and population correlation coefficient correctly', function () {
			let stats = [
				{
					column: ['height', 'weight'],
					aggregate: ['covariance', 'population correlation coefficient'],
				},
			];

			let vectorService = new VectorService(data, columns);
			let result = vectorService.processAggregation(stats);

			let expectedResult = {
				'height,weight': {
					covariance: 25,
					'population correlation coefficient': 1,
				},
			};

			expect(result).to.deep.equal(expectedResult);
		});
	});

	describe('Mixed columns aggregation request', function () {
		let data,
			columns = [];

		beforeEach(function () {
			data = initData().data;
			columns = initData().columns;
		});

		it('Should return the correct aggregation object when both single and double columns aggregation requests are requested', function () {
			let stats = [
				{
					column: ['height'],
					aggregate: ['min', 'max'],
				},
				{
					column: ['height', 'weight'],
					aggregate: ['covariance', 'population correlation coefficient'],
				},
			];

			let vectorService = new VectorService(data, columns);
			let result = vectorService.processAggregation(stats);

			let expectedResult = {
				height: { min: 1, max: 5 },
				'height,weight': {
					covariance: 25,
					'population correlation coefficient': 1,
				},
			};

			expect(result).to.deep.equal(expectedResult);
		});
	});

	describe('Dirty data', function () {
		let data,
			columns = [];

		beforeEach(function () {
			initData();
		});
		it('Should not be included for aggregation', function () {
			let stats = [
				{
					column: ['height'],
					aggregate: ['mean'],
				},
				{
					column: ['weight'],
					aggregate: ['mean'],
				},
				{
					column: ['height', 'weight'],
					aggregate: ['covariance'],
				},
			];

			let vectorService = new VectorService(data, columns);
			let result = vectorService.processAggregation(stats);

			let expectedResult = {
				height: { mean: 2 },
				'height,weight': { covariance: 5 },
				weight: { mean: 20 },
			};

			expect(result).to.deep.equal(expectedResult);
		});

		const initData = () => {
			data = [
				{
					height: 1,
					weight: 10,
				},
				{
					height: 2,
					weight: 20,
				},
				{
					height: 3,
					weight: null,
				},
				{
					height: null,
					weight: 30,
				},
			];

			columns = ['height', 'weight'];
		};
	});
});
