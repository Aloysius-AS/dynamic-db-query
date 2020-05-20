const router = require('express').Router();
const _ = require('lodash');
const logger = require('../../logger');

const ApiStatInputValidator = require('../helpers/ApiStatInputValidator');
const QueryService = require('../services/QueryService');
const VectorService = require('../services/VectorService');

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
			let vectorService = new VectorService(data, columns);
			let response = vectorService.processAggregation(stats);

			return res.status(200).json(response);
		})
		.catch((err) => {
			logger.error('Query error in /vector/query.');
			logger.error(err);

			next(err);
		});
});

module.exports = router;
