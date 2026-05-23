// 【設定の一元管理 (CONFIG)】
export const CONFIG = {
  MAP: {
    DEFAULT_CENTER: [35.68124, 139.76719], 
    DEFAULT_ZOOM: 16, 
    MIN_ZOOM_FOR_SPOTS: 15, 
    SPOTS_GEOJSON_PATH: "data/spots.geojson",
    ZOOM_DECIMAL_PLACES: 2
  },
  ELEMENT_IDS: {
    UI_PANEL: "uiPanel",
    MAP_TITLE: "mapTitle",
    ZOOM_INDICATOR: "zoomIndicator"
  },
  // ★文言・広告の一元管理
  CONCEPT: {
    TEXT: "消えてゆく街の記憶や、かつて愛されたお店の名前を、みんなで大切に残せる場所を目指して。",
    BUTTON_LABEL: "🔗 この地点の時空URLを共有する",
    AD_DUMMY: "【スポンサーリンク】<br>昭和レトロ・地域アーカイブ情報募集中！"
  },
  TILE_SOURCES: {
    gazo1: { 
      title: "1974-1978年(昭和航空写真)", 
      url: "https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg", 
      attribution: "© 国土地理院",
      maxZoom: 20,       
      maxNativeZoom: 18  
    },
    latest: { 
      title: "最新航空写真(現代)", 
      url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", 
      attribution: "© 国土地理院",
      maxZoom: 20,       
      maxNativeZoom: 18  
    },
    pale: { 
      title: "現代の白地図(駅·町名入り)", 
      url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", 
      attribution: "© 国土地理院",
      maxZoom: 20,       
      maxNativeZoom: 18  
    }
  }
};
