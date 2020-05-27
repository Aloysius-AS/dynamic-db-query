const router = require('express').Router();
const _ = require('lodash');

const ApiVectorInputValidator = require('../helpers/ApiVectorInputValidator');
const { API_RESPONSE_FILTER_APPLIED } = require('../constants');
const logger = require('../../logger');
const QueryService = require('../services/QueryService');
const VectorService = require('../services/VectorService');

router.route('/query').get((req, res, next) => {
	const { schema_name, base_table_name, stats, filter } = req.body;

	const apiVectorInputValidator = new ApiVectorInputValidator(
		schema_name,
		base_table_name,
		stats,
		filter
	);
	apiVectorInputValidator.validate();

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
			let result = vectorService.processAggregation(stats);

			let response = {
				...result,
				[API_RESPONSE_FILTER_APPLIED]: req.body.filter,
			};

			return res.status(200).json(response);
		})
		.catch((err) => {
			logger.error('Query error in /vector/query.');
			logger.error(err);

			next(err);
		});
});

module.exports = router;
