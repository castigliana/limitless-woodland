var pgp = require('pg-promise')();
var postgres = require('../lib/postgres.js');


/**
* Created By: Ashish N
* Date: May 09, 2017
* Descrition: Method to find lead records from postgresdb
*/
var findLeads = function(leadName, cb) {
	console.log('*** findLeads');
	var whereClause;

	var tableName = process.env.LEAD_TABLE_NAME ? process.env.LEAD_TABLE_NAME : 'Lead';
	var findQuery = "Select * From " + tableName + ' where approval_status__c is ${status} AND expected_opportunity_type__c = ${oppType} AND (isconverted is ${isConverted} OR isconverted = ${isConvertedBoolean})';
	if(leadName != null){
		whereClause = " AND Name LIKE '" + leadName + "%'"
		findQuery += whereClause;
	} 
	console.log('*** findQuery: ' + findQuery);

	postgres.client.query(findQuery, { status: null, oppType: 'Speaker', isConverted: null, isConvertedBoolean: false})
	.then(data => {
		if(cb) {
			cb(data, null);
		}
	})
	.catch(error => {
		if(cb) {
			cb(null, error);
		}
	});
}

/**
* Created By: Ashish N
* Date: May 09, 2017
* Descrition: Method to update lead records in postgres
*/
var updateLeads = function(leadsToUpdate, cb) {
	console.log('*** updateLeads');
	
	// using helpers namespace to dynamically generate update query. This allows to easily update multiple records without performance hit
	var dataMulti = leadsToUpdate;
	var cs = new pgp.helpers.ColumnSet(['?sfid', 'approval_status__c', 'tier__c', 'sendinvitationonconversion__c'], {table: process.env.LEAD_TABLE_NAME});
	var updateQuery = pgp.helpers.update(dataMulti, cs, null, {tableAlias: 'X', valueAlias: 'Y'}) + ' WHERE Y.sfid = X.sfid';
	// remove all the double quotes in the query string
	updateQuery = updateQuery.replace(/["]+/g, '');
	console.log('*** updateQuery: '+updateQuery);

	postgres.client.none(updateQuery)
	.then(data => {
		cb(data, null);
	})
	.catch(error => {
		if(cb) {
			cb(null, error);
		}
	});

//	cb();
}

/**
* Created By: Ashish N
* Date: May 15, 2017
* Descrition: Method to find contact records in postgres
*/
var findSpeakerContacts = function(cb) {
	console.log('*** findSpeakerContacts');

	var whereClause = '';
	var tableName = process.env.CONTACT_TABLE_NAME ? process.env.CONTACT_TABLE_NAME : 'Contact';

	var contactRecordTypes = process.env.CONTACT_RECORD_TYPES;
	contactRecordTypes = contactRecordTypes.split(',');

	var findQuery = "Select * From " + tableName;

	// if contact record type ids are provided in the config, filter the records
	if(contactRecordTypes != null || contactRecordTypes instanceof Array) {
		whereClause = " where RecordTypeId IN ${contactRecordTypeIds}";
		findQuery += whereClause;
	}

	postgres.client.query(findQuery, { contactRecordTypeIds: contactRecordTypes })
	.then(data => {
		if(cb) {
			cb(data, null);
		}
	})
	.catch(error => {
		if(cb) {
			cb(null, error);
		}
	})
}

/**
* Created By: Ashish N
* Date: May 15, 2017
* Descrition: Method to find user records in postgres
*/
var findUser = function(user, cb) {
	console.log('*** findUser');

	var findQuery = 'Select * from users Where email = ${email}';

	postgres.client.query(findQuery, { email: user.email })
	.then(data => {
		if(cb) {
			cb(null, data);
		}
	})
	.catch(error => {
		if(cb) {
			cb(error, null);
		}
	});
}

module.exports = {
	findLeads: findLeads,
	updateLeads: updateLeads,
	findSpeakerContacts: findSpeakerContacts,
	findUser: findUser
}