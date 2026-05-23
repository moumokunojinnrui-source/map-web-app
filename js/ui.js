import { CONFIG } from './config.js';
import { UrlCompressor } from './utils.js';

// 年代・地図切り替えボタンの自動生成（横並び化連動）
export function initUI(map, currentTileLayer, getCurrentKey, setCurrentKey) {
  const uiPanel = document.getElementById(CONFIG.ELEMENT_IDS.UI_PANEL);
  const mapTitle = document.getElementById(CONFIG.ELEMENT_IDS.MAP_TITLE);
  if (!uiPanel || !mapTitle) return;

  uiPanel.innerHTML = "";
  Object.keys(CONFIG.TILE_SOURCES).forEach((key) => {
    const config = CONFIG.TILE_SOURCES[key];
    const btn = document.createElement("button");
    btn.className = `year-button ${key === getCurrentKey() ? "active" : ""}`;
    
    // 横並びで文字がはみ出さないよう、ボタン内は短いタイトルに最適化
    btn.textContent = config.title.split("(")[0].replace("航空写真","");
    
    btn.onclick = () => {
      if (key === getCurrentKey()) return;

      setCurrentKey(key);
      currentTileLayer.setUrl(config.url);
      map.fire('move'); 

      // ロゴ看板と現在の選択年代をリッチに描画
      mapTitle.innerHTML = `
        <span style="font-size:24px; letter-spacing:0.1em; display:block; margin-bottom:2px; color:var(--accent-cyan);">Geo Memories</span>
        <span style="font-size:14px; color:var(--text-muted); font-weight:normal;">表示中: ${config.title}</span>
      `;
      
      document.querySelectorAll(".year-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    uiPanel.appendChild(btn);
  });
  
  // 初期ロード時の看板表示
  const initialConfig = CONFIG.TILE_SOURCES[getCurrentKey()];
  mapTitle.innerHTML = `
    <span style="font-size:24px; letter-spacing:0.1em; display:block; margin-bottom:2px; color:var(--accent-cyan);">Geo Memories</span>
    <span style="font-size:14px; color:var(--text-muted); font-weight:normal;">表示中: ${initialConfig.title}</span>
  `;
}

// ズームインジケーター更新
export function updateZoomDisplay(map) {
  const zoomIndicator = document.getElementById(CONFIG.ELEMENT_IDS.ZOOM_INDICATOR);
  if (!zoomIndicator) return;
  zoomIndicator.textContent = `Zoom: ${map.getZoom().toFixed(CONFIG.MAP.ZOOM_DECIMAL_PLACES)}`;
}

// 右クリック / スマホ長押しされた地点のコンセプト＆共有ポップアップ生成
export function generateShareLinkAtLocation(map, latlng) {
  const zoom = map.getZoom();
  const shortHash = UrlCompressor.compress(zoom, latlng.lat, latlng.lng);
  const shareUrl = `${window.location.origin}${window.location.pathname}#${shortHash}`;
  
  const popupContent = document.createElement("div");
  popupContent.className = "concept-popup-container";
  popupContent.innerHTML = `
    <div class="concept-title">Geo Memories</div>
    <p class="concept-text">「${CONFIG.CONCEPT.TEXT}」</p>
    <div class="ad-space">
      ${CONFIG.CONCEPT.AD_DUMMY}
    </div>
    <button class="popup-share-button" id="popupShareBtn">
      ${CONFIG.CONCEPT.BUTTON_LABEL}
    </button>
  `;

  L.popup()
    .setLatLng(latlng)
    .setContent(popupContent)
    .openOn(map);

  // ポップアップがDOMに配置された後にクリックイベントをバインド
  setTimeout(() => {
    const btn = document.getElementById("popupShareBtn");
    if (btn) {
      btn.onclick = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          btn.innerHTML = "✨ URLをコピーしました！";
          btn.style.background = "#00ddff";
          btn.style.color = "#000000";
          window.history.replaceState(null, "", `#${shortHash}`);
        }).catch(err => {
          console.error("コピー失敗:", err);
          btn.textContent = "コピー失敗";
        });
      };
    }
  }, 50);
}
