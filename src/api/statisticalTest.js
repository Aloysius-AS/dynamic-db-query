const router = require('express').Router();
const _ = require('lodash');

const { API_RESPONSE } = require('../constants');
const APITestInputValidator = require('../helpers/APITestInputValidator');
const logger = require('../../logger');
const StatisticalTestService = require('../services/StatisticalTestService');

router.route('/').post((req, res, next) => {
	const {
		schema_name,
		test_type,
		hypothetical_mean,
		populations_mean_difference,
		equal_variance,
		alternative_hypothesis,
		dataset,
	} = req.body;

	const aPITestInputValidator = new APITestInputValidator(
		schema_name,
		test_type,
		hypothetical_mean,
		populations_mean_difference,
		equal_variance,
		alternative_hypothesis,
		dataset
	);
	aPITestInputValidator.validate();

	const statsTestServiceInstance = new StatisticalTestService(
		schema_name,
		test_type,
		hypothetical_mean,
		populations_mean_difference,
		equal_variance,
		alternative_hypothesis,
		dataset
	);

	statsTestServiceInstance
		.runTest()
		.then((data) => {
			let response = {
				[API_RESPONSE.DATA]: data,
				[API_RESPONSE.DATASET_APPLIED]: req.body.dataset,
			};
			return res.status(200).json(response);
		})
		.catch((err) => {
			logger.error('Query error in /stats/test/query.');
			logger.error(err);

			next(err);
		});
});

module.exports = router;
