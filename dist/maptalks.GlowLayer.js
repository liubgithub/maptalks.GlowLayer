/*!
 * maptalks.GlowLayer v0.1.1
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
    color: [255, 106, 106, 0.1],
    linecolor: [255, 106, 106, 1],
    fillcolor: [255, 106, 106, 0.1],
    lineJoin: 'round'
};

/**
 * A layer used to drawing geometry with glowing effects, it extends maptalks.VectorLayer.
 *
 * Thanks to Ashley Sheridan, I had got inspiration in this amazing websit(http://www.ashleysheridan.co.uk/blog/Animated+Glowing+Lines+in+Canvas)
 *
 * @author liubgithub(https://github.com/liubgithub)
 *
 * MIT License
 */
var GlowLayer = function (_maptalks$VectorLayer) {
    _inherits(GlowLayer, _maptalks$VectorLayer);

    function GlowLayer(id, options) {
        _classCallCheck(this, GlowLayer);

        return _possibleConstructorReturn(this, _maptalks$VectorLayer.call(this, id, options));
    }

    GlowLayer.prototype.addGeometry = function addGeometry(geometries) {
        if (geometries instanceof maptalks.Geometry) {
            geometries = [geometries];
        }
        geometries.forEach(function (geo, index) {
            var type = geo.getType();
            if (type.indexOf('Polygon') < 0 && type.indexOf('LineString') < 0) {
                throw new Error('The geometry at ' + index + ' can not be added to glowing layer');
            }
        });
        return _maptalks$VectorLayer.prototype.addGeometry.apply(this, arguments);
    };

    return GlowLayer;
}(maptalks.VectorLayer);

GlowLayer.mergeOptions(options);

var GlowLayerRenderer = function (_maptalks$renderer$Ov) {
    _inherits(GlowLayerRenderer, _maptalks$renderer$Ov);

    function GlowLayerRenderer() {
        _classCallCheck(this, GlowLayerRenderer);

        return _possibleConstructorReturn(this, _maptalks$renderer$Ov.apply(this, arguments));
    }

    GlowLayerRenderer.prototype.draw = function draw() {
        this.prepareCanvas();
        this._currentGeometries = this.layer.getGeometries();
        for (var i = 0; i < this._currentGeometries.length; i++) {
            var geo = this._currentGeometries[i];
            if (this._isInViewExtent(geo)) {
                this._drawGeometry(geo);
            }
        }
        if (!this.layer.isLoaded()) {
            this.completeRender();
        }
    };

    GlowLayerRenderer.prototype._isInViewExtent = function _isInViewExtent(geometry) {
        var isIn = true;
        var map = this.layer.getMap();
        this._drawnExtent = map.getExtent();
        var geoExtent = geometry.getExtent();
        if (this._drawnExtent.intersects(geoExtent)) {
            isIn = true;
        } else {
            isIn = false;
        }
        return isIn;
    };

    GlowLayerRenderer.prototype._drawGeometry = function _drawGeometry(geometry) {
        var type = geometry.getType();
        var coordinates = geometry.getCoordinates();
        //two cases,one is single geometry,and another is multi geometries
        if (coordinates[0] instanceof Array) {
            coordinates.forEach(function (coords) {
                this._drawLine(coords, type);
            }.bind(this));
        } else {
            this._drawLine(coordinates, type);
        }
    };

    GlowLayerRenderer.prototype._drawLine = function _drawLine(coordinates, type) {
        var context = this.context;
        var map = this.layer.getMap();
        for (var j = 5; j >= 0; j--) {
            context.beginPath();
            // draw each line, the last line in each is always white
            context.lineWidth = (j + 1) * 4 - 2;
            context.lineJoin = this.layer.options['lineJoin'];
            if (j === 0) {
                context.strokeStyle = this._getStrokeStyle(this.layer.options['linecolor']);
            } else {
                context.strokeStyle = this._getStrokeStyle(this.layer.options['color']);
            }
            var len = coordinates.length;
            for (var i = 0; i < len; i++) {
                if (i === 0) {
                    var coordFrom = map.coordinateToContainerPoint(coordinates[i]);
                    context.moveTo(coordFrom.x, coordFrom.y);
                } else {
                    var coordTo = map.coordinateToContainerPoint(coordinates[i]);
                    context.lineTo(coordTo.x, coordTo.y);
                }
            }
            if (type.indexOf('LineString') > -1) {
                context.stroke();
            } else if (type.indexOf('Polygon') > -1) {
                context.closePath();
                context.fillStyle = this._getStrokeStyle(this.layer.options['fillcolor']);
                context.fill();
                context.stroke();
            }
        }
    };

    GlowLayerRenderer.prototype._getStrokeStyle = function _getStrokeStyle(color) {
        var strokeStyle = null;
        if (typeof color === 'string' && color.indexOf('#') > -1) {
            strokeStyle = color;
        } else if (color instanceof Array) {
            strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';
        } else {
            throw new Error('stroke color is invalid');
        }
        return strokeStyle;
    };

    return GlowLayerRenderer;
}(maptalks.renderer.OverlayLayerCanvasRenderer);

GlowLayer.registerRenderer('canvas', GlowLayerRenderer);

exports.GlowLayer = GlowLayer;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.GlowLayer v0.1.1, requires maptalks@^0.16.0.');

})));
