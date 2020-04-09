/* Chose one of the import statement below */
import rainbowSDK from "./rainbow-sdk.min.js";

// const rainbowSDK = require('rainbow-web-sdk');
// If you use the bundler (for example - Webpack)

const chatArea = document.getElementById("chatarea");
const sendArea = document.getElementById("sendchatarea");
const sendMessageBtn = document.getElementsByClassName("sendbutton")[0];
const categoryDropdown = document.getElementsByClassName("dropdownlist")[0];
const agentDropdown = document.getElementsByClassName('dropdownlistagent')[0];
const requestButton = document.getElementsByClassName("requestbutton")[0];
const customerStatusText = document.getElementsByClassName("customer_status")[0];
const quitBtn = document.getElementsByClassName('quitbutton')[0];
let agent_id;
let agent_name;
let guest_id;
let convo;
let message;

const agentMaps = {
  'Jason2 Chow2': '5e7a32e50beb4e6ae713daaf',
  'Shaozuo Zhang': '5e78cfb00beb4e6ae713d999',
}

const onReady = async () => {
  sendMessageBtn.addEventListener("click", sendClick, false);
  requestButton.addEventListener("click", requestClick, false);
  quitBtn.addEventListener('click', closeConvoNetwork, false);

  var myRainbowLogin = "jason_chow@mymail.sutd.edu.sg"; // Replace by your login
  var myRainbowPassword = "Rainbow1!"; // Replace by your password
  var timeToLive = 600;

  // The SDK for Web is ready to be used, so you can sign in
  let account = await rainbowSDK.connection.signin(
    myRainbowLogin,
    myRainbowPassword
  );
  console.log(rainbowSDK.admin);
};

var onLoaded = function onLoaded() {
  console.log("[Hello World] :: On SDK Loaded !");

  rainbowSDK
    .initialize(
      "843d81a06c2311eaa8fbfb2c1e16e226",
      "0iV19xt6OdGoQb2N9V1Evp1KKkOV9FHRIn8c9bEOFixcwzKwDB3xWAGp1MVmWEkg"
    )
    .then(() => {
      console.log("[Hello World] :: Rainbow SDK is initialized!");
      /*
            rainbowSDK.contacts.searchById(id)
            .then((contact) => {
                console.log(contact);
            })
            .catch(err => {
                console.log(err);
            });
            */
    })
    .catch(err => {
      console.log("[Hello World] :: Something went wrong with the SDK.", err);
    });
};

const sendClick = () => {
  agentMessage(sendArea.value);
};

const requestClick = () => {
  pollForCustomer(agentDropdown.value);
};

const updateCustomerStatusText = (customer) => {
  customerStatusText.innerHTML += customer;
};

const pollForCustomer = (agentId) => {
  // TODO: Add http call to request for agent

  const apiUrl =
    `http://localhost:3030/common/reqstatus?agentId=${agentId}`;
  const body = {};
  // axios
  //   .get(apiUrl)
  //   .then((err, rs) => {
  //     if (err) {
  //       console.error(err.message);
  //       return;
  //     }
  //     console.log(rs.data);
  //   })
  //   .catch(err => {});
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    console.log("wow");
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      console.log(xhttp.response);
      const obj = JSON.parse(xhttp.response);
      console.log((guest_id = obj.suppReq.guest_id));
      console.log((name = obj.suppReq.name));
      console.log((agent_id = obj.suppReq.agent_id));
      console.log((agent_name = obj.suppReq.agent_name));
      updateCustomerStatusText(name);
      rainbowSDK.contacts
        .searchById(guest_id)
        .then(contact => {
          console.log(contact);
          return rainbowSDK.conversations.openConversationForContact(contact);
        })
        .then(conv => {
          convo = conv;
          console.log(conv);
          return rainbowSDK.im.sendMessageToConversation(conv, "Test2");
        })
        .then(obj => {
          console.log(obj);
          document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, (msg, conv, cc) => {
              clientMessage(extractMessage(msg));
            }
          );
        })
        .catch(err => {});
    }
    if (this.readyState == 4 && this.status >= 400) {
      setTimeout(() => {
        pollForCustomer();
      }, 5000);
    }
  };
  xhttp.open("GET", apiUrl, true);
  xhttp.send();
};

const closeConvoNetwork = (reqId) => {
  const apiUrl = `http://localhost:3030/common/closereq/${reqId}`;
  clearInterval(checkIntervalTimer);
  fetch(apiUrl)
    .then((response) => response.text())
    .then((htmlText) => {
      console.log(htmlText);
    })
    .catch(console.error)
    .finally(() => closeConvo());
};

const closeConvo = () => {
  // TODO: Close convo
  console.log('Closing convo');
};


const clientMessage = (message) => {
  chatArea.innerHTML += `Client: \n ${message} \n\n`;
};

const agentMessage = (message) => {
  chatArea.innerHTML += `Agent: \n ${message} \n\n`;
};

const extractMessage = (msg) => {
  return msg.detail.message.data;
}

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
rainbowSDK.start();
rainbowSDK.load();
