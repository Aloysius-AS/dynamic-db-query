// Update with your config settings.
console.log(process.env.API_ACCESS_RELATIVE_PATH);
module.exports = {
	development: {
		client: 'postgresql',
		connection: {
			host: process.env.DATABASE_HOST_DEV,
			database: process.env.DATABASE_NAME_DEV,
			user: process.env.DATABASE_USER_DEV,
			password: process.env.DATABASE_PASSWORD_DEV,
			charset: 'utf8',
		},
		pool: {
			min: 2,
			max: 10,
		},
	},

	test: {
		client: 'postgresql',
		connection: {
			host: process.env.DATABASE_HOST_QA,
			database: process.env.DATABASE_NAME_QA,
			user: process.env.DATABASE_USER_QA,
			password: process.env.DATABASE_PASSWORD_QA,
			charset: 'utf8',
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			directory: __dirname + '/src/database/migrations',
		},
		seeds: {
			directory: __dirname + '/src/database/seeds',
		},
	},

	staging: {
		client: 'postgresql',
		connection: {
			host: process.env.DATABASE_HOST_STAGING,
			database: process.env.DATABASE_NAME_STAGING,
			user: process.env.DATABASE_USER_STAGING,
			password: process.env.DATABASE_PASSWORD_STAGING,
			charset: 'utf8',
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
		},
	},

	production: {
		client: 'postgresql',
		connection: {
			host: process.env.DATABASE_HOST_PRODUCTION,
			database: process.env.DATABASE_NAME_PRODUCTION,
			user: process.env.DATABASE_USER_PRODUCTION,
			password: process.env.DATABASE_PASSWORD_PRODUCTION,
			charset: 'utf8',
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
		},
	},
};
