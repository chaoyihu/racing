if (document.cookie !== null && document.cookie !== "") {
    console.log("Sending session id to server:");
    console.log(document.cookie);
    let data = `{
        "type"      : "session_id", 
        "session_id": "${document.cookie}"
    }`;
    var url = window.location.host + "/login";
    var protocol = "http";
    var header_params = new Map();
    header_params.set("Content-Type", "application/json");
    my_xhr_post(data, url, protocol, header_params);
}

function login() {
    var username = document.getElementById("username_box_id").value;
    var password = document.getElementById("password_box_id").value;
    if (username == null || username == '' || password == null || password == '') {
        alert("Username and password must not be empty.")
    } else {
        console.log("Sending credential to server.");
        let data = `{
            "type"    : "login_credential", 
            "username": "${username}", 
            "password": "${password}"
        }`;
        var url = window.location.host + "/login";
        var protocol = "http";
        var header_params = new Map();
        header_params.set("Content-Type", "application/json");
        my_xhr_post(data, url, protocol, header_params);
    };
};
