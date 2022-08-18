function handle_server_message(txt) {
    console.log(txt);
    var obj = JSON.parse(txt);
    if (typeof(obj) == "string") {
      obj = JSON.parse(obj);
    };
    console.log(typeof(obj));
    console.log(obj);
    console.log(obj["type"]);
    if (obj["type"] == "log") {
        console.log(obj["text"]);
    };
    
    if (obj["type"] == "alert") {
        alert(obj["text"]);
    };
    
    if (obj["type"] == "ping") {
        console.log("Ping");
        ws.send(`{"type": "pong"}`);
    };

    if (obj["type"] == "redirect") {
        my_redirect(obj["url"], obj["protocol"]);
        delete obj["type"];
        delete obj["url"];
        delete obj["protocol"];
        Object.keys(obj).forEach(function(key) {
          set_cookie(key, obj[key], 10);
        })
    };
    
    if (obj["type"] == "cookie") {
        delete obj["type"];
        Object.keys(obj).forEach(function(key) {
          set_cookie(key, obj[key], 10);
        })
    }

    if (obj["type"] == "user_data") {
       document.getElementById("user_info").innerHTML = `
         <p>username: ${obj["username"]}</p>
         <p>history: ${obj["user_history"]}</p>
         <p>level: ${obj["user_level"]}</p>
       `; 
    };

    if (obj["type"] == "race_info") {
      document.race_info = obj;
      document.getElementById("info-zone").innerHTML = `
        <h1>${obj["title"]}</h1>
        <p>Initiated by: ${obj["initiator"]}</p>
        <p>Duration: ${obj["duration"]} min(s)</p>
        <p>${obj["introduction"]}</p>
      `;
      // rtasks = obj["tasks"];
    };

    if (obj["type"] == "new_racer") {
      name = obj["name"];
      add_racer_row(name);
    };
    
    if (obj["type"] == "chat_message") {
      add_chat_message(obj["publisher"], obj["message"], obj["timestamp"]);
    };
};

function set_cookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function get_cookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


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


