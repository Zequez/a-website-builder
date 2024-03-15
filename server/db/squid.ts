// This is some fix for squid using commonjs modules or something
// production dist was complaining
import pkg from 'squid/pg.js';

const { sql, spreadUpdate, spreadAnd, spreadInsert } = pkg;

export { sql, spreadUpdate, spreadAnd, spreadInsert };
