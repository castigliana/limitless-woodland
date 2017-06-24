$(function() {

    var selectedItems = [];
    var itemsToUpdate = [];

    var approvalStatus = [
        { Name: "-- None --", Id: 0 },
        { Name: "Approved", Id: 1 },
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
            var l = {
                'name': itemsToUpdate[item]['Name'],
                'company': itemsToUpdate[item]['Company'],
                'approval_status__c': itemsToUpdate[item]['Approval Status'],
                'tier__c': itemsToUpdate[item]['Tier'],
                'sfid': itemsToUpdate[item]['sfid'],
                'sendinvitationonconversion__c': itemsToUpdate[item]['Send Invitation'],
                'title': itemsToUpdate[item]['Title'],
                'description': itemsToUpdate[item]['Description']
            }
            // format the data 
            if(l['approval_status__c'] == 0) {
                l['approval_status__c'] = null;
            }
            else if(l['approval_status__c'] == 1) {
                l['approval_status__c'] = 'Approved';
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

        $.ajax({
            type: "PUT",
            url: "/leads",
            headers: { 'authorization': sessionStorage.getItem('accessToken') },
            contentType: 'application/json',
            data: JSON.stringify(leadsToUpdate),
            success: function(response, status) {
                if(response.success && response.status == 200) {
                    console.log('Leads updated'); 
                    $('#status-modal').modal('show');
                    window.setTimeout(function() {
                        location.reload();
                    }, 1500);
                    //location.reload();
                }
                else if(!response.success && response.status == 403) {
                    $(location).attr('href', '/error');
                }
            },
            error: function(xhrObj, status, error) {
                console.log(status + ': ' + error);
            }
         });
    }

    function mapIncomingLeadColumns(data) {
        // format the data so that jsGrid displays it correctly
        var leadsToApprove = []; // array to collect data to be displayed
        for(var index in data) {
            var l = {
                'Name': data[index].name,
                'Company': data[index].company,
                'Approval Status': data[index].approval_status__c,
                'Tier': data[index].tier__c,
                'sfid': data[index].sfid,
                'Send Invitation': true,
                'Title': data[index].title,
                'Description': data[index].description
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
        return leadsToApprove;
    }


    function getLeads() {
        console.log('*** getLeads');
         // create a deferred object, resolve it once data receieved from server is formatted 
         var d = $.Deferred();

         $.ajax({
                type: "GET",
                url: "/leads",
                headers: { 'authorization': sessionStorage.getItem('accessToken') },
                success: function(response, status) {
                    if(response.success && response.status == 200) {
                        var leadsToApprove = mapIncomingLeadColumns(response.data);
                        d.resolve(leadsToApprove);
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
        },
        editItem: function(item) {
            console.log(item);
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
            /*{
                headerTemplate: function() { return "Select" },

                itemTemplate: function(_, item) {
                    return $("<input>").attr("type", "checkbox")
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem(item) : unselectItem(item);
                            });
                },
                align: "center",
                width: 20
            }, */
            { name: 'Send Invitation', type: "checkbox", align: "center", width: 30 },
            { name: 'Title', type: "text", align: "center", width: 30 },
            { name: "Name", type: "text", width: 50, readOnly: true },
            { name: "Company", type: "text", width: 80, readOnly: true },
            { name: 'Description', type: "textarea", align: "center", width: 140 },
            { name: "Approval Status", type: "select", width: 40, items: approvalStatus, valueField: "Id", textField: "Name" },
            { name: "Tier", type: "select", width: 40, items: tier, valueField: "Id", textField: "Name" },
            { name: "Save/Cancel", type: "control", deleteButton: false, editButton: true, width: 40 }
        ]
    });
});