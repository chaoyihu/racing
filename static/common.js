function handle_server_message(txt) {
    console.log(txt);
    const obj = JSON.parse(txt);
    if (obj["type"] == "log") {
        console.log(obj["text"]);
    };
    if (obj["type"] == "alert") {
        alert(obj["text"]);
    };
    if (obj["type"] == "redirect") {
        var session_id = obj["session_id"]
        console.log(session_id);
        document.cookie = session_id;
        my_redirect(obj["url"]);
    };
    if (obj["type"] == "user_data") {
       document.getElementById("user_info").innerHTML = `
           <p>username: ${obj["username"]}</p>
           <p>history: ${obj["user_history"]}</p>
           <p>level: ${obj["user_level"]}</p>
       ` 
    };
    if (obj["type"] == "task_info") {
      task_id = obj["id"]
      task_link = obj["href"];
      insert_task_row(task_id, task_link);
    };
};


function my_redirect(url) {
    var complete_href = window.location.protocol + '//' + window.location.host + url; // window.location.href will not work on localhost.
    console.log("redirecting to " + complete_href);
    window.location.replace(complete_href); 
};


function my_xhr_post(data, url, protocol, header_params) {
    var xhr = new XMLHttpRequest();
    if (!url.startsWith(protocol)) {
        url = protocol + "://" + url;
    };
    xhr.open("POST", url);
    for (const [key, value] in header_params) {
        xhr.setRequestHeader(key, value);
    }
    xhr.onload = () => handle_server_message(xhr.responseText);
    xhr.send(data);
};


