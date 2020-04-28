const logger = require('../logger');
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
	}

	getData() {
		//TODO: Consider moving query to Object property
		let query = this.init();

		query = this.generateStatementWithColumns(query);

		query = this.generateStatementWithJoins(query);

		query = this.generateStatementWithFilters(query);

		query = this.generateStatementWithGroupBy(query);

		query = this.generateStatementWithOrderBy(query);

		logger.debug(
			`SQL statement generated from /pdfImage is: ${query.toQuery()}`
		);

		return query;
	}

	generateStatementWithFilters(query) {
		if (this.filter) {
			this.filter.forEach((filterObj) => {
				switch (filterObj.operator) {
					case '=':
						query = query.where(filterObj.column, '=', filterObj.value);
						break;
					case '!=':
						query = query.whereNot(filterObj.column, '=', filterObj.value);
						break;
					case '>':
						query = query.where(filterObj.column, '>', filterObj.value);
						break;
					case '>=':
						query = query.where(filterObj.column, '>=', filterObj.value);
						break;
					case '<':
						query = query.where(filterObj.column, '<', filterObj.value);
						break;
					case '<=':
						query = query.where(filterObj.column, '<=', filterObj.value);
						break;
					case 'contains':
						query = query.where(
							filterObj.column,
							'ILIKE',
							`%${filterObj.value}%`
						);
						break;
				}
			});
		}
		return query;
	}

	generateStatementWithJoins(query) {
		if (this.join) {
			this.join.forEach((joinObj) => {
				switch (joinObj.join_type) {
					case 'inner join':
						query = query.innerJoin(
							joinObj.join_condition.joined_table,
							`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
							`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
						);
						break;
					case 'left join':
						query = query.leftJoin(
							joinObj.join_condition.joined_table,
							`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
							`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
						);
						break;
					case 'right join':
						query = query.rightJoin(
							joinObj.join_condition.joined_table,
							`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
							`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
						);
						break;
				}
			});
		}
		return query;
	}

	generateStatementWithColumns(query) {
		if (this.columns) {
			let generateRawSql = false;

			// need to generate using knex.raw when there are functions in the column propertys
			generateRawSql = this.isRawSqlStatementRequiredForColumns();

			if (generateRawSql) {
				query = query.column(dbQueryBuilder.raw(this.columns));
			} else {
				query = query.column(this.columns);
			}
		}
		return query;
	}

	isTimeBucketFunction(str) {
		const regExpression = /^time_bucket\({1}/;
		let result = str.match(regExpression);

		return result === null ? false : true;
	}

	isRawSqlStatementRequiredForColumns() {
		let rawSqlRequired = false;

		this.columns.some((column) => {
			//TODO: Need to check for count(*) function as well
			if (this.isTimeBucketFunction(column)) {
				rawSqlRequired = true;
				return true;
			}
			return false;
		});

		return rawSqlRequired;
	}

	generateStatementWithGroupBy(query) {
		if (this.groupBy) {
			query = query.groupBy(this.groupBy);
		}

		return query;
	}

	generateStatementWithOrderBy(query) {
		if (this.orderBy) {
			query = query.orderBy(this.orderBy);
		}

		return query;
	}

	init() {
		return dbQueryBuilder(this.base_table_name).withSchema(this.schema_name);
	}
}

module.exports = QueryService;
