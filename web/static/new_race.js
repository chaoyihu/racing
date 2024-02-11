// execute immediately
new_race()
var counter = 0;
var all_tasks = new Map();


// Create new race
function new_race() {
  var xhr = new XMLHttpRequest();
  var url = window.location.href + "/get_race_id";
  var protocol = "https";
  if (!url.startsWith(protocol)) {
      url = protocol + "://" + url;
  };
  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    var parser = server_message_check(xhr.responseText);
    if (!parser.success) {
      console.log(parser.message);
    } else {
      var cookies_map = parser.data;
      Object.keys(cookies_map).forEach(function(cookie_name) {
        set_cookie(cookie_name, cookies_map[cookie_name], 10);
      })
    }
  };
  xhr.send(data);
}


function add_task() {
  document.querySelector("#confirm_edit").addEventListener("click", () => confirm_edit("new_tid"));
  document.getElementById("complete_overlay").style.display = "block";
};


function confirm_edit(tid) {
  console.log(tid);
  if (tid == "new_tid") {
    counter += 1;
    race_id = get_cookie("race_id");
    var tid = race_id + '+task+' + counter;
    console.log(`Editing new task, tid: ${tid}`);
    var existing = false;
  } else {
    console.log(`Editing existing task, tid: ${tid}`);
    var existing = true;
  };
  ttitle = document.getElementById("task_title_box_id").value;
  tdescription = document.getElementById("description_box_id").value;
  tcredits = document.getElementById("credit_box_id").value;
  tlink = "/task/" + tid;

  // show new row on page or update row if just editing existing task.
  insert_task_row(tid, ttitle, tdescription, tcredits, tlink, existing);

  //remove event listener
  var old_element = document.getElementById("confirm_edit");
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
  // close overlay and clear input fields
  overlay_off();
  document.getElementById("task_title_box_id").value = "";
  document.getElementById("description_box_id").value = "";
  document.getElementById("credit_box_id").value = null;
};


function overlay_off() {
  document.getElementById("complete_overlay").style.display = "none";
};


function insert_task_row(tid, ttitle, tdescription, tcredits, tlink, existing) {
  if (!existing) {
    // new task
    var template = document.querySelector('#task_row');
    var row = template.content.cloneNode(true);
    row.querySelector("tr").id = `task_row_${tid.split('+').slice(-1)}`;
    var tbody = document.querySelector("tbody");
    tbody.appendChild(row);
  }
  var row = document.querySelector(`#task_row_${tid.split('+').slice(-1)}`);
  // define row content
  var td = row.querySelectorAll("td");
  td[0].innerHTML = '<a href="'+ tlink +'">'+ ttitle +'</a>';
  td[1].textContent = tcredits;
  td[2].innerHTML = `
    <button class="btn btn-secondary" onclick="edit_task('${tid}');"> Edit</button>
    <button class="btn btn-secondary" onclick="delete_task('${tid}');">Delete</button>
    `
  // define row info (for display in edit_task)
  row.info = {
    "tid"         : tid,
    "ttitle"      : ttitle, 
    "tdescription": tdescription,
    "tcredits"    : tcredits
  }
  all_tasks[tid] = row;
};


function edit_task(tid) {
  document.querySelector("#confirm_edit").addEventListener("click", () => confirm_edit(`${tid}`));
  document.getElementById("complete_overlay").style.display = "block";

  var dom_task_row = all_tasks[tid];
  document.getElementById("task_title_box_id").value = dom_task_row.info["ttitle"];
  document.getElementById("description_box_id").value = dom_task_row.info["tdescription"];
  document.getElementById("credit_box_id").value = dom_task_row.info["tcredits"];
};

function delete_task(tid) {
  document.getElementById(`task_row_${tid.split('+').slice(-1)}`).remove();
  console.log(`Deleting task, tid: ${tid}`);
  let data = JSON.stringify({
      type       : "delete_task", 
      id         : tid
  });
  
};


function initiate() {
  // rid is in get_cookie("race_id")
  rtitle = document.getElementById("race-title-box-id").value;
  rintroduction = document.getElementById("race-introduction-box-id").value;
  console.log(rintroduction);
  rduration = document.getElementById("race-duration-box-id").value;
  //rtasks will be retrieved in database by `keys rid+task*`
  let data = JSON.stringify({
      type         : "confirm_new_race",
      title        : rtitle,
      introduction : rintroduction,
      duration    :  rduration
  });
  var xhr = new XMLHttpRequest();
  var url = window.location.href + "/confirm_new_race";
  var protocol = "https";
  if (!url.startsWith(protocol)) {
      url = protocol + "://" + url;
  };
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    var parser = server_message_check(xhr.responseText);
    if (!parser.success) {
      console.log(parser.message);
    } else {
      var obj = parser.data;
      set_cookie("race_id", obj["race_id"], 10);
      my_redirect(obj["redirect_url"], obj["protocol"]);
    }
  };
  xhr.send(data);
};