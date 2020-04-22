const logger = require('../logger');
const dbQueryBuilder = require('../database/queryBuilder');

class QueryService {
	constructor(schema_name, base_table_name, columns, join, filter) {
		this.schema_name = schema_name;
		this.base_table_name = base_table_name;
		this.columns = columns;
		this.join = join;
		this.filter = filter;
	}

	getData() {
		let query = this.init();

		query = this.generateStatementWithColumns(query);

		query = this.generateStatementWithJoins(query);

		query = this.generateStatementWithFilters(query);

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
			query = query.column(this.columns);
		}
		return query;
	}

	init() {
		return dbQueryBuilder(this.base_table_name).withSchema(this.schema_name);
	}
}

module.exports = QueryService;
