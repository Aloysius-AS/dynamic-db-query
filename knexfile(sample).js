// Update with your config settings.

module.exports = {
	development: {
		client: 'postgresql',
		connection: {
			host: '127.0.0.1',
			user: '',
			password: '',
			database: '',
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
			host: '127.0.0.1',
			user: '',
			password: '',
			database: 'ETL_Mock_Testing',
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
			database: 'my_db',
			user: 'username',
			password: 'password',
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
			database: 'my_db',
			user: 'username',
			password: 'password',
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