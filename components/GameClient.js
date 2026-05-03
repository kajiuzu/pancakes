"use client";
import { useEffect, useRef, useState } from "react";

export default function GameClient() {
  const rootRef = useRef(null);
  const [hud, setHud] = useState({ score: 0, height: 0, stability: 100, mission: "右側に3連続で置こう", message: "Spaceで開始 / ←→でお皿移動" });

  useEffect(() => {
    let game;
    let destroyed = false;
    (async () => {
      const Phaser = (await import("phaser")).default;
      class MainScene extends Phaser.Scene {
        constructor() { super("main"); }
        create() {
          this.state = { running: false, score: 0, stack: [], stability: 100, missionStreak: 0, missionDone: false, clearShown: false };
          this.baseY = 500; this.plateX = 480; this.plateW = 170;
          this.cursors = this.input.keyboard.createCursorKeys();
          this.keyA = this.input.keyboard.addKey("A"); this.keyD = this.input.keyboard.addKey("D");
          this.input.keyboard.on("keydown-SPACE", () => { if (!this.state.running) this.resetGame(); });
          this.flying = null;
          this.chef = this.add.rectangle(45, this.baseY - 75, 35, 145, 0xd0d0d0);
          this.plate = this.add.ellipse(this.plateX, this.baseY, this.plateW, 30, 0xe6eef9).setStrokeStyle(2, 0x9fb3ce);
          this.stackGraphics = this.add.graphics();
          this.spawn();
          this.refreshHud();
        }
        resetGame() { this.state = { running: true, score: 0, stack: [], stability: 100, missionStreak: 0, missionDone: false, clearShown: false }; this.plateX = 480; this.spawn(); this.refreshHud("キャッチして積み上げよう！"); }
        spawn() { const thick = Math.random() < Math.min(0.7, 0.25 + this.state.stack.length * 0.03); const w = thick ? 120 : 100; const h = thick ? 26 : 18; const diff = Math.min(1.8, 1 + this.state.stack.length * 0.05); this.flying = { x: 70, y: this.baseY - 190, vx: (220 + Math.random() * 80) * diff, vy: -(280 + Math.random() * 60), w, h, thick }; }
        refreshHud(message) { setHud({ score: Math.floor(this.state.score), height: this.state.stack.length, stability: Math.max(0, Math.floor(this.state.stability)), mission: this.state.missionDone ? "達成! スコアx2.0中" : "右側に3連続で置こう", message: message ?? hud.message }); }
        end(msg) { this.state.running = false; this.refreshHud(`${msg} Spaceでリトライ`); }
        update(_, dtMs) {
          const dt = Math.min(0.033, dtMs / 1000);
          if (this.state.running) {
            if (this.cursors.left.isDown || this.keyA.isDown) this.plateX -= 500 * dt;
            if (this.cursors.right.isDown || this.keyD.isDown) this.plateX += 500 * dt;
            this.plateX = Phaser.Math.Clamp(this.plateX, this.plateW / 2, 960 - this.plateW / 2);
            this.plate.x = this.plateX;
            const p = this.flying; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
            const topY = this.baseY - this.state.stack.reduce((a, s) => a + s.h, 0);
            const support = this.state.stack.length === 0 ? this.plateX : this.state.stack[this.state.stack.length - 1].x;
            if (p.vy > 0 && p.y + p.h / 2 >= topY) {
              const offset = p.x - support; const allowed = Math.max(22, 56 - this.state.stack.length * 1.4);
              if (Math.abs(offset) > allowed) return this.end("崩れてしまった…");
              p.y = topY - p.h / 2; this.state.stack.push({ ...p });
              this.state.score += (this.state.missionDone ? 2 : 1) * (p.thick ? 150 : 100);
              this.state.stability -= Math.abs(offset) * (p.thick ? 0.52 : 0.36);
              this.state.missionStreak = offset > 12 ? this.state.missionStreak + 1 : 0;
              if (this.state.missionStreak >= 3) this.state.missionDone = true;
              if (this.state.stack.length >= 20 && !this.state.clearShown) { this.state.clearShown = true; this.refreshHud("CLEAR! 20段達成！（そのまま継続可能）"); }
              if (this.state.stability <= 0) return this.end("バランス崩壊…");
              this.spawn(); this.refreshHud();
            }
            if (p.y > 620 || p.x > 1040) return this.end("キャッチ失敗！パンケーキを落とした");
          }
          this.stackGraphics.clear();
          const draw = (x, y, w, h, thick) => { this.stackGraphics.fillStyle(thick ? 0xd9983d : 0xe8b867, 1); this.stackGraphics.fillEllipse(x, y, w, h); this.stackGraphics.lineStyle(2, 0xad742d, 1); this.stackGraphics.strokeEllipse(x, y, w, h); };
          for (const s of this.state.stack) draw(s.x, s.y, s.w, s.h, s.thick); if (this.flying) draw(this.flying.x, this.flying.y, this.flying.w, this.flying.h, this.flying.thick);
        }
      }
      if (destroyed) return;
      game = new Phaser.Game({ type: Phaser.AUTO, width: 960, height: 540, backgroundColor: "#fffef9", parent: rootRef.current, scene: MainScene });
    })();
    return () => { destroyed = true; if (game) game.destroy(true); };
  }, []);

  return (<main className="container"><h1>フライングパンケーキ</h1><section className="hud"><div>SCORE: {hud.score}</div><div>HEIGHT: {hud.height}</div><div>STABILITY: {hud.stability}%</div><div>MISSION: {hud.mission}</div></section><div id="game-root" ref={rootRef} /><p id="message">{hud.message}</p></main>);
}
