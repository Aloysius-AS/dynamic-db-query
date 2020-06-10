# Dynamic Database Query

<br/>

## Configuration

### Development

Create .env file in root of the project. .env(sample) is provided for reference.

Update .env file.

Some items to note:
- NODE_ENV: indicates which environment configuration (as specified in knexfile.js) to load for the database

- SSL_KEY_RELATIVE_PATH: path should be relative from startServerListener.js to the .key file

- SSL_CERT_RELATIVE_PATH: path should be relative from startServerListener.js to the .crt file

- API_ACCESS_RELATIVE_PATH: path should be relative from authUtils.js

- For database, update the respective environment as indicated in NODE_ENV. The database settings are used in knexfile.js

### Staging

Referencing .env, add in the environment variables for the following categories:
- Environment
- Application
- Database (Staging Environment)

<br/>

## Starting the Project

Run the following command.

> npm install

For Production, after changing directory to the application folder,

> pm2 start npm --name <App_Name> -- start

&nbsp;

For Development, either command can be executed,

Without nodemon:

> npm start

With nodemon:

> npm run start:dev-nodemon

<br/>

## Logs

Logs are written to physical files in the **logs** folder.

For Windows environment, the logs can be prettified with the following command.

> type \<log file> | pino-pretty -t SYS:standard > \<output file>

**app** folder stores the logs generated by the application.
**http-request-log** folder stores the logs generated by Express middleware.

<br/>

## Testing

<p>
1. In .env, change the following variable to the 'test' environment.

> NODE_ENV=test

</p>

<br />

<p>
2. In knexfile.js, update the database information in the test property.

It is recommended to use a different database name from Development. This is because
the database would be seeded and deleted during execution of the tests.

</p>

<br />

<p>
3. Create the database with the name and other information specified in the above step.
</p>

<br />

<p>
4. Run test scripts with the following command.

> npm test

</p>

<br />

## Troubleshooting

### TimescaleDb

Error:

> function time_bucket(unknown, timestamp with time zone) does not exist

This is likely due to installing timescaleDb in specific Postgres schema.
We can install timescaleDb in specific schema via the following snippet.

> CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA <schema_name>
