const logger = require('../../logger');
const dbQueryBuilder = require('../database/queryBuilder');

class QueryService {
	constructor(
		schema_name,
		base_table_name,
		columns,
		join,
		filter,
		groupBy,
		orderBy
	) {
		this.schema_name = schema_name;
		this.base_table_name = base_table_name;
		this.columns = columns;
		this.join = join;
		this.filter = filter;
		this.groupBy = groupBy;
		this.orderBy = orderBy;
		this.query = this.init();
	}

	generateSqlQuery() {
		this.generateStatementWithColumns();

		this.generateStatementWithJoins();

		this.generateStatementWithFilters();

		this.generateStatementWithGroupBy();

		this.generateStatementWithOrderBy();

		logger.debug(
			`SQL statement generated from QueryService is: ${this.query.toQuery()}`
		);

		return this.query;
	}

	generateStatementWithFilters() {
		if (this.filter) {
			this.filter.forEach((filterObj) => {
				switch (filterObj.operator) {
					case '=':
					case '!=':
						let rawStmt =
							typeof filterObj.value !== 'number'
								? 'lower(??) = lower(?)'
								: '?? = ?';

						if (filterObj.operator === '=') {
							this.query = this.query.where(
								dbQueryBuilder.raw(rawStmt, [filterObj.column, filterObj.value])
							);
						} else if (filterObj.operator === '!=') {
							this.query = this.query.whereNot(
								dbQueryBuilder.raw(rawStmt, [filterObj.column, filterObj.value])
							);
						}

						break;
					case '>':
						this.query = this.query.where(
							filterObj.column,
							'>',
							filterObj.value
						);
						break;
					case '>=':
						this.query = this.query.where(
							filterObj.column,
							'>=',
							filterObj.value
						);
						break;
					case '<':
						this.query = this.query.where(
							filterObj.column,
							'<',
							filterObj.value
						);
						break;
					case '<=':
						this.query = this.query.where(
							filterObj.column,
							'<=',
							filterObj.value
						);
						break;
					case 'contains':
						this.query = this.query.where(
							filterObj.column,
							'ILIKE',
							`%${filterObj.value}%`
						);
						break;
				}
			});
		}
	}

	generateStatementWithJoins() {
		if (this.join) {
			this.join.forEach((joinObj) => {
				switch (joinObj.join_type) {
					case 'inner join':
						this.query = this.query.innerJoin(
							joinObj.join_condition.joined_table,
							`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
							`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
						);
						break;
					case 'left join':
						this.query = this.query.leftJoin(
							joinObj.join_condition.joined_table,
							`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
							`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
						);
						break;
					case 'right join':
						this.query = this.query.rightJoin(
							joinObj.join_condition.joined_table,
							`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
							`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
						);
						break;
				}
			});
		}
	}

	generateStatementWithColumns() {
		if (this.columns) {
			let generateRawSql = false;

			// need to generate using knex.raw when there are functions in the column propertys
			generateRawSql = this.isRawSqlStatementRequiredForColumns();

			if (generateRawSql) {
				this.query = this.query.column(dbQueryBuilder.raw(this.columns));
			} else {
				this.query = this.query.column(this.columns);
			}
		}
	}

	isTimeBucketFunction(str) {
		const regExpression = /^time_bucket\({1}/;
		let result = str.match(regExpression);

		return result === null ? false : true;
	}

	isTimeBucketGapFillFunction(str) {
		const regExpression = /^time_bucket_gapfill()\({1}/;
		let result = str.match(regExpression);

		return result === null ? false : true;
	}

	isCountFunction(str) {
		const regExpression = /^count\(+/;
		let result = str.match(regExpression);

		return result === null ? false : true;
	}

	isRawSqlStatementRequiredForColumns() {
		let rawSqlRequired = false;

		this.columns.some((column) => {
			if (
				this.isTimeBucketFunction(column) ||
				this.isTimeBucketGapFillFunction(column) ||
				this.isCountFunction(column)
			) {
				rawSqlRequired = true;
				return true;
			}
			return false;
		});

		return rawSqlRequired;
	}

	generateStatementWithGroupBy() {
		if (this.groupBy) {
			this.query = this.query.groupBy(this.groupBy);
		}
	}

	generateStatementWithOrderBy() {
		if (this.orderBy) {
			this.query = this.query.orderBy(this.orderBy);
		}
	}

	init() {
		return dbQueryBuilder(this.base_table_name).withSchema(this.schema_name);
	}
}

module.exports = QueryService;
