const logger = require('../../logger');

if (!process.env.NODE_ENV) {
	const path = require('path');
	let envRelativePath = '../../.env';
	require('dotenv').config({ path: path.resolve(__dirname, envRelativePath) });
}

const environment = process.env.NODE_ENV;
const config = require('../../knexfile')[environment];
logger.info(`Config used for data query is: ${JSON.stringify(config)}`);
module.exports = require('knex')(config);
