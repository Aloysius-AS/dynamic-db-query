const express = require('express');
const cors = require('cors');
const expressPino = require('express-pino-logger');
const logger = require('./logger');
require('dotenv').config();
// require('./database/querySample');

const app = express();
const port = process.env.PORT || 5000;

const expressLogger = expressPino({ logger });

app.use(cors());
app.use(express.json());
app.use(expressLogger);

const testApiRouter = require('./routes/testApi');

app.listen(port, () => {
	logger.info(`Server is running on port: ${port}`);
});

app.use('/testAPI', testApiRouter);

// log uncaught exception
process.on('uncaughtException', (err) => {
	logger.err('Uncaught exception.');
	logger.fatal({ err });
	process.exit(1);
});
