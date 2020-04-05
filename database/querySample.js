/**
 * res.rows: Stores the data row
 * res.fields[0].dataTypeID: Stores the data type
 */

var connectionPool = require('./connectionPool');

// connectionPool.query('SELECT * FROM mock.query where id = 1', (err, res) => {
// 	console.log(res);
// });

connectionPool.query(
	'SELECT "circleColumn" FROM mock.query where id = 1',
	(err, res) => {
		// console.log(err, res);
		// console.log(res);
		// console.log(res.rows[0].circleColumn);
		console.log(res.fields[0].dataTypeID);
	}
);

// connectionPool.query(
// 	'SELECT "intervalColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		console.log(res);
// 	}
// );

// connectionPool.query(
// 	'SELECT "jsonColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		console.log(res);
// 	}
// );

// connectionPool.query(
// 	'SELECT "pointColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		console.log(res);
// 	}
// );

// connectionPool.query(
// 	'SELECT "blobColumn" FROM mock.query where id = 1',
// 	(err, res) => {
// 		console.log(res);
// 	}
// );

connectionPool.end();
