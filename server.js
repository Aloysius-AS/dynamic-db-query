const express = require('express');
const cors = require('cors');
const expressPino = require('express-pino-logger');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { handleAPIError } = require('./src/helpers/apiErrorHandler');
const clientApiKeyValidation = require('./src/helpers/authUtils');

const app = express();
const expressLogger = expressPino({ logger });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(expressLogger);
app.use(clientApiKeyValidation);

const testApiRouter = require('./src/api/testApi');
const datapointApiRouter = require('./src/api/datapoint');
const vectorApiRouter = require('./src/api/vector');
const statsTestApiRouter = require('./src/api/statisticalTest');

if (process.env.NON_SSL_ENABLED === 'true') {
	const non_ssl_port = process.env.NON_SSL_PORT || 8080;
	app.listen(non_ssl_port, () => {
		logger.info(`HTTP Server is running on port: ${non_ssl_port}`);
	});
}

if (process.env.SSL_ENABLED === 'true') {
	const ssl_port = process.env.SSL_PORT;

	// serve the API with signed certificate on SSL port
	const keyRelativePath = process.env.SSL_KEY_RELATIVE_PATH;
	const certRelativePath = process.env.SSL_CERT_RELATIVE_PATH;
	const httpsServer = https.createServer(
		{
			key: fs.readFileSync(path.resolve(__dirname, keyRelativePath)),
			cert: fs.readFileSync(path.resolve(__dirname, certRelativePath)),
		},
		app
	);

	httpsServer.listen(ssl_port, () => {
		logger.info(`HTTPS Server is running on port: ${ssl_port}`);
	});
}

app.use('/v1/testAPI', testApiRouter);
app.use('/v1/datapoint', datapointApiRouter);
app.use('/v1/stats/vector', vectorApiRouter);
app.use('/v1/stats/test', statsTestApiRouter);

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
