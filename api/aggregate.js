const router = require('express').Router();
const _ = require('lodash');
const logger = require('../logger');

const ApiStatInputValidator = require('../helpers/ApiStatInputValidator');
const QueryService = require('../services/QueryService');
const AggregateService = require('../services/AggregateService');

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
			// TODO: Test error handling

			let aggregateService = new AggregateService(data, columns);
			let response = aggregateService.processAggregation(stats);

			return res.status(200).json(response);
		})
		.catch((err) => {
			logger.error('Query error in /aggregate/query.');
			logger.error(err);

			next(err);
		});
});

module.exports = router;
