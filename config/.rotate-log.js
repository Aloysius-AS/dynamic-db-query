module.exports = {
	filter(data) {
		// logic can be added here to determine if the data should be logged
		// refer to https://www.npmjs.com/package/@vrbo/pino-rotating-file
		return true;
	},
	output: {
		path: 'server.log', // name of file
		options: {
			path: 'logs/', // path to write files to
			size: '2MB', // max file size
			interval: '1d', // rotate daily
			// rotate: 5, // keep 5 rotated logs
		},
	},
};
