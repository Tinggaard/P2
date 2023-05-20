import { subtaskHandler, sendObj } from './provider.js';

let websocket;
let rdyButton;
let weights;
let totalSubtasks;
let yourContribution = 0;

// Function that generate the string containing weights for the tooltip
function createTooltip(weightsArray, nodeCount) {
  let weightsString = 'Weights \n ';
  for (let i = 0; i < weightsArray.length; i++) {
    weightsString += ` ${weightsArray[i]}`;
    if (i % nodeCount === 0) {
      weightsString += '\n';
    }
  }
  return weightsString;
}

function updateProgress(taskProgress) {
  const taskPercentage = (taskProgress / totalSubtasks) * 100;
  let selector = document.querySelector('#progressText');
  selector.innerHTML = `${taskProgress} / ${totalSubtasks}`;
  selector = document.querySelector('#yourContributionText');
  selector.innerHTML = `Your Contribution: ${yourContribution} |  Total: ${(Math.floor(taskPercentage))}%`;

  // Update progress bar
  selector = document.querySelector('#progressBar');
  selector.style.width = `${taskPercentage}%`;

  // Display how much the single user has contributed
  selector = document.querySelector('#progressBarSingle');
  selector.style.flex = `${yourContribution}`;
  selector = document.querySelector('#progressBarTotal');
  selector.style.flex = `${taskProgress - yourContribution}`;
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
        yourContribution++;
        break;
      case 'weights':
        yourContribution = 0; // Reset subtask counter when new task is received
        weights = data.data;
        sendObj(websocket, 'subtaskRequest', null);
        break;
      case 'progress':
        updateProgress(data.data, yourContribution);
        break;
      case 'totalSubtasks':
        totalSubtasks = data.data;
        break;
      case 'solutions':
        selector = document.querySelector('#solutions');
        selector.innerHTML = '';
        data.data.forEach((solution, index) => {
          const p = document.createElement('p');
          const weightsString = createTooltip(solution.weights, solution.nodeCount);
          p.innerHTML += `${index + 1}. ${solution.name}: Shortest path: ${solution.shortestPath.join('   &#8680; ')}. <br>  Length: ${solution.shortestSum}.<br> <br>`;
          p.classList.add('task');
          p.setAttribute('data-tooltip', `${weightsString}`);
          selector.appendChild(p);
        });
        break;
      case 'queue':
        selector = document.querySelector('#queue');
        selector.innerHTML = '';
        data.data.forEach((queue, index) => {
          const p = document.createElement('p');
          const weightsString = createTooltip(weights, queue.nodeCount);
          p.innerHTML += `${index + 1}. ${queue.name} <br>`;
          p.classList.add('task');
          p.setAttribute('data-tooltip', `${weightsString}`);
          selector.appendChild(p);
        });
        break;
      case 'clientCounter':
        selector = document.querySelector('#clientCounter');
        selector.innerHTML = `Clients connected: ${data.data}`;
        break;
      case 'time':
        console.log(`Execution time: ${(data.data) / 1000} s`);
        break;
      default:
        break;
    }
  };
}

function rdySender() {
  if (rdyButton.value === 'Connect') {
    document.querySelector('#yourContributionText').style.display = 'none';
    document.querySelector('#clientCounter').style.display = 'block';
    websocket = new WebSocket(document.location.origin.replace(/^http/, 'ws'));
    rdyButton.value = 'Disconnect';
    // Add WebSocket event listeners when connecting
    addWebSocketEventListeners();
  } else {
    websocket.close();
    rdyButton.value = 'Connect';
    document.querySelector('#clientCounter').style.display = 'none';
    // sets a timeout for disconnect to let websocket close properly
    setTimeout(() => {
    }, 500);
  }
}

rdyButton = document.querySelector('#connecterBtn');
rdyButton.addEventListener('click', () => {
  rdySender();
});

// file upload
function fileSender(file, fileName) {
  if (file) { // Check if file exists
    const reader = new FileReader();
    reader.onload = (event) => {
      const taskData = {
        name: fileName,
        weights: JSON.parse(event.target.result).weights,
      };
      fetch('/server-weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })
        .then((response) => {
          response.json();
          const elem = document.querySelector('#msg');
          elem.classList.add('notification'); // add class describing animation
          elem.style.animation = 'none'; // trigger reflow
          setTimeout(() => {
            elem.style.animation = '';
          }, 10);
        })
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
    fileSender(file.files[0], fileName); // Call fileSender with the selected file
  } else {
    fileInputLabel.textContent = 'Upload';
  }
}

// Check if the filetype of the uploaded file is .json
function fileChecker(file) {
  const fileName = file.files[0].name;
  if (fileName.endsWith('.json')) {
    return true;
  }
  // eslint-disable-next-line no-alert
  alert('Please select a json file');
  return false;
}

// Add event listener to the file input element
const fileInputElement = document.getElementById('fileInput');
fileInputElement.addEventListener('change', () => {
  if (fileChecker(fileInputElement)) {
    fileUpdate(fileInputElement);
  }
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
