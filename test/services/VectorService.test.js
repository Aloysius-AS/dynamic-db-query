'use strict';

const expect = require('chai').expect;

const VectorService = require('../../src/services/VectorService');

describe('Generating correct object after aggregation', function () {
	describe('Single column aggregation request', function () {
		let data,
			columns = [];

		beforeEach(function () {
			initData();
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

				expect(result).to.deep.equal({ height: { mean: 1.65 } });
			});
		});

		const initData = () => {
			data = [
				{
					height: 1.8,
					weight: 80,
				},
				{
					height: 1.5,
					weight: 60,
				},
			];

			columns = ['height', 'weight'];
		};
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
