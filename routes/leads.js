var express = require('express');
var router = express.Router();
var dbUtil = require('../util/dbutil');
var authUtil = require('../util/authutil');
var speakerUtil = require('../util/speakerutil');

/* Get leads listing. */
router.get('/', authUtil.isAuthorized, function(req, res, next) {
	var leadName = req.query.name;
	dbUtil.findLeads(leadName, function(data, err) {
		if(err) {
			throw err;
		}
		res.json({'status': 200, 'success': true, 'data': data});
	});

});

// Update leads in the request body
router.put('/', authUtil.isAuthorized, function(req, res, next) {
	var leadsToUpdate = req.body;
	
	dbUtil.updateLeads(leadsToUpdate, function(data, err) {
		if(err) {
			throw err;
		}
		res.json({'status': 200, 'success': true, 'data': data});
	});

});

// Get speaker contacts
router.get('/speakers', authUtil.isAuthorized, function(req, res, next) {
	
	speakerUtil.getSpeakerRecords(function(err, data) {
		if(err) {
			throw err;
		}
		res.json({'status': 200, 'success': true, 'data': data});
	});
}); 


module.exports = router;
