import { CONFIG } from './config.js';
import { UrlCompressor } from './utils.js';

// 下部ボトムバー内へのボタン生成と均等配置
export function initUI(map, currentTileLayer, getCurrentKey, setCurrentKey) {
  const uiPanel = document.getElementById(CONFIG.ELEMENT_IDS.UI_PANEL);
  if (!uiPanel) return;

  uiPanel.innerHTML = "";
  Object.keys(CONFIG.TILE_SOURCES).forEach((key) => {
    const config = CONFIG.TILE_SOURCES[key];
    const btn = document.createElement("button");
    btn.className = `year-button ${key === getCurrentKey() ? "active" : ""}`;
    
    // 下部タブにきれいに収まるよう、名称をパースして最適化
    let shortName = config.title.split("(")[0].replace("航空写真","").replace("現代の","");
    if (shortName.includes("-")) {
      shortName = shortName.split("-")[0] + "年";
    }
    btn.textContent = shortName;
    
    btn.onclick = () => {
      if (key === getCurrentKey()) return;

      setCurrentKey(key);
      currentTileLayer.setUrl(config.url);
      map.fire('move'); 
      
      document.querySelectorAll(".year-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    uiPanel.appendChild(btn);
  });
}

// ズームインジケーター更新
export function updateZoomDisplay(map) {
  const zoomIndicator = document.getElementById(CONFIG.ELEMENT_IDS.ZOOM_INDICATOR);
  if (!zoomIndicator) return;
  zoomIndicator.textContent = `Zoom: ${map.getZoom().toFixed(CONFIG.MAP.ZOOM_DECIMAL_PLACES)}`;
}

// 右クリック / スマホ長押し時のポップアップ
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

  setTimeout(() => {
    const btn = document.getElementById("popupShareBtn");
    if (btn) {
      btn.onclick = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          btn.innerHTML = "✨ コピー完了！";
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
