$(function() {

    var selectedItems = [];
    var itemsToUpdate = [];

    var approvalStatus = [
        { Name: "-- None --", Id: 0 },
        { Name: "Approve", Id: 1 },
        { Name: "Deferred", Id: 2 }
    ];

    var tier = [
        { Name: "-- None --", Id: 0 },
        { Name: "Tier 1", Id: 1 },
        { Name: "Tier 2", Id: 2 },
        { Name: "Tier 3", Id: 3 },
    ];

    var selectItem = function(item) {
        selectedItems.push(item);
    };
 
    var unselectItem = function(item) {
        selectedItems = $.grep(selectedItems, function(i) {
            return i !== item;
        });
    };

    // bind on click event od update button to a function. onclick attribute on button tag won't work since the updateITems function is not in global context
    $('#btnUpdate').click(updateLeads);


    function updateLeads() {
        console.log(itemsToUpdate);
        var leadsToUpdate = [];

        for (item in itemsToUpdate) {
            //console.log(itemsToUpdate[item]['First Name']);
            var l = {
                'firstname': itemsToUpdate[item]['First Name'],
                'lastname': itemsToUpdate[item]['Last Name'],
                'company': itemsToUpdate[item]['Company'],
                'approval_status__c': itemsToUpdate[item]['Approval Status'],
                'tier__c': itemsToUpdate[item]['Tier'],
                'sfid': itemsToUpdate[item]['sfid'],
                'sendinvitationonconversion__c': itemsToUpdate[item]['Send Invitation']
            }
            // format the data 
            if(l['approval_status__c'] == 0) {
                l['approval_status__c'] = null;
            }
            else if(l['approval_status__c'] == 1) {
                l['approval_status__c'] = 'Approve';
            }
            else if(l['approval_status__c'] == 2) {
                l['approval_status__c'] = 'Deferred';
            }

            if(l['tier__c'] == 0) {
                l['tier__c'] = null;
            }
            else if(l['tier__c'] == 1) {
                l['tier__c'] = 'Tier 1';
            }
            else if(l['tier__c'] == 2) {
                l['tier__c'] = 'Tier 2';
            }
            else if(l['tier__c'] == 3) {
                l['tier__c'] = 'Tier 3';
            }
            leadsToUpdate.push(l);
        }
        console.log(leadsToUpdate);

        $.ajax({
            type: "PUT",
            url: "/leads",
            contentType: 'application/json',
            data: JSON.stringify(leadsToUpdate),
            success: function(data, status) {
                console.log('Leads updated');
                location.reload();
            },
            error: function(xhrObj, status, error) {
                console.log(status + ': ' + error);
            }
         });
    }

    function getLeads() {
         // create a deferred object, resolve it once data receieved from server is formatted 
         var d = $.Deferred();

         $.ajax({
                type: "GET",
                url: "/leads",
                success: function(data, status) {
                    console.log('*** Leads received- Status: '+ status);
                    // format the data so that jsGrid displays it correctly
                    var leadsToApprove = []; // array to collect data to be displayed
                    for(var index in data) {
                        var l = {
                            'First Name': data[index].firstname,
                            'Last Name': data[index].lastname,
                            'Company': data[index].company,
                            'Approval Status': data[index].approval_status__c,
                            'Tier': data[index].tier__c,
                            'sfid': data[index].sfid,
                            'Send Invitation': true
                        }

                        if(l['Approval Status'] == null) {
                            l['Approval Status'] = 0;
                        } 
                        else if(l['Approval Status'] == 'Approve' || l['Approval Status'] == 'Approved') {
                            l['Approval Status'] = 1;
                        }
                        else if(l['Approval Status'] == 'Deferred') {
                            l['Approval Status'] = 2;
                        }

                        if(l['Tier'] == null) {
                            l['Tier'] = 0;
                        } 
                        else if(l['Tier'] == 'Tier 1') {
                            l['Tier'] = 1;
                        }
                        else if(l['Tier'] == 'Tier 2') {
                            l['Tier'] = 2;
                        } 
                        else if(l['Tier'] == 'Tier 3') {
                            l['Tier'] = 3;
                        } 

                        leadsToApprove.push(l);
                    }

                    d.resolve(leadsToApprove);
                },
                error: function(xhrObj, status, error) {
                    console.log(status + ': ' + error);
                }
            });

         //return the promise on deferred object created above
         return d.promise();
    }

    // controller function for jsGrid
    var db = {
        // make AJAX call to load lead records from the database
        loadData: function() {
            return getLeads();
        },

        // collect items to update in an array and update them later on Update button click
        updateItem: function(item) {
            console.log(this);
            //console.log('Item to update: ' + JSON.stringify(item));
            itemsToUpdate.push(item);
        }
    }
    
   var config = $('#jsGrid').jsGrid({
       // height: "70%",
        width: "100%",
        //filtering: true,
        sorting: true,
        editing: true,
        paging: true,
        autoload: true,
        pageSize: 15,
        confirmDeleting: false,
        controller: db,
        fields: [
            {
                headerTemplate: function() { return "Select" },

                itemTemplate: function(_, item) {
                    return $("<input>").attr("type", "checkbox")
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem(item) : unselectItem(item);

                            });
                },
                align: "center",
                width: 50
            },
            { name: 'Send Invitation', type: "checkbox", align: "center", width: 50 },
            { name: "First Name", type: "text", width: 50, readOnly: true },
            { name: "Last Name", type: "text", width: 50,  validate: "required", readOnly: true },
            { name: "Company", type: "text", width: 100, readOnly: true },
            { name: "Approval Status", type: "select", items: approvalStatus, valueField: "Id", textField: "Name" },
            { name: "Tier", type: "select", items: tier, valueField: "Id", textField: "Name" },
            { name: "Save/Cancel", type: "control", deleteButton: false, editButton: true, width: 40 }
        ]
    });
});