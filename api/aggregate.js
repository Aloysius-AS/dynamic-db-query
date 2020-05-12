const router = require('express').Router();
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

	// const queryServiceInstance = new QueryService(
	// 	schema_name,
	// 	base_table_name,
	// 	columns,
	// 	join,
	// 	filter,
	// 	groupBy,
	// 	orderBy
	// );

	// queryServiceInstance
	// 	.generateSqlQuery()
	// 	.then((data) => {
	// 		return res.status(200).json(data);
	// 	})
	// 	.catch((err) => {
	// 		logger.error('Query error in /aggregate/query.');
	// 		logger.error(err);

	// 		next(err);
	// 	});
});

module.exports = router;
