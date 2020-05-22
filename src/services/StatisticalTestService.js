const _ = require('lodash');
const { jStat } = require('jstat');
const ttest = require('ttest');

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
		let pValue,
			result,
			resultObj = null;

		switch (this.test_type) {
			case TEST_TYPES.F_TEST:
				pValue = await this.runFTest_Anova();
				result = { 'p-value': pValue };
				return result;

			case TEST_TYPES.ONE_SAMPLE_T_TEST:
				resultObj = await this.runOneSampleTTest();
				result = { 'p-value': resultObj.pValue() };
				return result;

			case TEST_TYPES.TWO_SAMPLE_T_TEST:
				resultObj = await this.runTwoSampleTest();
				result = { 'p-value': resultObj.pValue() };
				return result;
		}
	}

	async runFTest_Anova() {
		let dataRetrieved = await this.retrieveData();
		let dataParsed = this.parseData(dataRetrieved);

		let pValue = jStat.anovaftest(...dataParsed);
		return pValue;
	}

	async runOneSampleTTest() {
		let dataRetrieved = await this.retrieveData();
		let dataParsed = this.parseData(dataRetrieved);

		let tTestOptions = {
			mu: this.hypothetical_mean,
			varEqual: false,
			alpha: 0.05,
			alternative: this.alternative_hypothesis,
		};

		const resultObj = ttest(...dataParsed, tTestOptions);

		return resultObj;
	}

	async runTwoSampleTest() {
		let dataRetrieved = await this.retrieveData();
		let dataParsed = this.parseData(dataRetrieved);

		let tTestOptions = {
			mu: this.populations_mean_difference,
			varEqual: JSON.parse(this.equal_variance),
			alpha: 0.05,
			alternative: this.alternative_hypothesis,
		};

		const resultObj = ttest(...dataParsed, tTestOptions);

		return resultObj;
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

	parseData(data) {
		let dataParsed = [];

		data.forEach((dataArray) => {
			let columnName = Object.keys(dataArray[0])[0];
			dataParsed.push(_.map(dataArray, columnName));
		});

		// remove elements that are null, '' or undefined
		for (let i = 0; i < dataParsed.length; i++) {
			dataParsed[i] = dataParsed[i].filter(function (el) {
				return el !== null && el !== '' && el !== undefined;
			});
		}

		return dataParsed;
	}
}

module.exports = StatisticalTestService;
