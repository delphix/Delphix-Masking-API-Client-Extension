chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("something happening from the extension");
    var data = request.data || {};
    if (data.action == 'login') {
        var auth_btn = document.getElementsByClassName('btn authorize unlocked')[0];
        auth_btn.click();
        var login_button = document.getElementsByClassName('btn modal-btn auth authorize button')[0];
        if (typeof(login_button) == undefined) {
            if (data.force_logout) {
                console.log("Logging out before re-logging in.");
                auth_btn.click();
            } else {
                console.log('Already logged in.');
                close_btn = document.getElementsByClassName('btn modal-btn auth btn-done button')[0];
                close_btn.click();
                sendResponse({
                    data: data,
                    success: true
                });
                return;
            }
        }
        $(document).ready(function() {
            doLogin(data, sendResponse);
        });

    } else if (data.action == 'isLoggedIn') {
        var logged_in_btn = document.getElementsByClassName('btn authorize locked')[0];
        if (typeof(logged_in_btn) != undefined && logged_in_btn != null) {
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
        var auth_btn = document.getElementsByClassName('btn authorize locked')[0];
        if (auth_btn.length != 0) {
            auth_btn.click();
            logout_button = document.getElementsByClassName('btn modal-btn auth button')[0];
            logout_button.click();
            close_button = document.getElementsByClassName('btn modal-btn auth btn-done button')[0];
            close_button.click();
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
    var api_key_input = document.getElementsByTagName('input')[0];
    api_key_input.value = data.Authorization;
    trigger_change_event(api_key_input);
    var login_button = document.getElementsByClassName('btn modal-btn auth authorize button')[0];
    login_button.click();
    var close_button = document.getElementsByClassName('btn modal-btn auth btn-done button')[0];
    close_button.click();
}
