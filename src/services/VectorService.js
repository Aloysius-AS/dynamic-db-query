const _ = require('lodash');
const { jStat } = require('jstat');

const { VECTOR_AGGREGATION_TYPES } = require('../constants');
const logger = require('../../logger');

class VectorService {
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
		// Data stored here have not been cleanse yet.
		this.structuredData = {};
	}

	transformRawToStructuredData() {
		this.columns.forEach((column) => {
			this.structuredData[column] = _.map(this.rawData, column);
		});
	}

	/**
	 * Loop through each data column and clean it individually.
	 */
	cleanDataByIndividualColumn() {
		let cleanData = {};

		for (const propertyName in this.structuredData) {
			let property = this.structuredData[propertyName];

			cleanData[propertyName] = property.filter(function (el) {
				return el !== null && el !== '' && el !== undefined;
			});
		}

		return cleanData;
	}

	/**
	 * Method to clean data by columns that are paired.
	 * If at least one of the row in the column is empty or null, this row and the corresponding row
	 * in the paired column would be deleted.
	 */
	cleanDataByPairedColumns(firstColumnName, secondColumnName) {
		let dataFirstColumn = Array.from(this.structuredData[firstColumnName]);
		let dataSecondColumn = Array.from(this.structuredData[secondColumnName]);

		if (dataFirstColumn.length != dataSecondColumn.length) {
			throw `Length of data for column ${firstColumnName} and ${secondColumnName} are not the same.`;
		}

		for (let i = 0; i < dataFirstColumn.length; i++) {
			let isFirstColumnDirty =
				dataFirstColumn[i] == null ||
				dataFirstColumn[i] == '' ||
				dataFirstColumn[i] == undefined;

			let isSecondColumnDirty =
				dataSecondColumn[i] == null ||
				dataSecondColumn[i] == '' ||
				dataSecondColumn[i] == undefined;

			if (isFirstColumnDirty || isSecondColumnDirty) {
				dataFirstColumn.splice(i, 1);
				dataSecondColumn.splice(i, 1);
			}
		}

		return {
			[firstColumnName]: dataFirstColumn,
			[secondColumnName]: dataSecondColumn,
		};
	}

	processAggregation(aggregationInputs) {
		let aggregatedResult = {};

		this.transformRawToStructuredData();
		let cleanDataIndividualColumn = this.cleanDataByIndividualColumn();

		aggregationInputs.forEach((aggregationInput) => {
			let columns = aggregationInput.column;
			let aggregates = aggregationInput.aggregate;

			let cleanDataPairedColumns = {};
			if (columns.length === 2) {
				cleanDataPairedColumns = this.cleanDataByPairedColumns(
					columns[0],
					columns[1]
				);
			}

			aggregates.forEach((aggregate) => {
				switch (aggregate) {
					// TODO: Add in other aggregation functions
					case VECTOR_AGGREGATION_TYPES.COEFFICIENT_VARIATION:
						let coefficientOfVariationValue = this.processCoefficientOfVariation(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'coefficient of variation': coefficientOfVariationValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.COVARIANCE:
						let convarianceValue = this.processCovariance(
							columns,
							cleanDataPairedColumns
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							covariance: convarianceValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.DEVIATION:
						let deviationValue = this.processDeviation(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							deviation: deviationValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.MAX:
						let maxValue = this.processMax(columns, cleanDataIndividualColumn);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							max: maxValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.MEAN:
						let meanValue = this.processMean(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							mean: meanValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.MEDIAN:
						let medianValue = this.processMedian(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							median: medianValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.MEDIAN_ABSOLUTE_DEVIATION:
						let medianAbsoluteDeviationValue = this.processMedianAbsoluteDeviation(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'median absolute deviation': medianAbsoluteDeviationValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.POP_CORR_COEFFICIENT:
						let popCorrelationCoefficient = this.processPopulationCorrelationCoefficient(
							columns,
							cleanDataPairedColumns
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'population correlation coefficient': popCorrelationCoefficient,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.POP_STD_DEV:
						let popStdDev = this.processPopulationStandardDeviation(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'population standard deviation': popStdDev,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.POPULATION_VARIANCE:
						let populationVarianceValue = this.processPopulationVariance(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'population variance': populationVarianceValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.SAMPLE_VARIANCE:
						let sampleVarianceValue = this.processSampleVariance(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'sample variance': sampleVarianceValue,
						};
						break;

					case VECTOR_AGGREGATION_TYPES.SUM_OF_SQUARED_ERRORS:
						let sumOfSquaredErrorsValue = this.processSumOfSquaredErrors(
							columns,
							cleanDataIndividualColumn
						);
						aggregatedResult[columns] = {
							...aggregatedResult[columns],
							'sum of squared errors': sumOfSquaredErrorsValue,
						};
						break;
				}
			});
		});

		return aggregatedResult;
	}

	processCoefficientOfVariation(columns, data) {
		logger.debug(`performing coefficient of variation on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let result = jStat.coeffvar(dataToBeAggregated);

		return result;
	}

	processCovariance(columns, data) {
		logger.debug(`performing covariance on ${columns[0]} and ${columns[1]}`);

		let firstSetOfDataToBeAggregated = data[columns[0]];
		let secondSetOfDataToBeAggregated = data[columns[1]];

		let convarianceValue = jStat.covariance(
			firstSetOfDataToBeAggregated,
			secondSetOfDataToBeAggregated
		);

		return convarianceValue;
	}

	processDeviation(columns, data) {
		logger.debug(`performing deviation on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let result = jStat.deviation(dataToBeAggregated);

		return result;
	}

	processMax(columns, data) {
		logger.debug(`performing max on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let result = jStat.max(dataToBeAggregated);

		return result;
	}

	processMean(columns, data) {
		logger.debug(`performing mean on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let meanValue = jStat.mean(dataToBeAggregated);

		return meanValue;
	}

	processMedian(columns, data) {
		logger.debug(`performing median on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let result = jStat.median(dataToBeAggregated);

		return result;
	}

	processMedianAbsoluteDeviation(columns, data) {
		logger.debug(`performing median absolute deviation on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let result = jStat.meddev(dataToBeAggregated);

		return result;
	}

	processPopulationCorrelationCoefficient(columns, data) {
		logger.debug(
			`performing correlation coefficient on ${columns[0]} and ${columns[1]}`
		);

		let firstSetOfDataToBeAggregated = data[columns[0]];
		let secondSetOfDataToBeAggregated = data[columns[1]];
		let popCorrelationCoefficient = jStat.corrcoeff(
			firstSetOfDataToBeAggregated,
			secondSetOfDataToBeAggregated
		);

		return popCorrelationCoefficient;
	}

	processPopulationStandardDeviation(columns, data) {
		logger.debug(`performing population standard deviation on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let popStdDev = jStat.stdev(dataToBeAggregated);

		return popStdDev;
	}

	processPopulationVariance(columns, data) {
		logger.debug(`performing population variance on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let result = jStat.variance(dataToBeAggregated);

		return result;
	}

	processSampleVariance(columns, data) {
		logger.debug(`performing sample variance on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let sampleVarianceValue = jStat.variance(dataToBeAggregated, true);

		return sampleVarianceValue;
	}

	processSumOfSquaredErrors(columns, data) {
		logger.debug(`performing sum of squared errors on ${columns[0]}`);

		let dataToBeAggregated = data[columns[0]];
		let result = jStat.sumsqerr(dataToBeAggregated);

		return result;
	}
}
module.exports = VectorService;
