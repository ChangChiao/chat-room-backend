# 即時聊天室系統技術規格

## 架構總覽

```
┌──────────────┐
│ Client SPA │ (Vue / React / …，Web & Mobile)
└──────┬───────┘
        │ WebSocket (wss://chat.example.com)
┌──────▼───────────────────────────┐
│ Load Balancer (L7 / Sticky) │ ← SSL Termination
└──────┬───────────────────────────┘
        │ (Round‑Robin / IP‑Hash)
┌──────▼─────────┐     ┌───────────▼──────┐
│ Chat Node #1 │     │ Chat Node #N │
│ (NestJS / WS) │  …  │ (NestJS / WS) │
└──────┬─────────┘     └───────────┬──────┘
        │ Redis Pub‑Sub (Typing／Msg Fan‑out)
┌──────▼─────────────────────────────────┐
│ Redis Cluster (Cache & Session Store) │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ RDB (PostgreSQL) — User / Message DB │
└────────────────────────────────────────┘
```

---

## 元件與技術選型

| 元件       | 技術選型                      | 主要職責                                                        |
| ---------- | ----------------------------- | --------------------------------------------------------------- |
| 負載均衡器 | Nginx Stream / AWS ALB        | WebSocket L7 代理、TLS 終止、Sticky Session (IP Hash 或 Cookie) |
| Chat Node  | Node.js 18 + NestJS WebSocket | 連線管理、ACL、訊息轉發、心跳、輸入中 broadcast                 |
| Redis      | Redis 7 (Cluster mode)        | Pub‑Sub、快取、Session & Typing 狀態、單一登入鎖                |
| RDBMS      | PostgreSQL 15                 | 永久訊息、使用者資料、群組資料                                  |
| 物件儲存   | S3 / MinIO                    | 圖片上傳與 CDN 傳遞                                             |
| 認證服務   | Auth Service (NestJS)         | Email / Google OAuth、JWT 發行、Refresh Token                   |

---

## 主要功能設計

### 4.1 訊息流程

- Client 送出 `MESSAGE` Frame → Chat Node
- Chat Node 驗證 JWT → 發佈至 Redis Pub-Sub `<roomId>` channel
- 所有節點接收後向各自的 Client 廣播
- 永久訊息由 async worker 寫入 PostgreSQL
- 圖片訊息：Client 先直傳物件儲存，取得 URL 後以文字訊息發送

### 4.2 Typing Indicator

- Client 每 800ms 鍵入則送 `TYPING_START`
- 無輸入 1s 送 `TYPING_STOP`
- Chat Node 經由 Redis 轉發狀態給同房間其他 Client 顯示「輸入中…」

### 4.3 單一登入控制

- 登入成功時產生 `sessionId`：

  ```
  SETNX user:{uid}:session {sessionId} EX 86400
  ```

- 若第二次登入導致 SETNX 失敗 → 發送 `FORCE_LOGOUT` Frame 並中斷原連線
- 登出或閒置逾時時刪除 Redis Key

### 4.4 心跳與閒置踢出

- Client：每 30 秒送 ping；Server 回 pong
- Server：紀錄 `lastActivity`，若超過 5 分鐘無任何事件 → 主動關閉 (Code: 4408 Idle Timeout)
- 踢出後需重新驗證 JWT / Refresh Token

---

## 安全性與最佳實務

- **JWT 使用 RS256**：放於 `Authorization: Bearer`
- **Refresh Token**：以 `HttpOnly Cookie` 儲存
- **圖片上傳限制**：5 MB 以下，MIME 類型限制 (image/png, image/jpeg, image/webp)
- **WebSocket 傳輸加密**：

  - 使用 `wss://`
  - 強制 TLS 1.3
  - 禁用弱式 Cipher Suite

- **Redis 安全強化**：

  - 啟用 `in-transit encryption`
  - 設定 ACL 角色限制（websocket 角色）

- **依賴掃描工具**：

  - GitHub Dependabot
  - Snyk

---

## 備註

- 本設計支持一對一與群組聊天室
- 適用於 SPA 架構之 Web & Mobile App
