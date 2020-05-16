const logger = require('../../logger');
const _ = require('lodash');
const { jStat } = require('jstat');

class AggregateService {
	/**
	 *
	 * @param {*} rawData The data returned from querying database
	 * @param {*} columns Unique columns to perform aggregation on
	 */
	constructor(rawData, columns) {
		this.rawData = rawData;
		this.columns = columns;

		// Holds the data in a key value pair structure. Key holds the name of column.
		// Value holds the data for the corresponding column.
		this.structuredData = {};
	}

	transformRawToStructuredData() {
		this.columns.forEach((column) => {
			this.structuredData[column] = _.map(this.rawData, column);
		});
	}

	processAggregation(aggregationInputs) {
		let aggregatedResult = {};

		this.transformRawToStructuredData();

		aggregationInputs.forEach((aggregationInput) => {
			let columns = aggregationInput.column;
			let aggregates = aggregationInput.aggregate;

			aggregates.forEach((aggregate) => {
				switch (aggregate) {
					// TODO: Add in other aggregation functions
					case 'covariance':
						let convarianceValue = this.processCovariance(columns);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							covariance: convarianceValue,
						};
						break;

					case 'mean':
						let meanValue = this.processMean(columns);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							mean: meanValue,
						};
						break;

					case 'population correlation coefficient':
						let popCorrelationCoefficient = this.processPopulationCorrelationCoefficient(
							columns
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'population correlation coefficient': popCorrelationCoefficient,
						};
						break;

					case 'population standard deviation':
						let popStdDev = this.processPopulationStandardDeviation(columns);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'population standard deviation': popStdDev,
						};
						break;
				}
			});
		});

		return aggregatedResult;
	}

	processCovariance(columns) {
		logger.debug(`performing covariance on ${columns[0]} and ${columns[1]}`);

		let firstSetOfDataToBeAggregated = this.structuredData[columns[0]];
		let secondSetOfDataToBeAggregated = this.structuredData[columns[1]];

		let convarianceValue = jStat.covariance(
			firstSetOfDataToBeAggregated,
			secondSetOfDataToBeAggregated
		);

		return convarianceValue;
	}

	processMean(columns) {
		logger.debug(`performing mean on ${columns[0]}`);

		let dataToBeAggregated = this.structuredData[columns[0]];
		let meanValue = jStat.mean(dataToBeAggregated);

		return meanValue;
	}

	processPopulationCorrelationCoefficient(columns) {
		logger.debug(
			`performing correlation coefficient on ${columns[0]} and ${columns[1]}`
		);

		let firstSetOfDataToBeAggregated = this.structuredData[columns[0]];
		let secondSetOfDataToBeAggregated = this.structuredData[columns[1]];
		let popCorrelationCoefficient = jStat.corrcoeff(
			firstSetOfDataToBeAggregated,
			secondSetOfDataToBeAggregated
		);

		return popCorrelationCoefficient;
	}

	processPopulationStandardDeviation(columns) {
		logger.debug(`performing population standard deviation on ${columns[0]}`);

		let dataToBeAggregated = this.structuredData[columns[0]];
		let popStdDev = jStat.stdev(dataToBeAggregated);

		return popStdDev;
	}
}
module.exports = AggregateService;
