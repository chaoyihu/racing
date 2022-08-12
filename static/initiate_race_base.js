console.log("Creating a new race.");
let data = `{
    "type"    : "request_race"
}`;
var url = window.location.href;
var protocol = "http";
var header_params = new Map();
header_params.set("Content-Type", "application/json");
my_xhr_post(data, url, protocol, header_params);
 
