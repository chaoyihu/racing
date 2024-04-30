function login() {
    var username = document.getElementById("username_box_id").value;
    var password = document.getElementById("password_box_id").value;
    if (username == null || username == '' || password == null || password == '') {
        alert("Username and password must not be empty.")
    } else {
        console.log("Sending credential to server.");
        let data = JSON.stringify({
            type    : "login_credential", 
            username: username, 
            password: password
        });
        var url = window.location.host + "/sprinting/login";
        var protocol = "http";
        var xhr = new XMLHttpRequest();
        if (!url.startsWith(protocol)) {
            url = protocol + "://" + url;
        };
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            var parser = server_message_check(xhr.responseText);
            if (!parser.success) {
                console.log(parser.message);
                alert("Something's wrong, please try again.")
            } else {
                var obj = parser.data;
                console.log(obj);
                if (obj["type"] == "alert") {
                    alert(obj["message"]);
                } else {
                    set_cookie("session_id", obj["session_id"], 10);
                    my_redirect(obj["redirect_url"], obj["protocol"]);
                }
            }
        };
        xhr.send(data);
    };
};
