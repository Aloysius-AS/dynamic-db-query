class APIErrorHandler extends Error {
	constructor(statusCode, errorType, errorMessage) {
		super();
		this.statusCode = statusCode;
		this.errorType = errorType;
		this.errorMessage = errorMessage;
	}
}

/**
 * Handles uncaught API exceptions.
 *
 * @param {TypeError} err Contains details of error.
 * @param {ServerResponse} res Server response.
 */
const handleAPIError = (err, res) => {
	let { statusCode, errorType, errorMessage } = err;

	// Set default value
	statusCode = typeof statusCode === 'undefined' ? 500 : statusCode;
	errorType = typeof errorType === 'undefined' ? 'API Error' : errorType;
	errorMessage =
		typeof errorMessage === 'undefined'
			? 'Unable to process API call'
			: errorMessage;

	res.status(statusCode).json({
		errorType,
		errorMessage,
	});
};

module.exports = {
	APIErrorHandler,
	handleAPIError,
};
