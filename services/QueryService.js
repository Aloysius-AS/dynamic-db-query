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
		// TODO: filter need to add more permutations. =, !=, >, >=, <, <=, contains
		if (this.filter) {
			this.filter.forEach((filterObj) => {
				if (filterObj.operator === '=') {
					let filterArgs = {
						[filterObj.column]: filterObj.value,
					};
					query = query.where(filterArgs);
				}
			});
		}
		return query;
	}

	generateStatementWithJoins(query) {
		if (this.join) {
			this.join.forEach((joinObj) => {
				if (joinObj.join_type === 'inner join') {
					query = query.innerJoin(
						joinObj.join_condition.joined_table,
						`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
						`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
					);
				} else if (joinObj.join_type === 'left join') {
					query = query.leftJoin(
						joinObj.join_condition.joined_table,
						`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
						`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
					);
				} else if (joinObj.join_type === 'right join') {
					query = query.rightJoin(
						joinObj.join_condition.joined_table,
						`${this.base_table_name}.${joinObj.join_condition.base_table_column}`,
						`${joinObj.join_condition.joined_table}.${joinObj.join_condition.joined_table_column}`
					);
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