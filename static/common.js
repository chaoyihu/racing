function handle_server_message(txt) {
    console.log(txt);
    const obj = JSON.parse(txt);
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
        add_cookie(obj);
    };
    
    if (obj["type"] == "cookie") {
        delete obj["type"];
        add_cookie(obj);
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
      // rtasks = obj["tasks"]; // Array<tlink, ttitle>
    };
};

function add_cookie(obj) {
  if (document.cookie !== "") {
    var cookie = JSON.parse(document.cookie);
  } else {
    var cookie = {};
  }
  Object.keys(obj).forEach(function(key) {
    cookie[key] = obj[key];
  })
  document.cookie = JSON.stringify(cookie);
  console.log(document.cookie);
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


