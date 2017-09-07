/*!
 * maptalks.GlowLayer v0.1.2
 * LICENSE : MIT
 * (c) 2016-2017 maptalks.org
 */
/*!
 * requires maptalks@^0.16.0 
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks));
}(this, (function (exports,maptalks) { 'use strict';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var options = {
    color: [255, 106, 106]
};

/**
 * A snap tool used for mouse point to adsorb geometries, it extends maptalks.Class.
 *
 * Thanks to rbush's author, this pluging has used the rbush to inspect surrounding geometries within tolerance(https://github.com/mourner/rbush)
 *
 * @author liubgithub(https://github.com/liubgithub)
 *
 * MIT License
 */
var GlowLayer = function (_maptalks$CanvasLayer) {
    _inherits(GlowLayer, _maptalks$CanvasLayer);

    function GlowLayer(id, options) {
        _classCallCheck(this, GlowLayer);

        var _this = _possibleConstructorReturn(this, _maptalks$CanvasLayer.call(this, id, options));

        _this.geometries = [];
        _this.draw = _this._draw;
        return _this;
    }

    GlowLayer.prototype.addGeometry = function addGeometry(geometry) {
        if (geometry instanceof maptalks.Geometry) {
            var type = geometry.getType();
            if (type.indexOf('Polygon') > -1 || type.indexOf('LineString') > -1) {
                this.geometries.push(geometry);
                this._draw(this.renderContext);
            }
        }
    };

    GlowLayer.prototype.addGeometries = function addGeometries(geometries) {
        if (geometries instanceof Array) {
            for (var i = 0; i < geometries.length; i++) {
                this.addGeometry(geometries[i]);
            }
        }
    };

    GlowLayer.prototype.prepareToDraw = function prepareToDraw(context) {
        this.renderContext = context;
    };

    GlowLayer.prototype._draw = function _draw(context) {
        for (var i = 0; i < this.geometries.length; i++) {
            var geo = this.geometries[i];
            this._drawGeometry(geo, context);
        }
    };

    GlowLayer.prototype.requestMapToRender = function requestMapToRender() {};

    GlowLayer.prototype.completeRender = function completeRender() {
        this.fire('layerload', { target: this });
    };

    GlowLayer.prototype._drawGeometry = function _drawGeometry(geometry, context) {
        var coordinates = geometry.getCoordinates();
        //two cases,one is single geometry,and another is multi geometries
        if (coordinates[0] instanceof Array) {
            coordinates.forEach(function (coords) {
                this._drawLine(coords, context);
            }.bind(this));
        } else {
            this._drawLine(coordinates, context);
        }
    };

    GlowLayer.prototype._drawLine = function _drawLine(coordinates, context) {
        var color = this.options['color'];
        var map = this.getMap();
        for (var j = 5; j >= 0; j--) {
            context.beginPath();
            // draw each line, the last line in each is always white
            context.lineWidth = (j + 1) * 4 - 2;
            if (j === 0) {
                context.strokeStyle = '#fff';
            } else {
                context.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0.2)';
            }
            var len = coordinates.length;
            for (var i = 0; i < len; i++) {
                if (i === 0) {
                    var coordFrom = map.coordinateToContainerPoint(coordinates[i]);
                    context.moveTo(coordFrom.x, coordFrom.y);
                } else if (i > 0 && i < len - 1) {
                    var coordTo = map.coordinateToContainerPoint(coordinates[i + 1]);
                    context.lineTo(coordTo.x, coordTo.y);
                } else {
                    context.stroke();
                }
            }
            //context.closePath();
        }
    };

    return GlowLayer;
}(maptalks.CanvasLayer);

GlowLayer.mergeOptions(options);

var GlowLayerRenderer = function (_maptalks$renderer$Ca) {
    _inherits(GlowLayerRenderer, _maptalks$renderer$Ca);

    function GlowLayerRenderer() {
        _classCallCheck(this, GlowLayerRenderer);

        return _possibleConstructorReturn(this, _maptalks$renderer$Ca.apply(this, arguments));
    }

    GlowLayerRenderer.prototype.onZoomEnd = function onZoomEnd() {
        _maptalks$renderer$Ca.prototype.onZoomEnd.apply(this, arguments);
    };

    GlowLayerRenderer.prototype.onResize = function onResize() {
        _maptalks$renderer$Ca.prototype.onResize.apply(this, arguments);
    };

    GlowLayerRenderer.prototype.onRemove = function onRemove() {};

    return GlowLayerRenderer;
}(maptalks.renderer.CanvasLayerRenderer);

GlowLayer.registerRenderer('canvas', GlowLayerRenderer);

exports.GlowLayer = GlowLayer;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.GlowLayer v0.1.2, requires maptalks@^0.16.0.');

})));
