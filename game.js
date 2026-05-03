const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const ui = {
  score: document.getElementById("score"),
  height: document.getElementById("height"),
  stability: document.getElementById("stability"),
  mission: document.getElementById("mission"),
  message: document.getElementById("message"),
};

const state = {
  running: false,
  score: 0,
  stack: [],
  stability: 100,
  playerX: canvas.width / 2,
  speed: 500,
  keys: { left: false, right: false },
  flying: null,
  last: 0,
  missAllowed: 0,
  missionRightStreak: 0,
  missionDone: false,
  clearShown: false,
};

const baseY = canvas.height - 75;
const plateW = 170;
const g = 900;

function newFlying() {
  const thick = Math.random() < Math.min(0.7, 0.25 + state.stack.length * 0.03);
  const w = thick ? 120 : 100;
  const h = thick ? 26 : 18;
  const diff = Math.min(1.8, 1 + state.stack.length * 0.05);
  return {
    x: 70,
    y: baseY - 190,
    vx: (220 + Math.random() * 80) * diff,
    vy: - (280 + Math.random() * 60),
    w,
    h,
    thick,
    settled: false,
  };
}

function reset() {
  state.running = true;
  state.score = 0;
  state.stack = [];
  state.stability = 100;
  state.playerX = canvas.width / 2;
  state.flying = newFlying();
  state.missionRightStreak = 0;
  state.missionDone = false;
  state.clearShown = false;
  ui.message.textContent = "キャッチして積み上げよう！";
  sync();
}

function sync() {
  ui.score.textContent = Math.floor(state.score);
  ui.height.textContent = state.stack.length;
  ui.stability.textContent = Math.max(0, Math.floor(state.stability));
  ui.mission.textContent = state.missionDone ? "達成! スコアx2.0中" : "右側に3連続で置こう";
}

function update(dt) {
  if (!state.running) return;
  if (state.keys.left) state.playerX -= state.speed * dt;
  if (state.keys.right) state.playerX += state.speed * dt;
  state.playerX = Math.max(plateW / 2, Math.min(canvas.width - plateW / 2, state.playerX));

  const p = state.flying;
  p.vy += g * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  const topY = baseY - state.stack.reduce((a, s) => a + s.h, 0);
  const supportCenter = state.stack.length === 0 ? state.playerX : state.stack[state.stack.length - 1].x;

  if (p.vy > 0 && p.y + p.h / 2 >= topY) {
    const offset = p.x - supportCenter;
    const allowed = Math.max(22, 56 - state.stack.length * 1.4);
    if (Math.abs(offset) > allowed) {
      endGame("崩れてしまった…");
      return;
    }

    p.y = topY - p.h / 2;
    state.stack.push({ x: p.x, y: p.y, w: p.w, h: p.h, thick: p.thick });
    const baseScore = p.thick ? 150 : 100;
    state.score += (state.missionDone ? 2 : 1) * baseScore;
    state.stability -= Math.abs(offset) * (p.thick ? 0.52 : 0.36);

    if (offset > 12) state.missionRightStreak += 1;
    else state.missionRightStreak = 0;
    if (state.missionRightStreak >= 3) state.missionDone = true;

    if (state.stack.length >= 20 && !state.clearShown) {
      state.clearShown = true;
      ui.message.textContent = "CLEAR! 20段達成！（そのまま継続可能）";
    }

    if (state.stability <= 0) {
      endGame("バランス崩壊…");
      return;
    }
    state.flying = newFlying();
  }

  if (p.y > canvas.height + 40 || p.x > canvas.width + 80) {
    endGame("キャッチ失敗！パンケーキを落とした");
    return;
  }

  sync();
}

function endGame(msg) {
  state.running = false;
  ui.message.textContent = `${msg} Spaceでリトライ`;
}

function drawPancake(x, y, w, h, thick) {
  ctx.fillStyle = thick ? "#d9983d" : "#e8b867";
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ad742d";
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#fffdf7");
  grad.addColorStop(1, "#ffe9c8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#d0d0d0";
  ctx.fillRect(25, baseY - 145, 35, 145);
  ctx.fillStyle = "#333";
  ctx.fillText("Chef", 20, baseY - 155);

  ctx.fillStyle = "#e6eef9";
  ctx.beginPath();
  ctx.ellipse(state.playerX, baseY, plateW / 2, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#9fb3ce";
  ctx.stroke();

  for (const s of state.stack) drawPancake(s.x, s.y, s.w, s.h, s.thick);
  if (state.flying) drawPancake(state.flying.x, state.flying.y, state.flying.w, state.flying.h, state.flying.thick);
}

function loop(ts) {
  if (!state.last) state.last = ts;
  const dt = Math.min(0.033, (ts - state.last) / 1000);
  state.last = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "a", "A"].includes(e.key)) state.keys.left = true;
  if (["ArrowRight", "d", "D"].includes(e.key)) state.keys.right = true;
  if (e.code === "Space") {
    e.preventDefault();
    if (!state.running) reset();
  }
});
document.addEventListener("keyup", (e) => {
  if (["ArrowLeft", "a", "A"].includes(e.key)) state.keys.left = false;
  if (["ArrowRight", "d", "D"].includes(e.key)) state.keys.right = false;
});

sync();
render();
requestAnimationFrame(loop);
