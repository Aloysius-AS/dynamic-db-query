'use strict';

const expect = require('chai').expect;

const QueryService = require('../../src/services/QueryService');

describe('SQL Statements Generation', function () {
	let columns,
		joins,
		filters,
		groupBy,
		orderBy = [];

	beforeEach(function () {
		initData();
	});

	it('Should generate the correct SQL statements for requests with Columns, Joins, Filters, GroupBy and OrderBy. Filters are integer types.', function () {
		filters = [
			{
				column: 'column1',
				operator: '=',
				value: 1,
			},
			{
				column: 'column2',
				operator: '!=',
				value: 2,
			},
		];

		let queryService = new QueryService(
			'test_schema',
			'test_table',
			columns,
			joins,
			filters,
			groupBy,
			orderBy
		);

		let result = queryService.generateSqlQuery();

		let expectedResult =
			'select "column1", "column2" from "test_schema"."test_table" inner join "test_schema"."joined_table1" on "test_table"."base_table_column1" = "joined_table1"."joined_table_column1" left join "test_schema"."joined_table2" on "test_table"."base_table_column2" = "joined_table2"."joined_table_column2" where "column1" = 1 and not "column2" = 2 group by "column1" order by "column1" desc';

		expect(result.toQuery()).to.be.a('string');
		expect(result.toQuery()).to.equal(expectedResult);
	});

	it('Should generate the correct SQL statements for requests with Columns, Joins, Filters, GroupBy and OrderBy. Filters are string types.', function () {
		filters = [
			{
				column: 'column1',
				operator: '=',
				value: 'text 1',
			},
			{
				column: 'column2',
				operator: '!=',
				value: 'text 2',
			},
		];

		let queryService = new QueryService(
			'test_schema',
			'test_table',
			columns,
			joins,
			filters,
			groupBy,
			orderBy
		);

		let result = queryService.generateSqlQuery();

		let expectedResult =
			'select "column1", "column2" from "test_schema"."test_table" inner join "test_schema"."joined_table1" on "test_table"."base_table_column1" = "joined_table1"."joined_table_column1" left join "test_schema"."joined_table2" on "test_table"."base_table_column2" = "joined_table2"."joined_table_column2" where lower("column1") = lower(\'text 1\') and not lower("column2") = lower(\'text 2\') group by "column1" order by "column1" desc';

		expect(result.toQuery()).to.be.a('string');
		expect(result.toQuery()).to.equal(expectedResult);
	});

	const initData = () => {
		columns = ['column1', 'column2'];
		joins = [
			{
				join_type: 'inner join',
				join_condition: {
					base_table_column: 'base_table_column1',
					joined_table: 'joined_table1',
					joined_table_column: 'joined_table_column1',
				},
			},
			{
				join_type: 'left join',
				join_condition: {
					base_table_column: 'base_table_column2',
					joined_table: 'joined_table2',
					joined_table_column: 'joined_table_column2',
				},
			},
		];
		groupBy = ['column1'];
		orderBy = [{ column: 'column1', order: 'desc' }];
	};
});
