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
