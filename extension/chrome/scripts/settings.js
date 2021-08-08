// Saves options to chrome.storage
function save_options() {
    var username = $('#username').val();
    var password = $('#password').val();
    var grid = $("#inputs").data("JSGrid");
    chrome.storage.sync.set({
        'username': username,
        'password': password,
        'data': grid.data
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        'username': 'API-User',
        'password': 'XXX',
        'data': []
    }, function(items) {
        restore_credentials(items);
        restore_inputs(items);
    });
}

function restore_credentials(items) {
    $('#username').val(items.username);
    $('#password').val(items.password);

}

function restore_inputs(items) {
    var inputTypes = [{
        Name: "Mounts",
        Id: "#mountFilesystem_mount_content .operation-params .body-textarea"
    }, ];

    $("#inputs").jsGrid({
        width: "100%",
        height: "400px",

        inserting: true,
        editing: true,
        sorting: true,
        paging: true,

        data: items.data,

        fields: [{
            name: "name",
            title: 'Name',
            type: "text",
            width: 150,
            validate: "required"
        }, {
            name: "input_type",
            title: 'Input Type',
            type: "select",
            items: inputTypes,
            valueField: "Id",
            textField: "Name"
        }, {
            name: "input",
            title: 'Input',
            type: "textarea",
            title: "Input",
            sorting: false
        }, {
            type: "control"
        }]
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
const togglePassword = $("#togglePassword");
const showOrHidePassword = () => {
    const password = $('#password')[0];
    var type = password.type;
    if (type === 'password') {
        password.type = 'text';
    } else {
        password.type = 'password';
    }
};

togglePassword.on("change", showOrHidePassword);