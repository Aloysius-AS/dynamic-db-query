const _ = require('lodash');

const logger = require('../../logger');
const { APIErrorHandler } = require('./apiErrorHandler');

const loadAccessJsonFile = () => {
	const fs = require('fs');
	const path = require('path');
	let jsonFileRelativePath = process.env.API_ACCESS_RELATIVE_PATH;
	let jsonData = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, jsonFileRelativePath), 'utf8')
	);

	return jsonData;
};

const validateApiViaJsonFile = (apiPath, clientApiKey) => {
	let jsonData = loadAccessJsonFile();

	let accessData = _.filter(
		jsonData.accessList,
		(x) => x.apiKey === clientApiKey
	);

	if (accessData.length === 0) {
		return null;
	}

	let canAccessApiPath = _.includes(accessData[0].accessibleApi, apiPath);

	if (!canAccessApiPath) {
		return null;
	}

	return accessData;
};

const validateApiKey = (apiPath, clientApiKey) => {
	let accessData = validateApiViaJsonFile(apiPath, clientApiKey);

	return accessData;
};

const logAccess = (organisation, clientIpAddress, apiPath, jsonApiRequest) => {
	logger.info(
		`"${organisation}" from IP address ${clientIpAddress} successfully authorised to access "${apiPath}". The JSON request body is ${JSON.stringify(
			jsonApiRequest
		)} `
	);
};

const clientApiKeyValidation = async (req, res, next) => {
	if (!req.path.startsWith('/api-docs/')) {
		let clientApiKey = req.get('api_key');
		let clientIpAddress = req.connection.remoteAddress;
		if (!clientApiKey) {
			let errObj = new APIErrorHandler(
				401,
				'Invalid JSON request',
				'Missing Api Key'
			);

			return res.status(401).send(errObj);
		}

		let accessData = validateApiKey(req.path, clientApiKey);
		if (!accessData) {
			logger.warn(
				`Unauthorised API request detected. IP Address ${clientIpAddress} tried to access path \"${req.path}\"`
			);
			let errObj = new APIErrorHandler(
				401,
				'Invalid JSON request',
				'Unauthorised request'
			);

			return res.status(401).send(errObj);
		}

		logAccess(accessData[0].organisation, clientIpAddress, req.path, req.body);
	}

	next();
};

module.exports = clientApiKeyValidation;
