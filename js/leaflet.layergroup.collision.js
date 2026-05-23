L.LayerGroup.Collision = L.LayerGroup.extend({
    options: { margin: 0 },
    initialize: function (options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);
    },
    addLayer: function (layer) {
        L.LayerGroup.prototype.addLayer.call(this, layer);
        if (this._map) { this._onMove(); }
    },
    removeLayer: function (layer) {
        L.LayerGroup.prototype.removeLayer.call(this, layer);
        if (this._map) { this._onMove(); }
    },
    onAdd: function (map) {
        this._map = map;
        L.LayerGroup.prototype.onAdd.call(this, map);
        map.on('moveend zoomend', this._onMove, this);
        this._onMove();
    },
    onRemove: function (map) {
        map.off('moveend zoomend', this._onMove, this);
        L.LayerGroup.prototype.onRemove.call(this, map);
        this._map = null;
    },
    _onMove: function () {
        if (!this._map) return;
        var map = this._map, visibleLayers = [], margin = this.options.margin;
        this.eachLayer(function (layer) {
            if (!map.hasLayer(layer)) return;
            if (layer.getElement) {
                var el = layer.getElement();
                if (el) el.style.visibility = 'visible';
            }
            var bounds = null;
            if (layer.getBounds) {
                bounds = map.latLngToLayerPoint(layer.getBounds().getCenter());
            } else if (layer.getLatLng) {
                var p = map.latLngToLayerPoint(layer.getLatLng());
                var icon = layer.options.icon;
                if (icon && icon.options && icon.options.iconSize) {
                    var size = icon.options.iconSize;
                    var anchor = icon.options.iconAnchor || [size[0]/2, size[1]/2];
                    bounds = L.bounds(
                        [p.x - anchor[0] - margin, p.y - anchor[1] - margin],
                        [p.x - anchor[0] + size[0] + margin, p.y - anchor[1] + size[1] + margin]
                    );
                } else {
                    bounds = L.bounds([p.x - 10, p.y - 10], [p.x + 10, p.y + 10]);
                }
            }
            if (!bounds) return;
            var collision = false;
            for (var i = 0; i < visibleLayers.length; i++) {
                if (bounds.intersects(visibleLayers[i])) {
                    collision = true;
                    break;
                }
            }
            if (collision) {
                if (layer.getElement) {
                    var el = layer.getElement();
                    if (el) el.style.visibility = 'hidden';
                }
            } else {
                visibleLayers.push(bounds);
            }
        });
    }
});
L.layerGroup.collision = function (options) {
    return new L.LayerGroup.Collision(options);
};
