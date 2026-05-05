const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const ui = {
  score: document.getElementById("score"),
  height: document.getElementById("height"),
  stability: document.getElementById("stability"),
  mission: document.getElementById("mission"),
  message: document.getElementById("message"),
};

const spritePaths = {
  background: "assets/backgrounds/bg_kitchen_bright_1920x1080.svg",
  player: "assets/player/player_plate.svg",
  enemy: "assets/enemies/enemy_burnt_pancake.svg",
};

const sprites = Object.fromEntries(
  Object.entries(spritePaths).map(([key, src]) => {
    const img = new Image();
    img.src = src;
    return [key, img];
  })
);

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
  missionRightStreak: 0,
  missionDone: false,
  clearShown: false,
};

const baseY = canvas.height - 75;
const plateW = 170;
const chefX = canvas.width / 2;
const chefY = 120;

function newFlying() {
  const thick = Math.random() < Math.min(0.7, 0.25 + state.stack.length * 0.03);
  const endScale = thick ? 1.0 : 0.88;
  const diff = Math.min(1.7, 1 + state.stack.length * 0.04);
  const targetX = state.playerX + (Math.random() * 120 - 60);
  const apexLift = 130 + Math.random() * 60;
  return {
    startX: chefX + (Math.random() * 90 - 45),
    startY: chefY + (Math.random() * 20 - 10),
    targetX,
    targetY: baseY - 30,
    progress: 0,
    speed: 0.5 * diff,
    arc: apexLift,
    baseW: 112,
    baseH: 24,
    endScale,
    x: chefX,
    y: chefY,
    w: 42,
    h: 10,
    thick,
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
  p.progress = Math.min(1.25, p.progress + p.speed * dt);
  const t = p.progress;
  const curve = 4 * t * (1 - t);

  p.x = p.startX + (p.targetX - p.startX) * t;
  p.y = p.startY + (p.targetY - p.startY) * t - p.arc * curve;

  const scale = 0.36 + Math.min(1, t) * (p.endScale - 0.36);
  p.w = p.baseW * scale;
  p.h = p.baseH * scale;

  const topY = baseY - state.stack.reduce((a, s) => a + s.h, 0);
  const supportCenter = state.stack.length === 0 ? state.playerX : state.stack[state.stack.length - 1].x;

  if (p.progress >= 1 && p.y + p.h / 2 >= topY) {
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

  if (p.progress > 1.2 || p.y > canvas.height + 60) {
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

function drawImageOrFallback(img, x, y, w, h, fallback) {
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
  } else if (fallback) {
    fallback();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawImageOrFallback(sprites.background, 0, 0, canvas.width, canvas.height, () => {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#fffdf7");
    grad.addColorStop(1, "#ffe9c8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  drawImageOrFallback(sprites.player, state.playerX - plateW / 2, baseY - 16, plateW, 32, () => {
    ctx.fillStyle = "#e6eef9";
    ctx.beginPath();
    ctx.ellipse(state.playerX, baseY, plateW / 2, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#9fb3ce";
    ctx.stroke();
  });

  for (const s of state.stack) drawPancake(s.x, s.y, s.w, s.h, s.thick);

  if (state.flying) {
    if (state.flying.thick) {
      drawImageOrFallback(
        sprites.enemy,
        state.flying.x - state.flying.w / 2,
        state.flying.y - state.flying.h / 2,
        state.flying.w,
        state.flying.h,
        () => drawPancake(state.flying.x, state.flying.y, state.flying.w, state.flying.h, true)
      );
    } else {
      drawPancake(state.flying.x, state.flying.y, state.flying.w, state.flying.h, false);
    }
  }
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