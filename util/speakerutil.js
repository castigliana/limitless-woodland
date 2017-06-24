var dbUtil = require('./dbutil');

function getOpportunities(cb) {
	dbUtil.findOpportunities(function(data, err) {
		if(err) {
			throw err;
		}
		getOpportunityContactRoles(data, cb);
	});
}

function getOpportunityContactRoles(opps, cb) {
	var opptyIds = [];

	for(var opp in opps) {
		opptyIds.push(opps[opp]['sfid']);
	}
	
	dbUtil.findOpportunityContactRoles(opptyIds, function(data, err) {
		if(err) {
			throw err;
		}
		getContacts(opps, data, cb);
	})
}

function getContacts(opps, opptyContactRoles, cb) {
	console.log('$$$ getContacts');
	var contactIds = [];

	for (var ocr in opptyContactRoles) {
		contactIds.push(opptyContactRoles[ocr]['contactid']);
	}

	dbUtil.findSpeakerContacts(contactIds, function(data, err) {
		if(err) {
			throw err;
		}

		if(cb) {
			var obj = {
				'opportunities': opps,
				'opportunitycontactroles': opptyContactRoles,
				'contacts': data
			}
			cb(null, obj);
		}
	});

	/*
	Next steps:
		1) For each contact, find corresponding opportunity id from OpportunityContactRole records
		2) Get the type field for opportunity Id found in #1
		3) Create new object with Contact's First Name, Last Name and Opportunity Type found in #2
		4) Repeat the process
	*/
}

function findOppIdForContact(oppContactRoles, contactId) {
	
	var oppId;
	for(var i=0; i<oppContactRoles.length; i++) {
		if(oppContactRoles[i]['contactid'] == contactId) {
			oppId = oppContactRoles[i]['opportunityid'];
			break;
		}
	}
	return oppId;
}

function findOpportunityStage(oppList, oppId) {
	
	var oppStage;
	for (var i=0; i<oppList.length; i++) {
		if(oppId == oppList[i]['sfid']) {
			oppStage = oppList[i]['stagename'];
			break;
		}
	}
	return oppStage;
}

function getSpeakerRecords(cb) {
	console.log('$$$ getSpeakerRecords');
	var speakerContacts = [];

	getOpportunities(function(err, data) {
		if(err) {
			throw err;
		}

		var oppList = data['opportunities'];
		var oppContactRoles = data['opportunitycontactroles'];
		var contacts = data['contacts'];

		//console.log(data);

		for(var i=0; i<contacts.length; i++) {
			var contactId = contacts[i]['sfid'];
			var oppId = findOppIdForContact(oppContactRoles, contactId);
			var oppStage = findOpportunityStage(oppList, oppId);

			var speaker = {
				'Name': contacts[i]['name'],
				'Stage': oppStage,
				'Title': contacts[i]['title'],
				'Company': contacts[i]['accountname'],
				'LastModifiedDate': contacts[i]['lastmodifieddate']
			};

			speakerContacts.push(speaker);
			console.log(speakerContacts);
		}

		if(cb) {
			cb(null, speakerContacts);
		}
	});
}


module.exports = {
	getSpeakerRecords: getSpeakerRecords
}