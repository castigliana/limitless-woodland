var express = require('express');
var dbutil = require('../util/dbutil');
var authutil = require('../util/authutil');
var router = express.Router();
var jwt = require('jsonwebtoken');


/* GET home page. */
router.get('/', authutil.isAuthenticated, function(req, res, next) {
	res.render('index', { title: 'WFEB 2017 Speaker Approval' });
  //res.json({success: true});
});

router.get('/speakers', authutil.isAuthenticated, function(req, res, next) {
	res.render('speakers', { title: 'Approved Speakers' });
  //res.json({success: true});
});


// Error page
router.get('/error', authutil.isAuthenticated, function(req, res, next) {
	res.render('error', { title: 'Error', message: 'You do not have permission to access the requested resources. Please contact the administrator.' });
});

// route to authenticate users
router.post('/authenticate', function(req, res, next) {
	
	// find the user record using the user details received in authentication request
	dbutil.findUser(req.body, function(err, user) {
		if(err) {
			throw err;
		}
		// user not found
		if(!user) {
			res.json( { success: false, message: 'Authentication failed. User not found'});
		}
		else if(user) {
			user = user[0];
			// check if password matches
			if(user.password != req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			}
			else {
				// create token
				var token = authutil.createToken(user);
				// set cookie in the response, this cookie will be used to authorize the first request to the app after login
				// it will not (in any way) be used to authenticate a user
				var cookieMaxAge = process.env.COOKIE_EXPIRES_IN ? process.env.COOKIE_EXPIRES_IN : 300000;
				console.log('cookieMaxAge: ' + cookieMaxAge);
				res.cookie('accessToken', token, { maxAge: parseInt(cookieMaxAge), httpOnly: true }); // maxAge is in millisecs
				// return json object along with token
				res.json({
					success: true,
					token: token
					//scopes: [] // powerful tool to design access control
				});
			}
		}
	});
});

module.exports = router;
