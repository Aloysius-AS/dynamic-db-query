/**
 * res.rows: Stores the data row
 * res.fields[0].dataTypeID: Stores the data type
 */

var connectionPool = require('./connectionPool');
const logger = require('../logger');

// connectionPool.query('SELECT * FROM mock.query where id = 1', (err, res) => {
// 	logger.info(res);
// });

connectionPool.query('SELECT "circleColumn" FROM mock.query', (err, res) => {
	// logger.info(err, res);
	// logger.info(res);
	// logger.info(res.rows[0].circleColumn);
	logger.info(res.fields[0].dataTypeID.toString());
});

// connectionPool.query(
// 	'SELECT "intervalColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		logger.info(res);
// 	}
// );

// connectionPool.query(
// 	'SELECT "jsonColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		logger.info(res);
// 	}
// );

// connectionPool.query(
// 	'SELECT "pointColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		logger.info(res);
// 	}
// );

// connectionPool.query(
// 	'SELECT "blobColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		logger.info(res);
// 	}
// );
