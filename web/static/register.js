function register() {
    var username = document.getElementById("username_box_id").value;
    var password = document.getElementById("password_box_id").value;
    var confirm = document.getElementById("confirm_password_box_id").value;
    if (password !== confirm) {
        alert("Confirmed password inconsistent with password.")
    } else {
        console.log("Sending credential to server.");
        let data = JSON.stringify({
            username: username, 
            password: password
        });
        var url = window.location.host + "/sprinting/register";
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
            } else {
                var obj = parser.data;
                console.log(obj);
                if (obj["type"] == "alert") {
                    console.log(obj["message"]);
                } else {
                    set_cookie("session_id", obj["session_id"], 10);
                    my_redirect(obj["redirect_url"], obj["protocol"]);
                }
            }
        };
        xhr.send(data);
    };
}
