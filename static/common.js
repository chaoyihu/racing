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
        my_redirect(obj["url"], obj["protocol"]);
        if (document.cookie !== "") {
          var cookie = JSON.parse(document.cookie);
        } else {
          var cookie = {};
        }
        Object.keys(obj).forEach(function(key) {
          if (key !== "type" && key !== "url" && key !== "protocol") {
            cookie[key] = obj[key];
          }
        })
        document.cookie = JSON.stringify(cookie);
        console.log(document.cookie);
    };

    if (obj["type"] == "user_data") {
       document.getElementById("user_info").innerHTML = `
           <p>username: ${obj["username"]}</p>
           <p>history: ${obj["user_history"]}</p>
           <p>level: ${obj["user_level"]}</p>
       ` 
    };

    if (obj["type"] == "task_info") {
      tid = obj["id"];
      tstatus = obj["status"];
      console.log(`${tid} status ${tstatus}`);
    };

};


function my_redirect(url, protocol) {
    console.log(url + protocol);
    var complete_href = protocol + '://' + window.location.host + url; // window.location.href will not work on localhost.
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


