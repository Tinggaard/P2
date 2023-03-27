import { Obj, calcExp } from './app.js';

// open WebSocket with ws protocol instead of http
const webSocket = new WebSocket(document.location.origin.replace(/^http/, 'ws'));

// first contact
webSocket.onopen = () => {
  const msg = 'Hi there :)';
  const messageObj = new Obj('message', msg);
  webSocket.send(messageObj);
};

// when we get a message
webSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  let selector;
  // console.log(add(1, 2));

  // determine type of data
  switch (data.type) {
    // get UUID from server
    case 'id':
      selector = document.querySelector('#id');
      selector.innerHTML = `Your ID is: ${data.data}`;
      break;
    // get server time
    case 'time':
      selector = document.querySelector('#time');
      selector.innerHTML = `Current time on server is: ${data.data}`;
      break;
    case 'calc':
      calcExp(data, webSocket);
      break;
    // do nothing
    default:
      break;
  }
};
