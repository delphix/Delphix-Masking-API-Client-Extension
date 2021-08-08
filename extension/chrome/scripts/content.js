chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("something happening from the extension");
    var data = request.data || {};
    if (data.action == 'login') {
        var auth_btn = $('#auth_container a')[0];
        auth_btn.click();
        auth_btn = $('#swagger-ui-container div.api-popup-dialog div.auth_submit .auth_logout__button');
        if (auth_btn.length != 0) {
            if (data.force_logout) {
                auth_btn.click(); //logout first
            } else {
                console.log('Already logged in. Doing nothing');
                auth_btn = $('#swagger-ui-container div.api-popup-dialog .api-popup-cancel');
                auth_btn.click();
                sendResponse({
                    data: data,
                    success: true
                });
                return;
            }

        }
        //var api_key_input = $('#swagger-ui-container > div.api-popup-dialog > div.api-popup-dialog-wrapper > div.api-popup-content > div > div > div > div.auth_inner > div > div > div > div > div:nth-child(3) > div:nth-child(3) > input');
        $(document).ready(function() {
            doLogin(data, sendResponse);
        });

    } else if (data.action == 'isLoggedIn') {
        var auth_btn = $('#auth_container a')[0];
        auth_btn.click();
        auth_btn = $('#swagger-ui-container div.api-popup-dialog div.auth_submit .auth_logout__button');
        var cancel_btn = $('#swagger-ui-container div.api-popup-dialog .api-popup-cancel');
        cancel_btn.click();
        if (auth_btn.length != 0) {
            sendResponse({
                data: {
                    'loggedin': true
                },
                success: true
            });
            return;
        }
        sendResponse({
            data: {
                'loggedin': false
            },
            success: true
        });

    } else if (data.action == 'logout') {
        var auth_btn = $('#auth_container a')[0];
        auth_btn.click();
        auth_btn = $('#swagger-ui-container div.api-popup-dialog div.auth_submit .auth_logout__button');
        if (auth_btn.length != 0) {
            auth_btn.click();
            sendResponse({
                data: data,
                success: true
            });
            return;
        }
        sendResponse({
            data: data,
            success: true
        });

    } else if (data.action == 'populateInput') {
        var input_elem = $(data.selector);
        input_elem.val(data.input);
        trigger_change_event(input_elem[0]);
    } else if (data.action == 'getApiEndpoints') {
        //var resources = $('#resources li[class="resource"]');
        var resources = $('#resources li[class="resource"],#resources li[class="resource active"]');
        var endpoints = []

        resources.each(function(idx) {
            var item = $(this);
            var e = {
                id: item.attr('id')
            };
            var header = item.find('.heading h2 a');
            e.name = header.text();
            e.selected = this.style.display !== "none";
            endpoints.push(e);
        });

        sendResponse({
            data: {
                'endpoints': endpoints
            },
            success: true
        });
    } else if (data.action == 'filterEndpoints') {
        var resources = $('#resources li[class="resource"],#resources li[class="resource active"]');
        var selectedEndpoints = data.filter;

        resources.each(function(idx) {
            var item = $(this);
            if (selectedEndpoints && selectedEndpoints.includes(item.attr('id'))) {
                this.style.display = "";
            } else {
                this.style.display = "none";

            }
        });

        sendResponse({
            data: data,
            success: true
        });
    } else {
        console.log('Undefined action');
        sendResponse({
            data: data,
            success: true
        });
    }


});


var doLogin = function(data, sendResponse) {
    $.ajax({
        type: "POST",
        url: "/masking/api/login",
        data: JSON.stringify({
            "username": data.username,
            "password": data.password
        }),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            authSuccess(data);
            sendResponse({
                data: data,
                success: true
            });
        },
        error: function(req, status, error) {
            sendResponse({
                data: data,
                success: false
            });
            var auth_btn = $('#swagger-ui-container div.api-popup-dialog .api-popup-cancel');
            auth_btn.click();
            alert('Login failure for credentials ' + this.data + ': ' + req.responseJSON.errorMessage);
        },
        dataType: "json"
    });

}


var authSuccess = function(data) {
    var api_key_input = $('#swagger-ui-container div.api-popup-dialog div.auth_inner input');
    //auth_btn = $('#swagger-ui-container > div.api-popup-dialog > div.api-popup-dialog-wrapper > div.api-popup-content > div > div > div > div.auth_submit > button');
    api_key_input.val(data.Authorization);
    trigger_change_event(api_key_input[0]);
    auth_btn = $('#swagger-ui-container div.api-popup-dialog div.auth_submit .auth_submit__button');
    auth_btn.click();
    console.log('Login action');

}