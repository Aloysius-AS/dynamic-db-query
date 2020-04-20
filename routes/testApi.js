const router = require('express').Router();
const logger = require('../logger');
const connectionPool = require('../database/connectionPool');
const dbQueryBuilder = require('../database/queryBuilder');
const { APIErrorHandler } = require('../helpers/apiErrorHandler');

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

	// TODO: Test robustness of log. Test that errors are logged.

	/////////// Start: Validation of JSON input
	// TODO: Validate the input JSON. Extract in separate file
	// validate is proper JSON
	// validate that fields are provided
	// validate whether the value should be string, array of string/json, digit etc

	let clientApiRequestErrorMessage = [];

	if (!schema_name) {
		clientApiRequestErrorMessage.push('Database schema must be provided.');
	}
	if (!base_table_name) {
		clientApiRequestErrorMessage.push('Database table must be provided.');
	}

	if (join) {
		join.forEach((joinObj) => {
			let acceptableJoinTypes = ['inner join', 'left join', 'right join'];
			if (acceptableJoinTypes.indexOf(joinObj.join_type) == -1) {
				clientApiRequestErrorMessage.push(
					`Join type \'${joinObj.join_type}\' is not a valid input. Acceptable values are: ${acceptableJoinTypes}`
				);
			}
		});
	}

	if (filter) {
		filter.forEach((filterObj) => {
			let acceptableFilterTypes = ['=', '!=', '>', '>=', '<', '<='];
			if (acceptableFilterTypes.indexOf(filterObj.operator) == -1) {
				clientApiRequestErrorMessage.push(
					`Filter operator \'${filterObj.operator}\' is not a valid input. Acceptable values are: ${acceptableFilterTypes}`
				);
			}
		});
	}

	if (clientApiRequestErrorMessage.length >= 1) {
		let jsonErrorMsg = {
			errorType: 'Invalid API request option',
			errorMessage: clientApiRequestErrorMessage,
		};

		logger.info(
			jsonErrorMsg,
			`Invalid JSON input provided at route /pdfImage. The JSON validation errors are `
		);

		throw new APIErrorHandler(
			400,
			'Invalid API request option',
			clientApiRequestErrorMessage
		);
	}
	/////////// End: Validation of JSON input

	/////////// Start: Query db
	// TODO: Extract into DAL folder, returning the query promise
	let query = dbQueryBuilder(base_table_name).withSchema(schema_name);

	if (columns) {
		query = query.column(columns);
	}

	if (join) {
		join.forEach((joinObj) => {
			if (joinObj.join_type === 'inner join') {
				query = query.innerJoin(
					joinObj.join_condition.joined_table,
					`${base_table_name}.${joinObj.join_condition.base_table_column}`,
					`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
				);
			} else if (joinObj.join_type === 'left join') {
				query = query.leftJoin(
					joinObj.join_condition.joined_table,
					`${base_table_name}.${joinObj.join_condition.base_table_column}`,
					`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
				);
			} else if (joinObj.join_type === 'right join') {
				query = query.rightJoin(
					joinObj.join_condition.joined_table,
					`${base_table_name}.${joinObj.join_condition.base_table_column}`,
					`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
				);
			}
		});
	}

	// TODO: filter need to add more permutations. =, !=, >, >=, <, <=, contains
	if (filter) {
		filter.forEach((filterObj) => {
			if (filterObj.operator === '=') {
				let filterArgs = {
					[filterObj.column]: filterObj.value,
				};
				query = query.where(filterArgs);
			}
		});
	}

	query
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

	logger.debug(`SQL statement generated from /pdfImage is: ${query.toQuery()}`);

	/////////// End: Query db
});

module.exports = router;
