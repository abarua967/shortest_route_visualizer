const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

let blocked = -1;

function drawNodes(path = []) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 80; i++) {
    const x = 100 + (i % 10) * 80;
    const y = 50 + Math.floor(i / 10) * 50;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = (i === blocked) ? "red" : (path.includes(i.toString()) ? "#34D399" : "#1F2937");
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText(i, x - 4, y + 4);
  }
}

function animatePath(path) {
  let i = 0;
  const interval = setInterval(() => {
    if (i >= path.length - 1) return clearInterval(interval);
    drawNodes(path);
    const a = parseInt(path[i]), b = parseInt(path[i + 1]);
    const ax = 100 + (a % 10) * 80, ay = 50 + Math.floor(a / 10) * 50;
    const bx = 100 + (b % 10) * 80, by = 50 + Math.floor(b / 10) * 50;
    const x = ax + (bx - ax) * (i % 1);
    const y = ay + (by - ay) * (i % 1);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#FBBF24";
    ctx.fill();
    i += 0.05;
  }, 30);
}

function runDijkstra() {
  const src = document.getElementById("source").value;
  const dest = document.getElementById("destination").value;
  fetch("path.txt").then(res => res.text()).then(data => {
    const path = data.trim().split(" ");
    document.getElementById("statusText").textContent = "Path: " + path.join(" → ");
    drawNodes(path);
    animatePath(path);
  });
}

function blockNode() {
  const b = prompt("Enter node number (0–79) to block:");
  blocked = parseInt(b);
  drawNodes();
  document.getElementById("statusText").textContent = "Blocked node: " + blocked;
}
