exports.seed = (knex, Promise) =>
	knex('ftest')
		.del()
		.then(() =>
			knex('ftest').insert([
				{
					sex_re: 'male',
					rwt_m: 0.439024389,
					ef_group: 'HFrEF',
				},
				{
					sex_re: 'male',
					ef_group: 'HFrEF',
				},
				{
					sex_re: 'male',
					rwt_m: 0.428571433,
					ef_group: 'HFrEF',
				},
				{
					sex_re: 'male',
					rwt_m: 0.333333343,
					ef_group: 'HFpEF',
				},
				{
					sex_re: 'male',
					rwt_m: 0.260869563,
					ef_group: 'HFpEF',
				},
				{
					sex_re: 'female',
					rwt_m: 0.384615391,
					ef_group: 'HFrEF',
				},
				{
					sex_re: 'female',
					ef_group: 'HFrEF',
				},
				{
					sex_re: 'female',
					rwt_m: 0.291666657,
					ef_group: 'HFrEF',
				},
				{
					sex_re: 'female',
					rwt_m: 0.340425521,
					ef_group: 'HFpEF',
				},
				{
					sex_re: 'female',
					rwt_m: 0.512820542,
					ef_group: 'HFpEF',
				},
			])
		);
