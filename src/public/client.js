import { Obj, subtaskHandler } from './provider.js';

// first contact
let websocket;
let rdyButton;
let weights;

let totalSubtasks;
let subtaskCounter = 0;

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
    let taskPercentage;

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
        subtaskCounter++;
        break;
      case 'weights':
        weights = data.data;
        break;
      case 'progress':
        taskPercentage = (data.data / totalSubtasks) * 100;
        selector = document.querySelector('#progressText');
        selector.innerHTML = `${data.data} / ${totalSubtasks}`;
        selector = document.querySelector('#yourContributionText');
        selector.innerHTML = `Your Contribution: ${subtaskCounter} |  Total: ${(Math.floor(taskPercentage))}%`;

        // Update progress bar
        selector = document.querySelector('#progressBar');
        selector.style.width = `${taskPercentage}%`;

        // Display how much the single user has contributed
        selector = document.querySelector('#progressBarSingle');
        selector.style.flex = `${subtaskCounter}`;
        selector = document.querySelector('#progressBarTotal');
        selector.style.flex = `${data.data - subtaskCounter}`;
        break;
      case 'totalSubtasks':
        console.log('received on client side: ', data.data);
        totalSubtasks = data.data;
        break;
      case 'finalResult':
        selector = document.querySelector('#finalResult');
        selector.innerHTML = `Shortest path is ${data.data.shortestPath} with the length of ${data.data.shortestSum}.`;
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
function fileSender(file) {
  if (file) { // Check if file exists
    const reader = new FileReader();
    reader.onload = (event) => {
      const weights2 = JSON.parse(event.target.result);
      fetch('/server-weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weights2),
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log('Received response from server:', responseData);
        })
        .catch((error) => console.error(error));
    };
    reader.readAsText(file);
  } else {
    console.log('File not found.');
  }
}

// Function to update the label of the file input element
function fileUpdate(file) {
  const fileInputLabel = document.querySelector('#fileInputLabel');
  if (file.files.length > 0) {
    const fileName = file.files[0].name;
    fileInputLabel.textContent = fileName;
    fileSender(file.files[0]); // Call fileSender with the selected file
  } else {
    fileInputLabel.textContent = 'Upload';
  }
}

let correctInput = false;
function fileChecker(file) {
  const fileName = file.files[0].name;
  if (fileName.endsWith('.json')) {
    correctInput = true;
  } else {
    alert('Please select a json file');
  }
}
// Add event listener to the file input element
const fileInputElement = document.getElementById('fileInput');
fileInputElement.addEventListener('change', () => {
  fileChecker(fileInputElement);
  if (correctInput) {
    fileUpdate(fileInputElement);
  }
  correctInput = false; // reset the stuff :)
});

// Change text and color of progressbar when hovering with the mouse
document.querySelector('#progressBar').addEventListener('mouseover', () => {
  document.querySelector('#progressText').style.display = 'none';
  document.querySelector('#yourContributionText').style.display = 'block';
  document.querySelector('#progressBarSingle').style.background = 'teal';
});

// Change the prograss bar back to default the mouse leaves the progress bar
document.querySelector('#progressBar').addEventListener('mouseleave', () => {
  document.querySelector('#progressText').style.display = 'block';
  document.querySelector('#yourContributionText').style.display = 'none';
  document.querySelector('#progressBarSingle').style.background = '#2BAE66FF';
});
