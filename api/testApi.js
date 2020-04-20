const router = require('express').Router();
const logger = require('../logger');
const connectionPool = require('../database/connectionPool');

const { APIErrorHandler } = require('../helpers/apiErrorHandler');
const validateApiJsonInput = require('../helpers/jsonApiInputValidator');
const QueryService = require('../services/QueryService');

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

// TODO: API for timescale data

router.route('/pdfImage').get((req, res, next) => {
	const { schema_name, base_table_name, columns, join, filter } = req.body;

	validateApiJsonInput(schema_name, base_table_name, columns, join, filter);

	const queryServiceInstance = new QueryService(
		schema_name,
		base_table_name,
		columns,
		join,
		filter
	);

	queryServiceInstance
		.getData()
		.then((data) => {
			return res.status(200).json(data);
		})
		.catch((err) => {
			logger.error('Query error in /pdfimage.');
			logger.error(err);

			next(
				new APIErrorHandler(
					500,
					'Internal server error',
					'Unable to query database'
				)
			);
		});
});

module.exports = router;
