# Node.js Backend App

## Getting Started

### Prerequisites

The following software are required to setup the backend application.

* Node.js (version 12)
* PostgreSQL (version 12)
* OpenSSL

### Setup

#### Access.json

Create the `access.json` file. The content of `access.json` can be copied from `access(sample).json`. `access.json` can be created in any folder. Take note that the path of `access.json` would be required in the configuration later on.

`access.json` controls the API endpoints that an organisation is allowed to access.

You would need to configure the following keys.

> | Key           | Description                                                  |
> | ------------- | ------------------------------------------------------------ |
> | organisation  | The name of the organisation                                 |
> | apiKey        | The API key that is allocated to the organisation            |
> | accessibleApi | The list of API endpoints that the organisation can connect to |

#### Self Signed SSL Certificates

SSL certificates are required to host a HTTPS server for the API endpoints. This section is necessary only if you intend to host the API endpoints on a HTTPS server.

OpenSSL library would be required to complete this section. The library would likely be available by default on Linux distributions. For Windows, you would likely need to download the library separately.

Self signed certificates can be generated with the following series of steps.



<u>Generating Files Required to become Certificate Authority</u>

First, we generate the private key with the below command. Take note of the pass phrase entered in the prompt.

```bash
openssl genrsa -des3 -out dashStats_backend.key 2048
```

Then we generate a root certificate.

```bash
openssl req -x509 -new -nodes -key dashStats_backend.key -sha256 -days 1825 -out dashStats_backend.pem
```



<u>Generating Self Signed Certificates</u>

First, we create a private key.

```bash
openssl genrsa -des3 -out dev.dashstats.com.key 2048
```

Then we create a Certificate Signing Request.

```bash
openssl req -new -key dev.dashstats.com.key -out dev.dashstats.com.csr
```

Next we create a config file to define the Subject Alternative Name extension. The config file is named as `dev.dashstats.com.ext`. **This config assumes that the application is hosted locally, aka on 127.0.0.1**.

```bash
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = 127.0.0.1
```

Now we run the command to create the certificate.

```bash
openssl x509 -req -in dev.dashstats.com.csr -CA dashStats_backend.pem -CAkey dashStats_backend.key -CAcreateserial \
-out dev.dashStats.com.crt -days 825 -sha256 -extfile dev.dashStats.com.ext
```

`dev.dashstats.com.key` and `dev.dashStats.com.crt` would be used during hosting of HTTPS server.

#### Environment Variables

The environment variables required for this application can be found in `.env(sample)`.

Description of the environment variables is tabulated in the following.

> | Key                             | Description                                                  |
> | ------------------------------- | ------------------------------------------------------------ |
> | NODE_ENV                        | Indicates which database configuration (as specified in `knexfile.js`) to load as the database.<br /> Possible values:<br/> - development<br/> - test<br/> - staging<br/> - production |
> | NON_SSL_ENABLED                 | `true` if HTTP server is required, else `false`              |
> | NON_SSL_PORT                    | Port for HTTP server                                         |
> | SSL_ENABLED                     | `true` if HTTPS server is required, else `false`             |
> | SSL_PORT                        | Port for HTTPS server                                        |
> | SSL_KEY_RELATIVE_PATH           | The relative path of the .key file generated after SSL certificate is created. The path should be relative from `startServerListener.js` to the .key file. |
> | SSL_CERT_RELATIVE_PATH          | The relative path of the .crt file generated after SSL certificate is created. The path should be relative from `startServerListener.js` to the .crt file. |
> | API_ACCESS_RELATIVE_PATH        | The relative path of `access.json` from `authUtils.js`.      |
> | DATABASE_HOST_`ENVIRONMENT`     | IP address of the database host for the corresponding `ENVIRONMENT` |
> | DATABASE_NAME_`ENVIRONMENT`     | Name of the database host for the corresponding `ENVIRONMENT` |
> | DATABASE_USER_`ENVIRONMENT`     | Name of the database user for the corresponding `ENVIRONMENT` |
> | DATABASE_PASSWORD_`ENVIRONMENT` | Password of the database user for the corresponding `ENVIRONMENT` |



Some items to note for the environment variables used for database:

There are groups of database configuration specified within the `.env` file, e.g. `Database (Development) Environment`, `Database (Staging Environment)`. 

You would only need the environment variables for the corresponding environment.

#### Development Environment

<u>.env File</u>

For development environment, it's possible to specify the required environment variables in the .env file.

In the root of the project, create a .env file. The content of the .env file can be copied from .env(sample).

Update the created .env file with the relevant information of your development environment.

For database configuration, you would only need to update the configuration of block marked under `Database (Development) Environment`.

## Starting the Project

### First Time Startups

For 1st time startups, you would need to install the dependencies required for the application. This is done by issuing the below command, after changing directory to the root folder of the application.

```bash
npm install
```

### Development Environment

Open the terminal / command prompt and change directory to the root folder of the application. Then execute the following command.

```bash
npm start
```

Alternatively, the application can also be started with nodemon.

```bash
npm run start:dev-nodemon
```

### Staging / Production Environment

Open the terminal / command prompt and change directory to the root folder of the application. Then execute the following command.

```bash
pm2 start npm --name <App_Name> -- start
```

## Logs

Logs are written to physical files in the `logs` folder. The `logs` folder resides on the same directory as the folder hosting the codes.

There are 2 types of logs, `app` and `http-request-log`.

`app` stores the logs generated by the application.

`http-request-log` stores the logs generate by Express middleware.

### Prettifying Logs

For Windows environment, the logs can be prettified with the following command.

```bash
type <log file> | pino-pretty -t SYS:standard > <output file>
```

## Testing

Ensure that the following environment variables are set.

> NODE_ENV
>
> DATABASE_HOST_QA
>
> DATABASE_NAME_QA
>
> DATABASE_USER_QA
>
> DATABASE_PASSWORD_QA

Note that `NODE_ENV` must be set to `test`. The rest of the environment variables should be set to the configuration of the test database. It is **recommended to use a separate database** for testing. This is because the database would be seeded and then deleted during the execution of the tests.

Next, execute the test scripts.

```bash
npm test
```

## Troubleshooting

### TimescaleDb

Error:

> function time_bucket(unknown, timestamp with time zone) does not exist

This is likely due to installing timescaleDb in specific Postgres schema. We can install timescaleDb in specific schema via the following snippet.

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA <schema_name>
```

