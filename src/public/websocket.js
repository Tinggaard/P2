// open WebSocket with ws protocol instead of http
const webSocket = new WebSocket(document.location.origin.replace(/^http/, 'ws'));

// first contact
webSocket.onopen = () => {
  webSocket.send('Hi there :)');
};

// when we get a message
webSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  let selector;

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
    // do nothing
    default:
      break;
  }
};

// say hello to server
document
  .querySelector('#sendToServer')
  .addEventListener('click', () => {
    webSocket.send('Hello server!');
  });
