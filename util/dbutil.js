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
	findQuery += ' Order By createddate DESC' 
	console.log('*** findQuery: ' + findQuery);
	// query the records from the table
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
	var cs = new pgp.helpers.ColumnSet(['?sfid', 'approval_status__c', 'tier__c', 'sendinvitationonconversion__c', 'title', 'description'], {table: process.env.LEAD_TABLE_NAME});
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
* Descrition: Method to find contact records in postgres. Only the conact with sfId in contactIds are retrieved
*/
var findSpeakerContacts = function(contactIdList, cb) {
	console.log('*** findSpeakerContacts');

	var whereClause = '';
	var contactTableName = process.env.CONTACT_TABLE_NAME ? process.env.CONTACT_TABLE_NAME : 'Contact';
	var accountTableName = process.env.ACCOUNT_TABLE_NAME ? process.env.ACCOUNT_TABLE_NAME : 'Account';

	var findQuery = "Select c.sfid, c.Name, c.Title, c.AccountId, c.LastModifiedDate, a.Name as AccountName From " + contactTableName + ' as c,' + accountTableName + ' as a Where c.AccountId = a.sfid AND ';

	var params = [];
	for(var i = 1; i <= contactIdList.length; i++) {
	  params.push('$' + i);
	}

	// if contact record type ids are provided in the config, filter the records
	if(contactIdList != null && contactIdList instanceof Array) {
		whereClause = " c.sfid IN (" + params.join(',') + ')';
		findQuery += whereClause;
	}

	findQuery += ' Order By LastModifiedDate DESC';

	console.log('*** findQuery: ' + findQuery);

	postgres.client.query(findQuery, contactIdList)
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
* Date: May 22, 2017
* Descrition: Method to find OpportunityContactRole records in postgres
*/
var findOpportunityContactRoles = function(opptyIds, cb) {
	console.log('*** findOpportunityContactRoles');

	var whereClause = '';
	var tableName = process.env.OPP_CONTACT_ROLE_TABLE ? process.env.OPP_CONTACT_ROLE_TABLE : 'OpportunityContactRole';
	var findQuery = "Select OpportunityId, ContactId from " + tableName;

	var params = [];
	for(var i = 1; i <= opptyIds.length; i++) {
	  params.push('$' + i);
	}

	if(opptyIds != null && opptyIds instanceof Array) {
		whereClause += ' Where OpportunityId IN (' + params.join(',') + ')';
		findQuery += whereClause;
	}

	console.log('*** findQuery: ' + findQuery);

	postgres.client.query(findQuery, opptyIds)
	.then(data => {

		if(cb) {
			cb(data, null);
		}
		else {
			return data;
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
* Date: May 22, 2017
* Descrition: Method to find Opportunity records in postgres
*/
var findOpportunities = function(cb) {
	console.log('*** findOpportunities');
	
	var whereClause = '';
	var tableName = process.env.OPP_TABLE_NAME ? process.env.OPP_TABLE_NAME : 'Opportunity';
	var speakerRecTypeId = process.env.OPP_SPEAKER_RT_ID;

	var findQuery = "Select sfid, type, stagename from " + tableName;

	if(speakerRecTypeId) {
		whereClause += " AND RecordTypeId = ${speakerRecType}";
	}

	findQuery += ' Order By LastModifiedDate DESC';

	postgres.client.query(findQuery, {speakerRecType: speakerRecTypeId})
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
	findOpportunityContactRoles: findOpportunityContactRoles,
	findOpportunities: findOpportunities,
	findSpeakerContacts: findSpeakerContacts,
	findUser: findUser
}