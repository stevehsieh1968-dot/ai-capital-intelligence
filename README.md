# AI Capital Intelligence

IPO × 投資 × 併購 × 企業估值智慧平台（MVP 原型）。

- 前端：單一檔案 `index.html`（純 HTML／CSS／JavaScript，無需建置）
- 後端：`api/ai.js`（Vercel Edge Function，串接 Anthropic Claude API）

## 功能

| 頁面 | 內容 |
|---|---|
| 平台架構 | 總控 Orchestrator、八大模組、七大專家 Agent、資料底層 |
| 案件資料中心 | 多案件管理、上傳 PDF／Word／Excel／CSV／TXT（瀏覽器端解析）、多年度財務數據、AI 擷取財報數字、一鍵帶入估值計算器 |
| 投資決策委員會 | 上傳文件即召開全體委員會；每位 Agent 可上傳專屬文件並單獨分析；總控交叉驗證後可整合下載 PowerPoint 分析報告 |
| IPO 智慧中心 | 興櫃、上市、上櫃、創新板、營利、非營利六條路徑準備度與時程 |
| 募資計畫書審查 | 九項自評＋AI 審查與升級建議 |
| 企業估值中心 | DCF＋敏感度、同業倍數、募資與股權稀釋 |
| 生技估值引擎 | rNPV 管線、授權與里程碑、SOTP、臨床成功率假設 |
| 投資與併購 | 買賣方功能、五個子 Agent、綜效與溢價檢驗 |
| 專利・技術・臨床 | TRL、IP 與臨床查核、AI 評估 |
| 產業情報 | 八大明星產業與 AI 研究框架 |
| 案例資料庫、資料清單、100 分評分、開發藍圖 | |

計算器與清單資料存在使用者自己的瀏覽器（localStorage）。

## 部署到 Vercel

1. 到 https://vercel.com/new ，選 **Import Git Repository**，選這個 repo。
2. Framework Preset 選 **Other**，其他設定不用改，按 **Deploy**。
3. 部署完成後到 **Settings → Environment Variables** 新增：
   - `ANTHROPIC_API_KEY`：你的 Anthropic API Key（https://console.anthropic.com/ 取得）
   - `ACI_ACCESS_CODE`：自訂一組存取碼（強烈建議，否則任何拿到網址的人都能用你的 API 額度）
   - `ACI_MODEL`（選填）：例如 `claude-sonnet-5-5`，統一指定模型
4. 到 **Deployments** 對最新部署按 **Redeploy**，讓環境變數生效。
5. 打開網站，在「投資決策委員會」頁輸入存取碼即可使用 AI 功能。

## 自訂網域：capital.e-wisdom.com.tw

1. Vercel 專案 → **Settings → Domains** → 輸入 `capital.e-wisdom.com.tw` → **Add**。
2. 到 e-wisdom.com.tw 的 DNS 管理處新增一筆記錄：
   - 類型 `CNAME`，主機名稱 `capital`，值填 Vercel 畫面顯示的目標（例如 `cname.vercel-dns.com` 或專案專屬的 `xxxx.vercel-dns-0xx.com`），TTL 預設即可。
3. 等 DNS 生效（數分鐘至數小時），Vercel 會自動簽發 HTTPS 憑證。

官網 `www.e-wisdom.com.tw` 不受影響。

之後只要推送到 `main` 分支，Vercel 會自動重新部署。

## 本機預覽

```bash
npm i -g vercel
vercel dev
```

## 免責聲明

本平台為分析輔助工具與產品原型。AI 輸出不構成法律意見、會計簽證或投資建議；正式意見與證券相關受規範服務，應由合格專業人士提供。示範數字均為虛構。
