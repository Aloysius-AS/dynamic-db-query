const router = require('express').Router();
const _ = require('lodash');
const { jStat } = require('jstat');
const logger = require('../logger');

const ApiStatInputValidator = require('../helpers/ApiStatInputValidator');
const QueryService = require('../services/QueryService');

router.route('/query').get((req, res, next) => {
	const { schema_name, base_table_name, stats, filter } = req.body;

	const apiStatInputValidator = new ApiStatInputValidator(
		schema_name,
		base_table_name,
		stats,
		filter
	);
	apiStatInputValidator.validate();

	// get unique values from the array of stats.column
	let columns = _.spread(_.union)(_.map(stats, 'column'));

	const queryServiceInstance = new QueryService(
		schema_name,
		base_table_name,
		columns,
		null,
		filter
	);

	queryServiceInstance
		.generateSqlQuery()
		.then((data) => {
			// TODO: Need to refactor this processing into another service layer which returns result
			// TODO: Test error handling

			let response = {};

			// transform the data into key value pairs
			// key = name of column
			// value = array containing the data for column
			let structuredData = {};
			columns.forEach((column) => {
				structuredData[column] = _.map(data, column);
			});

			stats.forEach((element) => {
				let columns = element.column;
				let aggregates = element.aggregate;

				aggregates.forEach((aggregate) => {
					let dataToBeAggregated,
						firstSetOfDataToBeAggregated,
						secondSetOfDataToBeAggregated = [];

					switch (aggregate) {
						// TODO: Add in other aggregation functions
						case 'covariance':
							logger.debug(
								`performing covariance on ${columns[0]} and ${columns[1]}`
							);
							firstSetOfDataToBeAggregated = structuredData[columns[0]];
							secondSetOfDataToBeAggregated = structuredData[columns[1]];
							let convarianceValue = jStat.covariance(
								firstSetOfDataToBeAggregated,
								secondSetOfDataToBeAggregated
							);
							response[columns] = {
								...response[columns],
								covariance: convarianceValue,
							};
							break;

						case 'mean':
							logger.debug(`performing mean on ${columns[0]}`);
							dataToBeAggregated = structuredData[columns[0]];
							let meanValue = jStat.mean(dataToBeAggregated);
							response[columns] = {
								...response[columns],
								mean: meanValue,
							};
							break;

						case 'population correlation coefficient':
							logger.debug(
								`performing correlation coefficient on ${columns[0]} and ${columns[1]}`
							);
							firstSetOfDataToBeAggregated = structuredData[columns[0]];
							secondSetOfDataToBeAggregated = structuredData[columns[1]];
							let popCorrelationCoefficient = jStat.corrcoeff(
								firstSetOfDataToBeAggregated,
								secondSetOfDataToBeAggregated
							);
							response[columns] = {
								...response[columns],
								'population correlation coefficient': popCorrelationCoefficient,
							};
							break;

						case 'population standard deviation':
							logger.debug(
								`performing population standard deviation on ${columns[0]}`
							);
							dataToBeAggregated = structuredData[columns[0]];
							let popStdDev = jStat.stdev(dataToBeAggregated);
							response[columns] = {
								...response[columns],
								'population standard deviation': popStdDev,
							};
							break;
					}
				});
			});

			return res.status(200).json(response);
		})
		.catch((err) => {
			logger.error('Query error in /aggregate/query.');
			logger.error(err);

			next(err);
		});
});

module.exports = router;
