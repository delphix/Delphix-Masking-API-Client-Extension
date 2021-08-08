document.addEventListener('DOMContentLoaded', function() {
    //document.getElementById('status').textContent = "Extension loaded";
    var settings = {
        'username': 'admin',
        'password': 'Admin-12',
        'data': []
    };
    chrome.storage.sync.get(settings, function(opts) {
        setup(opts);
    });
});

const setup = function(opts) {
    document.querySelector('#go-to-setting').addEventListener('click', function() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('settings.html'));
        }
    });

    var button = document.getElementById('login');
    button.addEventListener('click', function() {
        var data = {
            'action': 'login',
            'force_logout': false,
            'username': opts.username,
            'password': opts.password
        };
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                data: data
            }, function(response) {
                if (!response) {
                    return;
                }
                if (response.success) {
                    $('#status').html('Login success');
                    console.log('success');

                } else {
                    $('#status').html('Login failure. Please check credentials in the settings');
                    console.log('failure');

                }
            });
        });
        loginButton = document.getElementById('login');
        loginButton.style.display = "none";
        logoutButton = document.getElementById('logout');
        logoutButton.style.display = "block";
        inputSelection = document.getElementById('inputSelection');
        inputSelection.style.display = "none";

    });

    button = document.getElementById('logout');
    button.addEventListener('click', function() {
        var data = {
            'action': 'logout',
        };
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                data: data
            }, function(response) {});
        });
        logoutButton = document.getElementById('logout');
        logoutButton.style.display = "none";
        loginButton = document.getElementById('login');
        loginButton.style.display = "block";
        inputSelection = document.getElementById('inputSelection');
        inputSelection.style.display = "none";

    });

    inputSelection = document.getElementById('inputSelection');
    inputSelection.addEventListener('change', function() {
        var selectedval = $('#inputSelection').val();
        console.log('Selected ' + selectedval);
        if (selectedval < 0) {
            return;
        }

        selectedval = opts.data[selectedval];
        var data = {
            'action': 'populateInput',
            'selector': selectedval.input_type,
            'input': selectedval.input
        };

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                data: data
            }, function(response) {});
        });


    });

    apiSelection = document.getElementById('apiSelection');
    apiSelection.addEventListener('click', function() {
        var selectedval = $('#apiSelection').val();
        console.log('Selected ' + JSON.stringify(selectedval));

        var data = {
            'action': 'filterEndpoints',
            'filter': selectedval
        };

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                data: data
            }, function(response) {});
        });


    });

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        console.log(JSON.stringify(opts));
        chrome.tabs.sendMessage(tabs[0].id, {
            data: {
                'action': 'isLoggedIn'
            }
        }, function(response) {
            button = document.getElementById('logout');
            console.log('Response ' + JSON.stringify(response));
            //$('#inputDiv').style.display = "none";
            $('#inputSelection')[0].style.display = "none";
            if (!response) {
                button.style.display = "none";
                button = document.getElementById('login');
                button.style.display = "none";
                $('#status').html('Masking API client page not found.');
                button = document.getElementById('go-to-setting');
                button.style.display = "none";
                button = document.getElementById('apiSelection');
                button.style.display = "none";
                return;
            }
            if (response.data.loggedin) {
                button = document.getElementById('login');
                $('#inputSelection')[0].style.display = "";
                $('#inputSelection').empty();
                var o = new Option("None", -1);
                $('#inputSelection').append(o);
                console.log(JSON.stringify(opts));
                opts.data.forEach(function(item, idx) {
                    var o = new Option(item.name, idx);
                    $('#inputSelection').append(o);
                });

                loginButton = document.getElementById('login');
                loginButton.style.display = "none";
                logoutButton = document.getElementById('logout');
                logoutButton.style.display = "block";
                inputSelection = document.getElementById('inputSelection');
                inputSelection.style.display = "none";

            }

            button.style.display = "none";
        });
    });

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            data: {
                'action': 'getApiEndpoints'
            }
        }, function(response) {
            if (!response || !response.data) {
                return;
            }
            response.data.endpoints.forEach(function(item, idx) {
                var o = new Option(item.name, item.id, true, item.selected);
                $('#apiSelection').append(o);

            });
            $('#apiSelection').multipleSelect({
                name: '',
                isOpen: false,
                placeholder: '',
                selectAll: true,
                selectAllDelimiter: ['[', ']'],
                minimumCountSelected: 3,
                ellipsis: false,
                openOnHover: true,
                multiple: false,
                multipleWidth: 80,
                single: false,
                filter: false,
                width: undefined,
                dropWidth: undefined,
                maxHeight: 250,
                container: null,
                position: 'bottom',
                keepOpen: false,
                animate: 'none', // 'none', 'fade', 'slide'
                displayValues: false,
                delimiter: ', ',
                addTitle: false,
                filterAcceptOnEnter: false,
                hideOptgroupCheckboxes: false,

                selectAllText: 'Select all',
                allSelected: 'All selected',
                countSelected: '# of % selected',
                noMatchesFound: 'No matches found',

                styler: function() {
                    return false;
                },
                textTemplate: function($elm) {
                    return $elm.html();
                },
                labelTemplate: function($elm) {
                    return $elm.attr('label');
                },

                onOpen: function() {
                    return false;
                },
                onClose: function() {
                    return false;
                },
                onCheckAll: function() {
                    var selectedval = $('#apiSelection').val();
                    console.log('Selected ' + JSON.stringify(selectedval));

                    var data = {
                        'action': 'filterEndpoints',
                        'filter': selectedval
                    };

                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            data: data
                        }, function(response) {});
                    });
                    return false;
                },
                onUncheckAll: function() {
                    var selectedval = $('#apiSelection').val();
                    console.log('Selected ' + JSON.stringify(selectedval));

                    var data = {
                        'action': 'filterEndpoints',
                        'filter': selectedval
                    };

                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            data: data
                        }, function(response) {});
                    });
                    return false;
                },
                onFocus: function() {
                    return false;
                },
                onBlur: function() {
                    return false;
                },
                onOptgroupClick: function() {
                    return false;
                },
                onClick: function() {
                    var selectedval = $('#apiSelection').val();
                    console.log('Selected ' + JSON.stringify(selectedval));

                    var data = {
                        'action': 'filterEndpoints',
                        'filter': selectedval
                    };

                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            data: data
                        }, function(response) {});
                    });
                    return false;
                },
                onFilter: function() {
                    return false;
                }
            });
        });
    });

}