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
	GEOMEAN: 'geomean',
	MAX: 'max',
	MEAN: 'mean',
	MEAN_ABSOLUTE_DEVIATION: 'mean absolute deviation',
	MEAN_SQUARED_ERROR: 'mean squared error',
	MEDIAN: 'median',
	MEDIAN_ABSOLUTE_DEVIATION: 'median absolute deviation',
	MIN: 'min',
	MODE: 'mode',
	POP_CORR_COEFFICIENT: 'population correlation coefficient',
	POP_EXCESS_KURTOSIS: 'population excess kurtosis',
	POP_STD_DEV: 'population standard deviation',
	POPULATION_VARIANCE: 'population variance',
	QUARTILE: 'quartile',
	RANGE: 'range',
	SAMPLE_STANDARD_DEVIATION: 'sample standard deviation',
	SAMPLE_VARIANCE: 'sample variance',
	SKEWNESS: 'skewness',
	SUM: 'sum',
	SUM_OF_SQUARED_ERRORS: 'sum of squared errors',
	SUM_SQUARED: 'sum squared',
};

const VECTOR_AGGREGATION_TYPES_SINGLE_VECTOR_PARAM = [
	VECTOR_AGGREGATION_TYPES.COEFFICIENT_VARIATION,
	VECTOR_AGGREGATION_TYPES.DEVIATION,
	VECTOR_AGGREGATION_TYPES.GEOMEAN,
	VECTOR_AGGREGATION_TYPES.MAX,
	VECTOR_AGGREGATION_TYPES.MEAN,
	VECTOR_AGGREGATION_TYPES.MEAN_ABSOLUTE_DEVIATION,
	VECTOR_AGGREGATION_TYPES.MEAN_SQUARED_ERROR,
	VECTOR_AGGREGATION_TYPES.MEDIAN_ABSOLUTE_DEVIATION,
	VECTOR_AGGREGATION_TYPES.MEDIAN,
	VECTOR_AGGREGATION_TYPES.MIN,
	VECTOR_AGGREGATION_TYPES.MODE,
	VECTOR_AGGREGATION_TYPES.POP_EXCESS_KURTOSIS,
	VECTOR_AGGREGATION_TYPES.POP_STD_DEV,
	VECTOR_AGGREGATION_TYPES.POPULATION_VARIANCE,
	VECTOR_AGGREGATION_TYPES.QUARTILE,
	VECTOR_AGGREGATION_TYPES.RANGE,
	VECTOR_AGGREGATION_TYPES.SAMPLE_STANDARD_DEVIATION,
	VECTOR_AGGREGATION_TYPES.SAMPLE_VARIANCE,
	VECTOR_AGGREGATION_TYPES.SKEWNESS,
	VECTOR_AGGREGATION_TYPES.SUM,
	VECTOR_AGGREGATION_TYPES.SUM_OF_SQUARED_ERRORS,
	VECTOR_AGGREGATION_TYPES.SUM_SQUARED,
];

const VECTOR_AGGREGATION_TYPES_DOUBLE_VECTOR_PARAM = [
	VECTOR_AGGREGATION_TYPES.COVARIANCE,
	VECTOR_AGGREGATION_TYPES.POP_CORR_COEFFICIENT,
];

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
	VECTOR_AGGREGATION_TYPES_SINGLE_VECTOR_PARAM: VECTOR_AGGREGATION_TYPES_SINGLE_VECTOR_PARAM,
	VECTOR_AGGREGATION_TYPES_DOUBLE_VECTOR_PARAM: VECTOR_AGGREGATION_TYPES_DOUBLE_VECTOR_PARAM,
};
