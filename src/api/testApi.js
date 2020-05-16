const router = require('express').Router();
const logger = require('../../logger');
const connectionPool = require('../database/connectionPool');

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

router.route('/circleData').get((req, res) => {
	try {
		logger.info('Triggered /circleData');

		connectionPool.query(
			'SELECT "circleColumn" FROM mock.query',
			(err, dbResponse) => {
				if (err) {
					return res.status(400).json('Error occurred while querying database');
				}

				let something = false;
				if (something) {
					return res.status(400).json('circleData route return error');
				} else {
					return res.status(200).json(dbResponse.rows);
				}
			}
		);
	} catch (e) {
		logger.error(e);
	}
});

router.route('/pdfImage').get((req, res, next) => {
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
			return res.status(200).json(data);
		})
		.catch((err) => {
			logger.error('Query error in /pdfimage.');
			logger.error(err);

			let errObj = generateErrorObject(err);

			next(errObj);
		});
});

module.exports = router;
