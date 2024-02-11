// call on load
get_user_info();


function get_user_info() {
   console.log("Getting user data.");
   let data = JSON.stringify({
      "session_id": get_cookie("session_id")
   });
   var url = window.location.host + "/profile/action/get_user_info";
   console.log(url);
   var protocol = "https";
   var xhr = new XMLHttpRequest();
   if (!url.startsWith(protocol)) {
       url = protocol + "://" + url;
   };
   xhr.open("GET", url);
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.onload = function() {
      var parser = server_message_check(xhr.responseText);
      if (!parser.success) {
         console.log(parser.message);
      } else {
         var obj = parser.data;
         console.log(obj);
         document.getElementById("user-info").innerHTML = `
            <p>username: ${obj["username"]}</p>
            <p>history: ${obj["user_history"]}</p>
            <p>level: ${obj["user_level"]}</p>
         `;
      }
   };
   xhr.send(data);
}

 
function new_sprint() {
   my_redirect("/sprint/planning", "https"); 
};

function join_sprint() {
   var sprint_id = document.getElementById("sprint_id_box").value;
   my_redirect("/sprint/" + sprint_id, "https");
};

function search() {
   var query = document.getElementById("search_query_box_id").value;
   // to be completed
};