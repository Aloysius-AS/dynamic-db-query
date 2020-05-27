const router = require('express').Router();
const _ = require('lodash');

const { API_RESPONSE_DATASET_APPLIED } = require('../constants');
const APITestInputValidator = require('../helpers/APITestInputValidator');
const logger = require('../../logger');
const StatisticalTestService = require('../services/StatisticalTestService');

router.route('/').get((req, res, next) => {
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
				...data,
				[API_RESPONSE_DATASET_APPLIED]: req.body.dataset,
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
