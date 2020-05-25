exports.up = (knex, Promise) => {
	return knex.schema.createTable('ftest', (table) => {
		table.increments();
		table.string('sex_re').notNullable();
		table.decimal('rwt_m');
		table.string('ef_group');
	});
};

exports.down = (knex, Promise) => {
	return knex.schema.dropTable('ftest');
};
