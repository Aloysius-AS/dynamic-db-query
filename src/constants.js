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
	TEST_TYPES: TEST_TYPES,
	ALT_HYPOTHESIS_VALUES: ALT_HYPOTHESIS_VALUES,
};
