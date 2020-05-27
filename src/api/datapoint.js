const router = require('express').Router();

const { API_RESPONSE_FILTER_APPLIED } = require('../constants');
const ApiDataPointInputValidator = require('../helpers/ApiDataPointInputValidator');
const { APIErrorHandler } = require('../helpers/apiErrorHandler');
const logger = require('../../logger');
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
			let response = {
				...data,
				[API_RESPONSE_FILTER_APPLIED]: req.body.filter,
			};
			return res.status(200).json(response);
		})
		.catch((err) => {
			logger.error('Query error in /query.');
			logger.error(err);

			let errObj = generateErrorObject(err);

			next(errObj);
		});
});

module.exports = router;
