# Web α → Unity β 移行計画（フライングパンケーキ）

## 0. 目的
本計画は、Web α版でゲーム性を高速検証し、Unity β版で演出品質・端末最適化・配信準備を完成させるための実行手順を定義する。

## 1. 開発フェーズ

### Phase A: Web α（2〜4週間）
**ゴール:** 「面白さの核」を定量的に確定する。  
- コアループ: キャッチ → 積む → 崩れる
- 失敗条件の納得感
- 1プレイ時間（目標30〜60秒）
- 目標継続率（D1の仮説）

**Done条件:**
- 主要パラメータを凍結（速度、重力、許容ズレ、スコア係数）
- プレイログで最低100セッションを取得

### Phase B: Unity Prototype（2〜3週間）
**ゴール:** Web αの挙動をUnityで同等再現する。  
- 同じルールで再現
- 物理/入力/判定の差分解消
- モバイル端末で安定60fps目標

**Done条件:**
- Web版との差分が仕様化されている
- QAチェックリストを80%以上通過

### Phase C: Unity β（4〜8週間）
**ゴール:** 演出を強化し、配信可能品質にする。  
- VFX/SFX/UIアニメーション
- チュートリアル
- ミッション拡張
- ストア準備（素材、説明文、審査対策）

**Done条件:**
- 主要端末でクラッシュ率基準内
- KPI監視のSDK導入完了

---

## 2. 実装責務の分割（捨てる実装 / 持ち込む実装）

### Web αで「持ち込む」もの
- ルール定義
- スコア計算式
- 崩壊判定閾値
- ミッション条件
- HUD情報設計

### Web αで「捨てる」もの
- 一時的UI装飾
- 暫定アセット
- フレームワーク依存の描画実装

### Unityで新規最適化するもの
- タッチ操作
- パーティクル、カメラ演出
- 端末別パフォーマンス設定
- ネイティブSDK連携

---

## 3. データ仕様（移植時の共通言語）

## CoreParams（JSON管理推奨）
- `gravity`
- `spawnSpeedMin / spawnSpeedMax`
- `allowedOffsetBase`
- `allowedOffsetDecayPerStack`
- `thickScore / thinScore`
- `thickStabilityPenalty / thinStabilityPenalty`
- `clearHeight`

## RuntimeState
- `score`
- `height`
- `stability`
- `missionProgress`
- `isGameOver`

> ルール値は ScriptableObject または JSON で外出しし、Unity実装時に再調整しやすくする。

---

## 4. Unity実装マッピング

- `GameManager` : 状態遷移、スコア、失敗判定
- `Spawner` : パンケーキ生成パターン
- `PlateController` : 左右移動・タッチ入力
- `StackResolver` : 着地判定、オフセット計算、崩壊判定
- `MissionSystem` : ミッション進行と報酬
- `UIController` : HUD更新と演出トリガー
- `EffectDirector` : ヒットストップ、カメラ揺れ、VFX/SFX

---

## 5. テスト計画

### Web α テスト
- パラメータ回帰テスト（速度、重力、崩壊閾値）
- 入力遅延と誤判定確認
- 100セッション以上のログ収集

### Unity Prototype テスト
- iOS/Android実機でFPS・発熱確認
- 判定一致テスト（Web α基準との差分）
- 端末解像度別UI崩れ確認

### Unity β テスト
- チュートリアル完走率
- リテンション初期指標
- クラッシュログ監視

---

## 6. マイルストーン
- M1: Web α仕様凍結
- M2: Unity同等再現完了
- M3: 演出強化版完成
- M4: β配布開始

---

## 7. リスクと対策
- **リスク:** WebとUnityで判定差が出る  
  **対策:** 判定ロジックを数式とテストケースで固定
- **リスク:** 演出追加でFPS低下  
  **対策:** 低負荷プリセットを先に用意
- **リスク:** 仕様変更が頻発  
  **対策:** 週次で「凍結パラメータ」を更新管理

---

## 8. 今週の着手タスク（直近）
1. Web αのパラメータ外出し（JSON）
2. 崩壊判定テストケースを10件作成
3. Unityプロジェクト雛形作成（Scene + GameManager）
4. 移植チェックリスト作成
