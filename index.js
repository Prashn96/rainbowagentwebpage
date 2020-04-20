let agentId;

function validate() {
  var email = document.getElementById("email");
  var password = document.getElementById("pswrd");
  console.log("leggo");
  localStorage.setItem("email", email.value);
  localStorage.setItem("password", password.value);

  email = localStorage.getItem("email");
  password = localStorage.getItem("password");

  if ((email === "jason_chow@mymail.sutd.edu.sg" && password === "Rainbow1!")
    || (email === "2628836781@qq.com" && password === "SUTDzsz19991226")
    || (email === "informationman1@rainbow.com" && password === "Information1!")
    || (email === "salesman1@rainbow.com" && password === "Salesman1!")
    || (email === "salesman2@rainbow.com" && password === "Salesman2!")
  ) {
    window.location.href = 'index2.html';
  } else {
    alert("Incorrect Email/Password!");
    return;
  }
}
