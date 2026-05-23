// URLハッシュの圧縮・復元ロジック
export const UrlCompressor = {
  compress(zoom, lat, lng) {
    const z = Math.round(zoom);
    const y = Math.round((lat + 90) * 100000);
    const x = Math.round((lng + 180) * 100000);
    return `${z.toString(36)}_${y.toString(36)}_${x.toString(36)}`;
  },
  decompress(hash) {
    try {
      const parts = hash.split("_");
      if (parts.length !== 3) return null;
      const zoom = parseInt(parts[0], 36);
      const lat = (parseInt(parts[1], 36) / 100000) - 90;
      const lng = (parseInt(parts[2], 36) / 100000) - 180;
      return { zoom, center: [lat, lng] };
    } catch (e) {
      return null;
    }
  }
};
