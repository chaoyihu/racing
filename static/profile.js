console.log("Getting user data.");
let data = JSON.stringify({
    "type"    : "request_user_info"
});
var url = window.location.href;
var protocol = "http";
var header_params = new Map();
header_params.set("Content-Type", "application/json");
my_xhr_post(data, url, protocol, header_params);
 
function initiate_race() {
   my_redirect("/initiate-race", "http"); 
};

function join_race() {
   var race_id = document.getElementById("race_id_box").value;
   my_redirect("/race/" + race_id, "http");
};

function search() {
   var query = document.getElementById("search_query_box_id").value;
   
};