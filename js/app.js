import { CONFIG } from './config.js';
import { UrlCompressor } from './utils.js';
import { initUI, updateZoomDisplay, generateShareLinkAtLocation } from './ui.js';

const hash = window.location.hash.replace("#", "");
const urlState = hash ? UrlCompressor.decompress(hash) : null;
const initialCenter = urlState ? urlState.center : CONFIG.MAP.DEFAULT_CENTER;
const initialZoom = urlState ? urlState.zoom : CONFIG.MAP.DEFAULT_ZOOM;

const map = L.map('map', {
  center: initialCenter,
  zoom: initialZoom,
  zoomControl: false 
});
L.control.zoom({ position: 'bottomright' }).addTo(map);

let currentKey = "gazo1";
const getCurrentKey = () => currentKey;
const setCurrentKey = (key) => { currentKey = key; };

const currentTileLayer = L.tileLayer(CONFIG.TILE_SOURCES[currentKey].url, {
  maxZoom: CONFIG.TILE_SOURCES[currentKey].maxZoom,             
  maxNativeZoom: CONFIG.TILE_SOURCES[currentKey].maxNativeZoom,   
  keepBuffer: 4,          
  updateWhenIdle: false,  
  attribution: CONFIG.TILE_SOURCES[currentKey].attribution
}).addTo(map);

// ★衝突判定（Collision）レイヤーグループの単独初期化
const spotsCollisionGroup = L.layerGroup.collision();

function toggleSpotsLayerVisibility() {
  const currentZoom = map.getZoom();
  if (currentZoom >= CONFIG.MAP.MIN_ZOOM_FOR_SPOTS) {
    if (!map.hasLayer(spotsCollisionGroup)) {
      spotsCollisionGroup.addTo(map);
    }
  } else {
    if (map.hasLayer(spotsCollisionGroup)) {
      map.removeLayer(spotsCollisionGroup);
    }
  }
}

// ★競合完全解消：GeoJSONのデータを安全にパースしてCollisionグループへ流し込む
fetch(CONFIG.MAP.SPOTS_GEOJSON_PATH)
  .then(res => res.json())
  .then(spotsData => {
    L.geoJSON(spotsData, {
      pointToLayer: (feature, latlng) => {
        const labelHtml = `<div class="leaflet-custom-label">${feature.properties.name}</div>`;
        const marker = L.marker(latlng, {
          icon: L.divIcon({
            className: 'custom-label-container',
            html: labelHtml,
            iconSize: [160, 40], // 文字サイズ拡大に合わせて判定枠も最適化
            iconAnchor: [80, 20]
          })
        });
        
        // 生成した個別のマーカーを、即座にCollisionグループへ直接突っ込む
        spotsCollisionGroup.addLayer(marker);
        return marker;
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const description = `
          <div style="color:#000; font-family:sans-serif; padding:4px; min-width:200px; font-size:16px;">
            <strong style="font-size:18px; display:block; margin-bottom:6px;">${props.name}</strong>
            <span style="font-size:14px; color:#555;">設置年代: ${props.year || "不明"}年</span>
            <hr style="border:0; border-top:1px solid #eee; margin:8px 0;">
            ${props.mall ? `<div style="font-size:14px;"><b>モール:</b> ${props.mall}</div>` : ""}
            ${props.note ? `<p style="margin-top:8px; font-size:14px; color:#333; background:#f5f5f5; padding:6px; border-radius:4px; line-height:1.4;">${props.note}</p>` : ""}
          </div>
        `;
        layer.bindPopup(description);
      }
    });

    // 初回の表示判定を実行
    toggleSpotsLayerVisibility();
  })
  .catch(err => console.error("スポット読み込みエラー:", err));

// UI初期化
initUI(map, currentTileLayer, getCurrentKey, setCurrentKey);
updateZoomDisplay(map);

// イベント群の登録
map.on('move', () => {
  updateZoomDisplay(map);
  toggleSpotsLayerVisibility(); 
});

// PC用：右クリックイベント
map.on('contextmenu', (e) => {
  generateShareLinkAtLocation(map, e.latlng);
});

// スマホ用：長押し（ロングプレス）判定
let pressTimer = null;
map.on('mousedown touchstart', (e) => {
  if (e.originalEvent.touches && e.originalEvent.touches.length > 1) return;
  const latlng = e.latlng;
  if (!latlng) return;

  pressTimer = setTimeout(() => {
    generateShareLinkAtLocation(map, latlng);
  }, 800);
});

map.on('mouseup mousemove touchend touchmove', () => {
  if (pressTimer) clearTimeout(pressTimer);
});
