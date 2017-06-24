$(function(window) {

	$('form').submit(function(event) {
		// get the form data
        var formData = {
            'email' 	: $('#inputEmail').val(),
            'password'	: $('#inputPassword').val()
        };

        // process the form
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '/authenticate', // the url where we want to POST
            data        : JSON.stringify(formData), // our data object
            dataType    : 'json', // what type of data do we expect back from the server
            contentType	: 'application/json'
        })
            // using the done promise callback
            .done(function(response) {
                if(response.success) {
                	
                	console.log(response);
                	// store the token in localstorage/cookie
					 if (typeof(Storage) == "undefined" ) {
					            alert("Your browser does not support HTML5 localStorage. Try upgrading.");
					    } 
					    else {
					        console.log("Both localStorage and sessionStorage support is there.");
					    }
                    console.log(response.token);
                    alert('Login successful');
                	// save the access token in the session storage for use in following requests
                	sessionStorage.setItem('accessToken', response.token);

                	//$(location).attr('href', '/?token=' + sessionStorage.getItem('accessToken'));
                	$(location).attr('href', '/');
                }
              	
            })
            // using the fail promise callback
            .fail(function(err) {
            	console.log(err);
            	//location.reload();
            });


		// prevent page reload
		event.preventDefault();
	});	
});