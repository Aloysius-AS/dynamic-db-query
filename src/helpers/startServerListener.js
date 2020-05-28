const fs = require('fs');
const https = require('https');
const path = require('path');
const logger = require('../../logger');

const startServerListener = (app) => {
	let httpServerStarting = false;
	let httpsServerStarting = false;

	if (process.env.NON_SSL_ENABLED === 'true') {
		const non_ssl_port = process.env.NON_SSL_PORT || 8080;
		app.listen(non_ssl_port, () => {
			logger.info(`HTTP Server is running on port: ${non_ssl_port}`);
		});
		httpServerStarting = true;
	}

	if (process.env.SSL_ENABLED === 'true') {
		const ssl_port = process.env.SSL_PORT;

		// serve the API with signed certificate on SSL port
		const keyRelativePath = process.env.SSL_KEY_RELATIVE_PATH;
		const certRelativePath = process.env.SSL_CERT_RELATIVE_PATH;

		try {
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
		} catch (err) {
			logger.error(err);
		}

		httpsServerStarting = true;
	}

	if (!httpServerStarting && !httpsServerStarting) {
		logger.warn(
			'Both HTTP and HTTPS servers are not configured to be listening for requests.'
		);
	}
};

module.exports = startServerListener;
