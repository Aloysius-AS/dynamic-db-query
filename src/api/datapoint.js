const router = require('express').Router();
const logger = require('../../logger');

const { APIErrorHandler } = require('../helpers/apiErrorHandler');
const ApiDataPointInputValidator = require('../helpers/ApiDataPointInputValidator');
const QueryService = require('../services/QueryService');

function generateErrorObject(err) {
	let errObj = null;
	if (err.message.includes('time_bucket')) {
		const errMessage = err.message;
		errObj = new APIErrorHandler(400, 'Invalid JSON request', errMessage);
	} else {
		errObj = new APIErrorHandler(
			500,
			'Internal server error',
			'Unable to query database'
		);
	}
	return errObj;
}

router.route('/query').get((req, res, next) => {
	const {
		schema_name,
		base_table_name,
		columns,
		join,
		filter,
		groupBy,
		orderBy,
	} = req.body;

	const apiDataPointInputValidator = new ApiDataPointInputValidator(
		schema_name,
		base_table_name,
		columns,
		join,
		filter,
		groupBy,
		orderBy
	);
	apiDataPointInputValidator.validate();

	const queryServiceInstance = new QueryService(
		schema_name,
		base_table_name,
		columns,
		join,
		filter,
		groupBy,
		orderBy
	);

	queryServiceInstance
		.generateSqlQuery()
		.then((data) => {
			//TODO: Return query in response for completeness
			return res.status(200).json(data);
		})
		.catch((err) => {
			logger.error('Query error in /query.');
			logger.error(err);

			let errObj = generateErrorObject(err);

			next(errObj);
		});
});

module.exports = router;
