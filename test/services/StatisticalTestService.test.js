'use strict';

const expect = require('chai').expect;
const { jStat } = require('jstat');
const ttest = require('ttest');

const StatisticalTestService = require('../../src/services/StatisticalTestService');
let knex = require('../../src//database/queryBuilder');
const { TEST_TYPES, ALT_HYPOTHESIS_VALUES } = require('../../src/constants');

describe('F-Test (Anova)', function () {
	let statsTestServiceInstance = null;

	beforeEach(async () => {
		await knex.migrate
			.rollback()
			.then(() => knex.migrate.latest())
			.then(() => knex.seed.run())
			.catch((err) => {
				console.log(err);
			});
	});

	after(() => {
		knex.destroy();
	});

	describe('Reading and Parsing data', function () {
		it('Should read and parse data correctly', async function () {
			let dataset = [
				//#region Init data
				{
					table: 'ftest',
					column: 'rwt_m',
					filter: [
						{
							column: 'sex_re',
							operator: '=',
							value: 'male',
						},
						{
							column: 'ef_group',
							operator: '=',
							value: 'HFrEF',
						},
					],
				},
				{
					table: 'ftest',
					column: 'rwt_m',
					filter: [
						{
							column: 'sex_re',
							operator: '=',
							value: 'female',
						},
						{
							column: 'ef_group',
							operator: '=',
							value: 'HFpEF',
						},
					],
				},
				//#endregion
			];

			let statsTestServiceInstance = new StatisticalTestService(
				'public',
				TEST_TYPES.F_TEST,
				null,
				null,
				null,
				null,
				dataset
			);

			let expectedResult = [
				[0.439024389, 0.428571433],
				[0.340425521, 0.512820542],
			];

			let dataParsed = null;

			await statsTestServiceInstance
				.retrieveData()
				.then((dataRetrieved) => {
					dataParsed = statsTestServiceInstance.parseData(dataRetrieved);
				})
				.catch((err) => {
					console.log(err);
				});

			expect(dataParsed).to.deep.equal(expectedResult);
		});
	});

	describe('Calculation', function () {
		it('Should have the same results compared to a 2-sample T-Test', async function () {
			let dataset = [
				//#region Init data
				{
					table: 'ftest',
					column: 'rwt_m',
					filter: [
						{
							column: 'sex_re',
							operator: '=',
							value: 'male',
						},
						{
							column: 'ef_group',
							operator: '=',
							value: 'HFrEF',
						},
					],
				},
				{
					table: 'ftest',
					column: 'rwt_m',
					filter: [
						{
							column: 'sex_re',
							operator: '=',
							value: 'female',
						},
						{
							column: 'ef_group',
							operator: '=',
							value: 'HFpEF',
						},
					],
				},
				//#endregion
			];

			let statsTestServiceInstance = new StatisticalTestService(
				'public',
				TEST_TYPES.F_TEST,
				null,
				null,
				null,
				null,
				dataset
			);

			let pValueFTest,
				pValueTTest,
				dataParsed = null;

			let tTestOptions = {
				mu: 0,
				varEqual: true,
				alpha: 0.05,
				alternative: ALT_HYPOTHESIS_VALUES.NOT_EQUAL,
			};

			await statsTestServiceInstance
				.retrieveData()
				.then((dataRetrieved) => {
					dataParsed = statsTestServiceInstance.parseData(dataRetrieved);
					pValueFTest = jStat.anovaftest(...dataParsed);
				})
				.catch((err) => {
					console.log(err);
				});

			const tTestObj = ttest(...dataParsed, tTestOptions);
			pValueTTest = tTestObj.pValue();

			// just need to compare up to 3 decimal places as p-values are usually good up to 3 decimal places
			expect(pValueFTest.toFixed(3)).to.equal(pValueTTest.toFixed(3));
		});
	});
});
