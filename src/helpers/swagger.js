const swaggerJsDoc = require('swagger-jsdoc');

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			version: '1.0.0',
			title: 'Dataserve',
			description:
				'An API to provide aggregation and statistical test services',
			contact: {
				name: 'API Support',
				// url: 'http://www.example.com/support',
				email: 'support@example.com',
			},
		},
	},
	apis: ['./src/api/docs/**/*.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
var swaggerUiOptions = {
	customCss: '.swagger-ui .topbar { display: none }',
};

module.exports = {
	swaggerDocs,
	swaggerUiOptions,
};
