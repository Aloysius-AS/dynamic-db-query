'use strict';

const expect = require('chai').expect;

const StatisticalTestService = require('../../src/services/StatisticalTestService');
let knex = require('../../src//database/queryBuilder');

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
				'f-test',
				null,
				null,
				null,
				null,
				dataset
			);

			let expectedResult = [
				['0.439024389', '0.428571433'],
				['0.340425521', '0.512820542'],
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
});
