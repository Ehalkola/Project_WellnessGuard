// Chart Data
const chartData = {
  labels: [],
  datasets: [
    {
      label: "Heart Rate (bpm)",
      data: [],
      borderColor: "#ff6f61",
      backgroundColor: "rgba(255, 111, 97, 0.2)",
      borderWidth: 2,
      tension: 0.4, // Smooth line
    },
  ],
};

// Initialize Chart.js Line Chart
const ctx = document.getElementById("heartRateChart").getContext("2d");
const heartRateChart = new Chart(ctx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        min: 60,
        max: 100,
        display: true,
        title: {
          display: true,
          text: "Heart Rate (bpm)",
        },
      },
    },
  },
});

// Function to Update Heart Rate and Chart
function updateHeartRate(bpm) {
  const heartRateElement = document.getElementById("heart-rate");
  const activityStatusElement = document.getElementById("activity-status");

  // Update Current Heart Rate
  heartRateElement.textContent = `${bpm} bpm`;
  activityStatusElement.textContent = bpm > 80 ? "Active" : "Inactive";

  // Update Chart Data
  const now = new Date();
  const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
  if (chartData.labels.length > 60) {
    chartData.labels.shift(); // Remove oldest label
    chartData.datasets[0].data.shift(); // Remove oldest data point
  }
  chartData.labels.push(timeLabel);
  chartData.datasets[0].data.push(bpm);
  heartRateChart.update();
}

// Timer Functions
let timerDuration = 0;
let remainingTime = 0;
let timerInterval = null;

function updateTimerDisplay() {
  const timerDisplay = document.getElementById("timer-display");
  const minutes = Math.floor(remainingTime / 60).toString().padStart(2, "0");
  const seconds = (remainingTime % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (remainingTime > 0 && !timerInterval) {
    timerInterval = setInterval(() => {
      if (remainingTime > 0) {
        remainingTime--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        alert("Your time is up! Time to Move!");
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  remainingTime = timerDuration;
  updateTimerDisplay();
}

// Set Timer
document.getElementById("start-timer").addEventListener("click", () => {
  const inputMinutes = parseInt(document.getElementById("timer-input").value, 10);
  if (!isNaN(inputMinutes) && inputMinutes > 0) {
    timerDuration = inputMinutes * 60;
    remainingTime = timerDuration;
    updateTimerDisplay();
    startTimer();
  } else {
    alert("Please enter a valid number of minutes.");
  }
});

document.getElementById("pause-timer").addEventListener("click", pauseTimer);
document.getElementById("reset-timer").addEventListener("click", resetTimer);

// Initialize Dashboard
function initDashboard() {
  updateTimerDisplay(); // Initialize timer display
}

// Connect to the Socket.IO server
const socket = io();

// Listen for 'mqtt_message' events
socket.on('mqtt_message', (data) => {
  const messages = document.getElementById('messages');
  const messageItem = document.createElement('li');
  messageItem.textContent = `Topic: ${data.topic}, Payload: ${data.payload}`;
  messages.appendChild(messageItem);

  // Update UI based on topic
  if (data.topic === 'home/mytopic/stepcounter/steps') {
    document.getElementById('steps').textContent = data.payload;
  } else if (data.topic === 'home/mytopic/stepcounter/inactivity') {
    document.getElementById('activity-status').textContent = data.payload;
  } else if (data.topic === 'home/mytopic/heartrate/bpm') {
    document.getElementById('heart-rate').textContent = `${data.payload} bpm`;
    updateHeartRate(data.payload);
  }
});

initDashboard();