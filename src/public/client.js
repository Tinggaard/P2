import { subtaskHandler } from './provider.js';

// first contact
let websocket;
let rdyButton;
let weights;
let correctInput = false;
let totalSubtasks;
let subtaskCounter = 0;

function updateProgress(yourContribution) {
  const taskPercentage = (yourContribution / totalSubtasks) * 100;
  let selector = document.querySelector('#progressText');
  selector.innerHTML = `${yourContribution} / ${totalSubtasks}`;
  selector = document.querySelector('#yourContributionText');
  selector.innerHTML = `Your Contribution: ${subtaskCounter} |  Total: ${(Math.floor(taskPercentage))}%`;

  // Update progress bar
  selector = document.querySelector('#progressBar');
  selector.style.width = `${taskPercentage}%`;

  // Display how much the single user has contributed
  selector = document.querySelector('#progressBarSingle');
  selector.style.flex = `${subtaskCounter}`;
  selector = document.querySelector('#progressBarTotal');
  selector.style.flex = `${yourContribution - subtaskCounter}`;
}

function addWebSocketEventListeners() {
  // when we get a message
  websocket.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    let selector;

    // determine type of data
    switch (data.type) {
      case 'calc':
        await subtaskHandler(data.data, weights, websocket);
        subtaskCounter++;
        break;
      case 'weights':
        weights = data.data;
        break;
      case 'progress':
        updateProgress(data.data);
        break;
      case 'totalSubtasks':
        totalSubtasks = data.data;
        break;
      case 'solutions':
        selector = document.querySelector('#solutions');
        selector.innerHTML = '';
        data.data.forEach((solution, index) => {
          const p = document.createElement('p');
          let weightsString = '';
          for (let i = 0; i < solution.weights.length; i++) {
            weightsString += ` ${solution.weights[i]}`;
            if (i % solution.nodeCount === 0) {
              weightsString += '\n';
            }
          }
          p.innerHTML += `${index}.  Shortest path: ${solution.shortestPath}. <br>  Length: ${solution.shortestSum}.<br> <br>`;
          p.classList.add('tooltip');
          p.setAttribute('data-tooltip', `${weightsString}`);
          selector.appendChild(p);
        });
        break;
      case 'queue':
        selector = document.querySelector('#queue');
        selector.innerHTML = '';
        data.data.forEach((queue, index) => {
          const p = document.createElement('p');
          let weightsString = '';
          for (let i = 0; i < queue.weights.length; i++) {
            weightsString += ` ${queue.weights[i]}`;
            if (i % queue.nodeCount === 0) {
              weightsString += '\n';
            }
          }
          p.innerHTML += `Queue number: ${index}. Hover for weights <br>`;
          p.classList.add('tooltip');
          p.setAttribute('data-tooltip', `${weightsString}`);
          selector.appendChild(p);
        });
        break;
      // do nothing
      default:
        break;
    }
  };
}

function serverWeightCheck() {
  return fetch('/weights')
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData === true) {
        return true;
      }
      return false;
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
}

function rdySender() {
  const weightCheck = serverWeightCheck();
  if (weightCheck) {
    if (rdyButton.value === 'Connect') {
      websocket = new WebSocket(document.location.origin.replace(/^http/, 'ws'));
      rdyButton.value = 'Disconnect';
      // Add WebSocket event listeners when connecting
      addWebSocketEventListeners();
    } else {
      websocket.close();
      rdyButton.value = 'Connect';
      // sets a timeout for disconnect to let websocket close properly
      setTimeout(() => {
      }, 500);
    }
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
        .catch((error) => console.error(error));
    };
    reader.readAsText(file);
  } else {
    console.error('File not found.');
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

function fileChecker(file) {
  const fileName = file.files[0].name;
  if (fileName.endsWith('.json')) {
    correctInput = true;
  } else {
    // eslint-disable-next-line no-alert
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
