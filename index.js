let agentId;

function validate() {
  var username = document.getElementById("userid");
  var password = document.getElementById("pswrd");
  console.log("leggo");
  localStorage.setItem("username", username.value);
  localStorage.setItem("password", password.value);

  username = localStorage.getItem("username");
  password = localStorage.getItem("password");

  if (username == "jason_chow@mymail.sutd.edu.sg" && password == "Rainbow1!") {
    localStorage.setItem("agentName", "Jason2 Chow2");
    window.location.href = 'index2.html';
  } else if (
    username == "zsz2628836781@gmail.com" &&
    password == "SUTDzsz19991226"
  ) {
    localStorage.setItem("agentName", "Shaozuo Zhang");
    window.location.href = 'index2.html';
  } else {
    alert("Incorrect Username/Password!");
  }
}
