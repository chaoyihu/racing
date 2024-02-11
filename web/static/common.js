function server_message_check(responseText) {
    try {
      var obj = JSON.parse(responseText);
      return {
        success: true,
        data: obj
      }
    } catch (error) {
      return {
        success: false, 
        message: `Failure to parse server response as json: ${responseText}`
      }
    }
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