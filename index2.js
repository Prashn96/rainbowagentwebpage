/* Chose one of the import statement below */
import rainbowSDK from "./rainbow-sdk.min.js";

// const rainbowSDK = require('rainbow-web-sdk');
// If you use the bundler (for example - Webpack)

const chatArea = document.getElementById("chatarea");
const sendArea = document.getElementById("sendchatarea");
// const loginBtn = document.getElementsByTagName("bttn")[0];
const sendMessageBtn = document.getElementsByClassName("sendbutton")[0];
const categoryDropdown = document.getElementsByClassName("dropdownlist")[0];
const agentDropdown = document.getElementsByClassName("dropdownlistagent")[0];
var availList = document.getElementsByClassName("availagent")[0];
const customerStatusText = document.getElementsByClassName(
  "customer_status"
)[0];
const quitBtn = document.getElementsByClassName("quitbutton")[0];
let agent_id;
let agent_name;
let guest_id;
let convo;
let message;
let customerFound = false;
let pollCustomerInterval
let msgListenerAdded = false;

const agentMaps = {
  "jason_chow@mymail.sutd.edu.sg": ["Jason2 Chow2", "5e7a32e50beb4e6ae713daaf"],
  "2628836781@qq.com": ["Shaozuo Zhang", "5e78cfb00beb4e6ae713d999"],
  "informationman1@rainbow.com": ["Information Man1", "5e9dc3949cff6b7279a93cb6"],
  "salesman1@rainbow.com": ["Sales Man1", "5e9dc3639cff6b7279a93c9b"],
  "salesman2@rainbow.com": ["Sales Man2", "5e9dc36f9cff6b7279a93ca4"],
};

const onReady = async () => {
  // loginBtn.addEventListener("click", loginClick, false);
  // sendMessageBtn.addEventListener("click", sendClick, false);
  quitBtn.addEventListener("click", closeConvoNetwork, false);
  availList.addEventListener("change", checkAgentStatus, false);
  
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");
  agent_name = agentMaps[email][0];
  agent_id = agentMaps[email][1];

  var timeToLive = 600;

  // The SDK for Web is ready to be used, so you can sign in
  let account = await rainbowSDK.connection.signin(
    email,
    password
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
      
      //calls changeData() function once agents login(agent availability)
      //calls pollForCustomer() function once agent login

      setTimeout(() => {
        checkAgentStatus();
      }, 10000);
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
    .catch((err) => {
      console.log("[Hello World] :: Something went wrong with the SDK.", err);
    });
};
// const loginClick = () => {
//   changeData();
//   pollForCustomer();
// };

const checkAgentStatus = () => {
  if (availList.value == "available") {
    console.log("Agent available");
    if (pollCustomerInterval) clearInterval(pollCustomerInterval);
    pollCustomerInterval = setInterval(() => pollForCustomer(), 5000);
    changeStatus(true);
    return true;
  } else if (availList.value == "busy") {
    console.log("Agent busy");
    if (pollCustomerInterval) clearInterval(pollCustomerInterval);
    changeStatus(false);
    return false;
  } else {
    console.log("Finding agent");
    return false;
  }
};

const changeStatus = (avail) => {
  // const apiUrl = 'http://localhost:3030/agent/updateavail';
  const apiUrl = 'http://13.76.87.194:3030/agent/updateavail';
  const body = JSON.stringify({
    agentId: agent_id,
    avail,
  });
  fetch(apiUrl, {
    method: "POST",
    body,
    headers: {
        'Content-Type': 'application/json'
    }
  }).then((response) => {
    return response.json();
  })
  .then((htmlJson) => {
    console.log(htmlJson);
  })
  .catch(console.error);
}

const sendClick = () => {
  const toSend = sendArea.value;
  sendArea.value = "";
  agentMessage(toSend);
  rainbowSDK.im.sendMessageToConversation(convo, toSend);
};

const requestClick = () => {
  pollForCustomer();
};

const updateCustomerStatusText = (customer) => {
  customerStatusText.innerHTML += customer;
};


const pollForCustomer = () => {
  console.log("Polling customer");
  // TODO: Add http call to request for agent

  const apiUrl = `http://13.76.87.194:3030/common/reqstatus?agentId=${agent_id}`;
  // const apiUrl = `http://localhost:3030/common/reqstatus?agentId=${agent_id}`;
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
  xhttp.onreadystatechange = function () {
    console.log("wow");
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      console.log("IS ACTIVE1");
      console.log(xhttp.response);
      const obj = JSON.parse(xhttp.response);
      if (!obj.active && !customerFound) {
        console.log("NOT ACTIVE. Continue to poll");
        customerFound = false;
        return;
      }
      else if (!obj.active && customerFound) {
        console.log("Chat was closed");
        rainbowSDK.conversations.closeConversation(convo);
        alert("Client Closed Chat");
        chatArea.innerHTML = "";
        customerStatusText.innerHTML = "Customer: ";
        customerFound = false;
        return;
      }
      if (customerFound === true) return;
      customerFound = true;
      console.log((guest_id = obj.support_req.guestId));
      console.log((name = obj.support_req.name));
      console.log((agent_id = obj.support_req.agentId));
      console.log((agent_name = obj.support_req.agentName));
      updateCustomerStatusText(name);
      //enable send message button only when connecting/connected
      sendMessageBtn.addEventListener("click", sendClick, false);
      console.log("event listener added for btn");
      rainbowSDK.contacts
        .searchById(guest_id)
        .then((contact) => {
          console.log(contact);
          return rainbowSDK.conversations.openConversationForContact(contact);
        })
        .then((conv) => {
          convo = conv;
          console.log(conv);
          return rainbowSDK.im.sendMessageToConversation(
            conv,
            "Agent has connected"
          );
        })
        .then((obj) => {
          console.log(obj);
          sendMessageBtn.addEventListener("click", sendClick, false);
          if (msgListenerAdded) return;
          document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, imEventListener);
          msgListenerAdded = true;
        })
        .catch((err) => {
          console.error(err);
        });
    }

    if (this.readyState == 4 && this.status >= 400) {
      console.log("Error requesting for support req status");
      customerFound = false;
      //enable send message button only when connecting/connected

      // setTimeout(() => {
      //   pollForCustomer();
      // }, 5000);
    }
  };

  xhttp.open("GET", apiUrl, true);
  xhttp.send();
// const loginFunction = () => {
//   changeData();
//   pollForCustomer();
// };
}

const imEventListener = (msg, conv, cc) => {
  clientMessage(extractMessage(msg));
};

const closeConvoNetwork = (reqId) => {
  const apiUrl = `http://13.76.87.194:3030/common/closereq/${reqId}`;
  // const apiUrl = `http://localhost:3030/common/closereq/${reqId}`;
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
  console.log("Closing convo");
};

const clientMessage = (message) => {
  chatArea.innerHTML += `Client: \n ${message} \n\n`;
};

const agentMessage = (message) => {
  chatArea.innerHTML += `Agent: \n ${message} \n\n`;
};

const extractMessage = (msg) => {
  return msg.detail.message.data;
};

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
rainbowSDK.start();
rainbowSDK.load();

