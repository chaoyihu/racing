var counter = 0;   // for increment task id
var all_tasks = new Map();  // all dom nodes for task rows


function add_task() {
  document.querySelector("#confirm_edit").addEventListener("click", function clickHandler() {
    confirm_edit("new_tid");
  });
  document.getElementById("complete_overlay").style.display = "block";
};


function edit_task(tid) {
  document.querySelector("#confirm_edit").addEventListener("click", function clickHandler() {
    confirm_edit(tid);
  });
  document.getElementById("complete_overlay").style.display = "block";

  var row = all_tasks.get(tid);
  document.getElementById("task_title_box_id").value = row.info["ttitle"];
  document.getElementById("description_box_id").value = row.info["tdescription"];
  document.getElementById("credit_box_id").value = row.info["tcredits"];
};


function confirm_edit(tid) {
  console.log(tid);
  if (tid == "new_tid") {
    counter += 1;
    var tid = 'task+' + counter;
    console.log(`Adding new task, tid: ${tid}`);
    var existing = false;
  } else {
    console.log(`Editing existing task, tid: ${tid}`);
    var existing = true;
  };
  ttitle = document.getElementById("task_title_box_id").value;
  tdescription = document.getElementById("description_box_id").value;
  tcredits = document.getElementById("credit_box_id").value;
  // show new row on page or update row if just editing existing task.
  insert_task_row(tid, ttitle, tdescription, tcredits, existing);
  // close overlay
  overlay_off();
};

function cancel_edit() {
  console.log("cancel edit");
  overlay_off();
}


function overlay_off() {
  document.getElementById("complete_overlay").style.display = "none";
  //remove event listener
  var old_element = document.getElementById("confirm_edit");
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
  // clear inputs
  document.getElementById("task_title_box_id").value = "";
  document.getElementById("description_box_id").value = "";
  document.getElementById("credit_box_id").value = null;
}


function delete_task(tid) {
  document.getElementById(`task_row_${tid.split('+').slice(-1)}`).remove();
  all_tasks.delete(tid);
  console.log(`Deleting task, tid: ${tid}`);
};


function insert_task_row(tid, ttitle, tdescription, tcredits, existing) {
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
  td[0].innerHTML = '<p>'+ ttitle +'</p>';
  td[1].textContent = tcredits;
  td[2].innerHTML = `
    <button class="btn btn-secondary" onclick="edit_task('${tid}');"> Edit</button>
    <button class="btn btn-secondary" onclick="delete_task('${tid}');">Delete</button>
  `
  row.info = {
    "tid"         : tid,
    "ttitle"      : ttitle, 
    "tdescription": tdescription,
    "tcredits"    : tcredits
  }
  all_tasks.set(tid, row);
};


function initiate() {
  var rtitle = document.getElementById("sprint-title-box-id").value;
  var rintroduction = document.getElementById("sprint-introduction-box-id").value;
  var rduration = document.getElementById("sprint-duration-box-id").value;
  let data = JSON.stringify({
    sprint_info: {
      title        : rtitle,
      introduction : rintroduction,
      duration    :  rduration
    },
    tasks: Array.from(all_tasks.values()).map(row => row.info)
  });
  console.log(data);
  var xhr = new XMLHttpRequest();
  var url = window.location.host + "/sprinting/sprint/planning";
  var protocol = "http";
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
      if (obj["type"] == "alert") {
        console.log(obj["message"]);
      } else {
        set_cookie("sprint_id", obj["sprint_id"], 10);
        my_redirect(obj["redirect_url"], obj["protocol"]);
      }
    }
  };
  xhr.send(data);
};