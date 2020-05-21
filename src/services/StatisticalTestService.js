const _ = require('lodash');
const { jStat } = require('jstat');

const logger = require('../../logger');
const { TEST_TYPES } = require('../constants');
const QueryService = require('./QueryService');

class StatisticalTestService {
	//TODO: Create the test for this service
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
		this.datasetQueries = datasets;
		this.clientApiRequestErrorMessage = [];
	}

	async runTest() {
		switch (this.test_type) {
			case TEST_TYPES.F_TEST:
				let pValue = await this.runFTest_Anova();
				let result = { 'p-value': pValue };
				return result;

			case TEST_TYPES.ONE_SAMPLE_T_TEST:
				break;

			case TEST_TYPES.TWO_SAMPLE_T_TEST:
				break;
		}
	}

	async runFTest_Anova() {
		let dataRetrieved = await this.retrieveData();
		let dataParsed = [];

		dataRetrieved.forEach((dataArray) => {
			let columnName = Object.keys(dataArray[0])[0];
			dataParsed.push(_.map(dataArray, columnName));
		});

		let pValue = jStat.anovaftest(...dataParsed);
		return pValue;
	}

	async retrieveData() {
		let dataRetrieved = [];

		for (const datasetQuery of this.datasetQueries) {
			let column = [];

			// need to transform column to array of string because QueryService.columns expect array of string
			if (typeof datasetQuery.column === 'string') {
				column.push(datasetQuery.column);
			} else {
				column = datasetQuery.column;
			}

			const queryServiceInstance = new QueryService(
				this.schema_name,
				datasetQuery.table,
				column,
				null,
				datasetQuery.filter
			);

			let data = await queryServiceInstance.generateSqlQuery();
			dataRetrieved.push(data);
		}

		return dataRetrieved;
	}
}

module.exports = StatisticalTestService;
