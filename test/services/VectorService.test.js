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
				let stats = {
					column: ['height'],
					aggregate: ['mean'],
				};
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
});
