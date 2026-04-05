const loadingScreen = document.getElementById("loadingScreen");
const loaderProgress = document.getElementById("loaderProgress");
const loaderText = document.getElementById("loaderText");

const loadingMessages = [
  "Initializing analytics engine...",
  "Loading client metrics...",
  "Syncing performance modules...",
  "Preparing dashboard view...",
  "Finalizing interface..."
];

let progress = 0;
let messageIndex = 0;

const loadingInterval = setInterval(() => {
  progress += Math.floor(Math.random() * 12) + 7;

  if (progress > 100) progress = 100;
  loaderProgress.style.width = `${progress}%`;

  if (messageIndex < loadingMessages.length - 1 && progress > (messageIndex + 1) * 20) {
    messageIndex++;
    loaderText.textContent = loadingMessages[messageIndex];
  }

  if (progress >= 100) {
    clearInterval(loadingInterval);
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
      animateCounters();
      revealOnScroll();
      resizeCanvas();
      drawChart(currentRange);
    }, 350);
  }
}, 180);

/* Sidebar mobile */
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

function openSidebar() {
  sidebar.classList.add("open");
  sidebarBackdrop.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarBackdrop.classList.remove("active");
  document.body.style.overflow = "";
}

menuToggle?.addEventListener("click", () => {
  if (sidebar.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

sidebarBackdrop?.addEventListener("click", closeSidebar);

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeSidebar();
  }
  resizeCanvas();
  drawChart(currentRange);
});

/* Modal */
const modalOverlay = document.getElementById("modalOverlay");
const openModalBtn = document.getElementById("openModalBtn");
const openModalBtnTwo = document.getElementById("openModalBtnTwo");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

function openModal() {
  modalOverlay.classList.add("active");
}

function closeModal() {
  modalOverlay.classList.remove("active");
}

openModalBtn?.addEventListener("click", openModal);
openModalBtnTwo?.addEventListener("click", openModal);
closeModalBtn?.addEventListener("click", closeModal);
cancelModalBtn?.addEventListener("click", closeModal);

modalOverlay?.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

/* Fade-up reveal */
const fadeElements = document.querySelectorAll(".fade-up");

function revealOnScroll() {
  fadeElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 70) {
      el.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);

/* Counters */
function animateCounters() {
  const counters = document.querySelectorAll(".counter");

  counters.forEach((counter) => {
    const target = parseFloat(counter.dataset.target);
    const isDecimal = target % 1 !== 0;
    const duration = 1600;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = target * eased;

      counter.textContent = isDecimal
        ? currentValue.toFixed(1)
        : Math.floor(currentValue).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = isDecimal
          ? target.toFixed(1)
          : Math.floor(target).toLocaleString();
      }
    }

    requestAnimationFrame(update);
  });
}

/* Chart */
const canvas = document.getElementById("lineChart");
const ctx = canvas.getContext("2d");
const chartWrap = document.getElementById("chartWrap");

const chartDataSets = {
  "30": {
    labels: ["1", "5", "10", "15", "20", "25", "30"],
    revenue: [18, 32, 28, 44, 39, 56, 68],
    engagement: [12, 20, 18, 26, 34, 31, 42]
  },
  "90": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    revenue: [20, 28, 36, 32, 48, 70],
    engagement: [11, 16, 20, 25, 29, 39]
  },
  "365": {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    revenue: [32, 46, 59, 84],
    engagement: [18, 28, 34, 51]
  }
};

let currentRange = "30";

function resizeCanvas() {
  if (!chartWrap) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = chartWrap.getBoundingClientRect();
  const width = Math.max(280, Math.floor(rect.width - 20));
  const height = window.innerWidth < 680 ? 240 : 320;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function drawChart(range = "30") {
  currentRange = range;
  const data = chartDataSets[range];

  const width = parseFloat(canvas.style.width) || 600;
  const height = parseFloat(canvas.style.height) || 320;

  ctx.clearRect(0, 0, width, height);

  const padding = window.innerWidth < 680 ? 24 : 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const maxValue = Math.max(...data.revenue, ...data.engagement) + 10;

  function getPoints(values) {
    return values.map((value, index) => {
      const x = padding + (chartWidth / (values.length - 1)) * index;
      const y = height - padding - (value / maxValue) * chartHeight;
      return { x, y };
    });
  }

  const revenuePoints = getPoints(data.revenue);
  const engagementPoints = getPoints(data.engagement);

  drawLine(revenuePoints, "#6d7cff", "rgba(109,124,255,0.16)", width, height);
  drawLine(engagementPoints, "#38d9ff", "rgba(56,217,255,0.12)", width, height);

  ctx.fillStyle = "rgba(150,160,181,0.9)";
  ctx.font = window.innerWidth < 680 ? "11px Inter" : "12px Inter";

  data.labels.forEach((label, index) => {
    const x = padding + (chartWidth / (data.labels.length - 1)) * index;
    ctx.fillText(label, x - 8, height - 10);
  });

  if (window.innerWidth > 520) {
    ctx.fillStyle = "#6d7cff";
    ctx.fillRect(width - 170, 18, 12, 12);
    ctx.fillStyle = "#f4f7fb";
    ctx.font = "600 12px Inter";
    ctx.fillText("Revenue", width - 150, 28);

    ctx.fillStyle = "#38d9ff";
    ctx.fillRect(width - 90, 18, 12, 12);
    ctx.fillStyle = "#f4f7fb";
    ctx.fillText("Engagement", width - 70, 28);
  }
}

function drawLine(points, strokeColor, fillColor, width, height) {
  if (!points.length) return;

  const bottomY = height - (window.innerWidth < 680 ? 24 : 40);

  ctx.beginPath();
  ctx.moveTo(points[0].x, bottomY);

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.lineTo(point.x, point.y);
    } else {
      const prev = points[index - 1];
      const cpX = (prev.x + point.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cpX, (prev.y + point.y) / 2);
    }
  });

  const last = points[points.length - 1];
  ctx.lineTo(last.x, bottomY);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, fillColor);
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  points.forEach((point, index) => {
    if (index === 0) return;
    const prev = points[index - 1];
    const cpX = (prev.x + point.x) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cpX, (prev.y + point.y) / 2);
  });

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = `${strokeColor}20`;
    ctx.fill();
  });
}

/* Chart range buttons */
const rangeButtons = document.querySelectorAll(".tag-btn");

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rangeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    drawChart(button.dataset.range);
  });
});

/* Initial */
window.addEventListener("load", () => {
  revealOnScroll();
  resizeCanvas();
  drawChart(currentRange);
});
