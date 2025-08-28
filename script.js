let map;
let markers = [];
let geojsonData = null;
let currentArea = "";
let currentYear = 2000;

// GeoJSONファイルを読み込む
async function loadGeoJSON() {
  const response = await fetch("www1/data.geojson");
  geojsonData = await response.json();

  // プルダウンにエリア一覧をセット
  const areaSelect = document.getElementById("area-select");
  const areas = new Set();
  geojsonData.features.forEach(f => {
    if (f.properties && f.properties.area) {
      areas.add(f.properties.area);
    }
  });

  areas.forEach(area => {
    const option = document.createElement("option");
    option.value = area;
    option.textContent = area;
    areaSelect.appendChild(option);
  });
}

// マップ初期化
function initMap() {
  map = L.map("map").setView([35.681, 139.767], 6); // 日本の中心あたり

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

// 指定エリア・年代でフィルタリングして表示
function updateMap() {
  if (!geojsonData) return;

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  geojsonData.features.forEach(f => {
    const props = f.properties;
    const coords = f.geometry.coordinates;

    if (props.area === currentArea) {
      if (!props.year || props.year == currentYear) {
        const marker = L.marker([coords[1], coords[0]]).addTo(map);
        marker.bindPopup(`<b>${props.name}</b><br>(${props.year || "年代不明"})`);
        markers.push(marker);
      }
    }
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

// ページ切替イベント
document.getElementById("go-btn").addEventListener("click", () => {
  const select = document.getElementById("area-select");
  currentArea = select.value;
  if (!currentArea) {
    alert("エリアを選択してください");
    return;
  }
  document.getElementById("top-page").classList.add("hidden");
  document.getElementById("map-page").classList.remove("hidden");
  document.getElementById("selected-info").innerText = `エリア: ${currentArea}`;
  initMap();
  updateMap();
});

// スライダー操作
document.getElementById("year-slider").addEventListener("input", (e) => {
  currentYear = e.target.value;
  document.getElementById("year-label").innerText = currentYear;
  updateMap();
});

// ハンバーガーメニュー開閉
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".menu").classList.toggle("hidden");
});

// トップに戻る
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("map-page").classList.add("hidden");
  document.getElementById("top-page").classList.remove("hidden");
});

// ダウンロード（GeoJSON & CSV）
document.getElementById("download-btn").addEventListener("click", () => {
  if (!geojsonData) return;

  // 現在のエリア・年代をフィルタリングしたデータ
  const filtered = {
    type: "FeatureCollection",
    features: geojsonData.features.filter(f => {
      return f.properties.area === currentArea &&
             (!f.properties.year || f.properties.year == currentYear);
    })
  };

  // GeoJSON保存
  const geoBlob = new Blob([JSON.stringify(filtered, null, 2)], {type: "application/json"});
  const geoUrl = URL.createObjectURL(geoBlob);
  const geoLink = document.createElement("a");
  geoLink.href = geoUrl;
  geoLink.download = `${currentArea}_${currentYear}.geojson`;
  geoLink.click();

  // CSV保存
  const csvData = filtered.features.map(f => ({
    name: f.properties.name,
    area: f.properties.area,
    year: f.properties.year,
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1]
  }));
  const csv = Papa.unparse(csvData);
  const csvBlob = new Blob([csv], {type: "text/csv"});
  const csvUrl = URL.createObjectURL(csvBlob);
  const csvLink = document.createElement("a");
  csvLink.href = csvUrl;
  csvLink.download = `${currentArea}_${currentYear}.csv`;
  csvLink.click();
});

// 初期ロードでGeoJSON読み込み
loadGeoJSON();
