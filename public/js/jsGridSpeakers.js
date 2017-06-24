$(function() {

    var inviteeType = [
        { Name: "Keynote", Id: 0 },
        { Name: "Deep Dive", Id: 1 },
        { Name: "Panel", Id: 2 },
        { Name: "Advisory Committee", Id: 3 },
    ];

    function getSpeakers() {
        console.log('*** getSpeakers');
         // create a deferred object, resolve it once data receieved from server is formatted 
         var d = $.Deferred();

         $.ajax({
                type: "GET",
                url: "/leads/speakers",
                headers: { 'authorization': sessionStorage.getItem('accessToken') },
                success: function(response, status) {
                    console.log(response.data);
                    if(response.success && response.status == 200) {
                        var speakers = response.data;
                        speakers.sort(function(a,b){
                          // Turn your strings into dates, and then subtract them
                          // to get a value that is either negative, positive, or zero.
                          return new Date(b.LastModifiedDate) - new Date(a.LastModifiedDate);
                        });
                        d.resolve(speakers);
                        console.log(speakers);
                    }
                    else if(!response.success && response.status == 403) {
                        $(location).attr('href', '/error');
                    }                    
                },
                error: function(xhrObj, status, error) {
                    console.log(status + ': ' + error);
                }
            });

         //return the promise on deferred object created above
         return d.promise();
    }

    var db = {
        loadData: function() {
            return getSpeakers();
        }
    }

    $("#jsGrid").jsGrid({
        //height: "70%",
        width: "100%",
        editing: false,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 10,
        pageButtonCount: 5,
        controller: db,
        fields: [
            { name: "Name", type: "text", width: 50 },
            { name: "Title", type: "text", width: 50},
            { name: "Company", type: "text", width: 50},
            { name: "Stage", type: "text", width: 50}
        ]
    });
    
});