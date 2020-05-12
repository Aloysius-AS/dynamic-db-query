const express = require('express');
const cors = require('cors');
const expressPino = require('express-pino-logger');
const logger = require('./logger');
const { handleAPIError } = require('./helpers/apiErrorHandler');

const app = express();
const port = process.env.PORT || 5000;

const expressLogger = expressPino({ logger });

app.use(cors());
app.use(express.json());
app.use(expressLogger);

const testApiRouter = require('./api/testApi');
const datapointApiRouter = require('./api/datapoint');
const aggregateApiRouter = require('./api/aggregate');

app.listen(port, () => {
	logger.info(`Server is running on port: ${port}`);
});

app.use('/v1/testAPI', testApiRouter);
app.use('/v1/datapoint', datapointApiRouter);
app.use('/v1/aggregate', aggregateApiRouter);

// Important! Following error-handling middleware must be the last among other middleware and routes for it to function correctly
app.use((err, req, res, next) => {
	logger.error(
		`API request error for ${req.url} with method ${
			req.method
		}. Request body is ${JSON.stringify(req.body)}`
	);
	logger.error(err);
	handleAPIError(err, res);
});

// log uncaught exception
process.on('uncaughtException', (err) => {
	logger.error('Uncaught exception.');
	logger.fatal({ err });
	process.exit(1);
});
