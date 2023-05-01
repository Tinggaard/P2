import { Obj, subtaskHandler } from './provider.js';

// first contact
let websocket;
let rdyButton;
let weights;

let totalSubtasks;

function addWebSocketEventListeners() {
  websocket.onopen = () => {
    const connectMsg = 'connect message';
    const testMessage = new Obj('message', connectMsg);
    websocket.send(JSON.stringify(testMessage));
  };

  // when we get a message
  websocket.onmessage = async (event) => {
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
      case 'calc':
        await subtaskHandler(data.data, weights, websocket);
        console.log(weights);
        console.log(data.data);
        break;
      case 'weights':
        weights = data.data;
        break;
      case 'progress':
        selector = document.querySelector('#progress');
        selector.innerHTML = `${data.data} / ${totalSubtasks}`;
        selector = document.querySelector('#progressBar');
        selector.style.width = `${(data.data / totalSubtasks) * 100}%`;
        //selector.animate({ width: `${(data.data / totalSubtasks) * 100}%` }, { duration: 10000 });
        //selector.animate({ width: data.data }, { duration: 1000 });
        break;
      case 'totalSubtasks':
        console.log('received on client side: ', data.data);
        totalSubtasks = 1320;
        break;
      // do nothing
      default:
        break;
    }
  };
}

function rdySender() {
  if (rdyButton.value === 'Connect') {
    websocket = new WebSocket(document.location.origin.replace(/^http/, 'ws'));
    console.log('connect');
    rdyButton.value = 'Disconnect';

    // Add WebSocket event listeners when connecting
    addWebSocketEventListeners();
  } else {
    console.log('disconnect');
    websocket.close();
    rdyButton.value = 'Connect';
  }
}

rdyButton = document.querySelector('#connecterBtn');
rdyButton.addEventListener('click', () => {
  rdySender();
});

// file upload
function fileSender() {
  const uploadFileEle = document.getElementById('fileInput');
  if (uploadFileEle) {
    // gets the file
    const file = uploadFileEle.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const weights2 = JSON.parse(event.target.result); // parse JSON data
      // Send weights to server using fetch() with a POST request
      fetch('/server-weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // set the Content-Type header
        },
        body: JSON.stringify(weights2), // send the parsed JSON data
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log('Received response from server:', responseData);
        })
        .catch((error) => console.error(error));
    };
    reader.readAsText(file);
  } else {
    console.log('File input element not found.');
  }
}

const fileBtn = document.querySelector('#fileSendButton');
fileBtn.addEventListener('click', () => {
  fileSender();
});
