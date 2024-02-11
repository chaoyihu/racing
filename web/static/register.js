function register() {
    var username = document.getElementById("username_box_id").value;
    var password = document.getElementById("password_box_id").value;
    var confirm = document.getElementById("confirm_password_box_id").value;
    if (password !== confirm) {
        alert("Inconsistent entries of password.")
    } else {
        console.log("Sending credential to server.");
        let data = JSON.stringify({
            type    : "register_info", 
            username: username, 
            password: password
        });
        var url = window.location.host + "/register";
        var protocol = "https";
        var xhr = new XMLHttpRequest();
        if (!url.startsWith(protocol)) {
            url = protocol + "://" + url;
        };
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            
        };
        xhr.send(data);
    };
}
