# Dynamic Database Query

<br/>

## Starting the Project

Run the following command.

For Production,

> npm start

&nbsp;

For Development, either command can be executed,

Without nodemon:

> npm run start:dev

With nodemon:

> npm run start:dev-nodemon

Note: .env needs to be configured.

<br/>

## Logs

Logs are written to physical files in the **logs** folder.

For Windows environment, the logs can be prettified with the following command.

> type \<log file> | pino-pretty -t SYS:standard > \<output file>

**app** folder stores the logs generated by the application.
**http-request-log** folder stores the logs generated by Express middleware.

<br/>

## Testing

Run test scripts with the following command.

> npm test

<br/>

## Troubleshooting

### TimescaleDb

Error:

> function time_bucket(unknown, timestamp with time zone) does not exist

This is likely due to installing timescaleDb in specific Postgres schema.
We can install timescaleDb in specific schema via the following snippet.

> CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA <schema_name>
