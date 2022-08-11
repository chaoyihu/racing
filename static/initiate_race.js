var all_tasks = new Map(); // map from task id to object

function add_task() {
  document.getElementById("complete_overlay").style.display = "block";
};

function confirm_edit() {
  var ttitle = document.getElementById("task_title_box_id").value;
  var tdescription = document.getElementById("description_box_id").value;
  var tcredits = document.getElementById("credit_box_id").value;

  console.log("Sending task info to server.");
  var tid = document.cookie + "+" + task_counter;
  let data = `{
      "type"       : "task_info", 
      "id"         : ${tid},
      "title"      : ${ttitle}, 
      "description": ${tdescription},
      "credits"    : ${tcredits},
  }`;
  var url = window.location.host + "/initiate_race";
  var protocol = "http";
  var header_params = new Map();
  header_params.set("Content-Type", "application/json");
  my_xhr_post(data, url, protocol, header_params);
  // reply will be handled by function in common.js
  overlay_off();
};

function overlay_off() {
  document.getElementById("complete_overlay").style.display = "none";
};

function insert_task_row(tid, tlink) {
  var tbody = document.querySelector("tbody");
  var template = document.querySelector('#task_row');
  var clone = template.content.cloneNode(true);
  var td = clone.querySelectorAll("td");
  task_counter += 1;
  //td[0].textContent = task_counter;
  td[1].innerHTML = '<a href="'+ tlink +'">'+ ttitle +'</a>';
  //td[2].textContent = task_credit;
  tbody.appendChild(clone);
};

function initiate() {
};
