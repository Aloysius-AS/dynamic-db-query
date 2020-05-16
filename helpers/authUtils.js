const _ = require('lodash');

const logger = require('../logger');
const { APIErrorHandler } = require('./apiErrorHandler');

const loadAccessJsonFile = () => {
	const fs = require('fs');
	const path = require('path');
	let jsonFileRelativePath = '../api/access.json';
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
		return false;
	}

	let canAccessApiPath = _.includes(accessData[0].accessibleApi, apiPath);

	if (!canAccessApiPath) {
		return false;
	}

	return true;
};

const validateApiKey = (apiPath, clientApiKey) => {
	let validRequest = false;
	validRequest = validateApiViaJsonFile(apiPath, clientApiKey);

	return validRequest;
};

const clientApiKeyValidation = async (req, res, next) => {
	let clientApiKey = req.get('api_key');
	let clientIpAddress = req.connection.remoteAddress;
	if (!clientApiKey) {
		let errObj = new APIErrorHandler(
			400,
			'Invalid JSON request',
			'Missing Api Key'
		);

		return res.status(400).send(errObj);
	}

	let isAuthorised = validateApiKey(req.path, clientApiKey);
	if (!isAuthorised) {
		logger.warn(
			`Unauthorised API request detected. IP Address ${clientIpAddress} tried to access path \"${req.path}\"`
		);
		let errObj = new APIErrorHandler(
			400,
			'Invalid JSON request',
			'Unauthorised request'
		);

		return res.status(400).send(errObj);
	}

	next();
};

module.exports = clientApiKeyValidation;
