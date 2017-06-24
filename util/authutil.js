var pgp = require('pg-promise')();
var postgres = require('../lib/postgres.js');
var jwt = require('jsonwebtoken');


/**
* Created By: Ashish N
* Date: May 15, 2017
* Descrition: Method to create json web token
*/
var createToken = function(user) {
	console.log('*** createToken');
	// create token if user is found and password is right
	var signingSecret = process.env.SIGNING_SECRET;
	var token = jwt.sign(user, signingSecret, {
		expiresIn: 300 // token expiry in seconds
	});

	return token;
}

/**
* Created By: Ashish N
* Date: May 15, 2017
* Descrition: Method to check if user is authenticated
*/
var isAuthenticated = function(req, res, next) {
	console.log('*** isAuthenticated');
	
	validateRequest(req, res, function(decoded) {
		if(decoded) {
			next();
		}
	});
}


/**
* Created By: Ashish N
* Date: May 15, 2017
* Descrition: Method to validate request using token (if provided) in the request
*/
var validateRequest = function(req, res, callback) {
	console.log('*** validateRequest');
	// find the token which was provided as part of authetication in the request body, query or headers
	var token = req.body.token || req.query.token || req.headers.authorization;
	// check if the token exists in the cookie. This is for the first time this API is loaded on login
	if(!token) {
		token = req.cookies.accessToken;
	} 

	// decode token
	if (token) {
		
		// verifies secret and checks exp
		jwt.verify(token, process.env.SIGNING_SECRET, function(err, decoded) {      
		  if (err) {
		    return res.json({ success: false, message: 'Failed to authenticate token.', error: err });    
		  } 
		  else {
		  	console.log('Authentication successful.');
		    // if everything is good, save to request for use in other routes
		    req.decoded = decoded;    
		    callback(req.decoded);
		  }
		});

	} else {

		// if there is no token
		// return an error
		/*return res.status(403).send({ 
		    success: false, 
		    message: 'No token provided.' 
		});*/
		console.log('No token provided');
		// render the login page if no token is provided by the client
		res.render('signin', { title: 'Sign In' });
	}
}

module.exports = {
	isAuthenticated: isAuthenticated,
	validateRequest: validateRequest,
	createToken: createToken
};
