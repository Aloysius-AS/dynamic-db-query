// API (General)
const API_RESPONSE = {
	DATA: 'data',
	FILTER_APPLIED: 'filter_applied',
	DATASET_APPLIED: 'dataset_applied',
};

const VECTOR_AGGREGATION_TYPES = {
	COEFFICIENT_VARIATION: 'coefficient of variation',
	COVARIANCE: 'covariance',
	DEVIATION: 'deviation',
	MAX: 'max',
	MEAN: 'mean',
	MEDIAN: 'median',
	MEDIAN_ABSOLUTE_DEVIATION: 'median absolute deviation',
	POP_CORR_COEFFICIENT: 'population correlation coefficient',
	POP_STD_DEV: 'population standard deviation',
	POPULATION_VARIANCE: 'population variance',
	SAMPLE_VARIANCE: 'sample variance',
	SKEWNESS: 'skewness',
	SUM_OF_SQUARED_ERRORS: 'sum of squared errors',
};

// Statistical Test API
const TEST_TYPES = {
	F_TEST: 'f-test',
	ONE_SAMPLE_T_TEST: '1-sample t-test',
	TWO_SAMPLE_T_TEST: '2-sample t-test',
};

const ALT_HYPOTHESIS_VALUES = {
	LESS: 'less',
	GREATER: 'greater',
	NOT_EQUAL: 'not equal',
};

module.exports = {
	ALT_HYPOTHESIS_VALUES: ALT_HYPOTHESIS_VALUES,
	API_RESPONSE: API_RESPONSE,
	TEST_TYPES: TEST_TYPES,
	VECTOR_AGGREGATION_TYPES: VECTOR_AGGREGATION_TYPES,
};
