var dotenv = require('dotenv').config();

var pg = exports; 
exports.constructor = function pg() {};

var pgp = require('pg-promise')();

pg.initialize = function(cb) {
	var dbConnString = process.env.DATABASE_URL;
	// db represents database protocal with lazy connection, only actual query methods acquire and release the connection
	//var db = pgp('postgres://ashishdev:root@localhost:5432/SFDC');
	var db = pgp(dbConnString);
	// assign db instance to global variable which is exported and used across the application
	pg.client = db;

	if(cb) {
		cb();
	}	
}


