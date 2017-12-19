import * as maptalks from 'maptalks';

const options = {
    color:[255, 106, 106, 0.1],
    linecolor:[255, 106, 106, 1],
    fillcolor:[255, 106, 106, 0.1],
    lineJoin:'round'
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
export class GlowLayer extends maptalks.VectorLayer {
    constructor(id, options) {
        super(id, options);
    }

    addGeometry(geometries) {
        if (geometries instanceof maptalks.Geometry) {
            geometries = [geometries];
        }
        geometries.forEach(function (geo, index) {
            const type = geo.getType();
            if (type.indexOf('Polygon') < 0 && type.indexOf('LineString') < 0) {
                throw new Error('The geometry at ' + index + ' can not be added to glowing layer');
            }
        });
        return super.addGeometry.apply(this, arguments);
    }
}

GlowLayer.mergeOptions(options);

class GlowLayerRenderer extends maptalks.renderer.OverlayLayerCanvasRenderer {

    draw() {
        this.prepareCanvas();
        this._currentGeometries = this.layer.getGeometries();
        for (let i = 0; i < this._currentGeometries.length; i++) {
            const geo = this._currentGeometries[i];
            if (this._isInViewExtent(geo)) {
                this._drawGeometry(geo);
            }
        }
        if (!this.layer.isLoaded()) {
            this.completeRender();
        }
    }

    _isInViewExtent(geometry) {
        let isIn = true;
        const map = this.layer.getMap();
        this._drawnExtent = map.getExtent();
        const geoExtent = geometry.getExtent();
        if (this._drawnExtent.intersects(geoExtent)) {
            isIn = true;
        } else {
            isIn = false;
        }
        return isIn;
    }

    _drawGeometry(geometry) {
        const type = geometry.getType();
        const coordinates = geometry.getCoordinates();
        //two cases,one is single geometry,and another is multi geometries
        if (coordinates[0] instanceof Array) {
            coordinates.forEach(function (coords) {
                this._drawLine(coords, type);
            }.bind(this));
        } else {
            this._drawLine(coordinates, type);
        }
    }

    _drawLine(coordinates, type) {
        const context = this.context;
        const map = this.layer.getMap();
        for (let j = 5; j >= 0; j--) {
            context.beginPath();
            // draw each line, the last line in each is always white
            context.lineWidth = (j + 1) * 4 - 2;
            context.lineJoin = this.layer.options['lineJoin'];
            if (j === 0) {
                context.strokeStyle = this._getStrokeStyle(this.layer.options['linecolor']);
            } else {
                context.strokeStyle = this._getStrokeStyle(this.layer.options['color']);
            }
            const len = coordinates.length;
            for (let i = 0; i < len; i++) {
                if (i === 0) {
                    const coordFrom = map.coordinateToContainerPoint(coordinates[i]);
                    context.moveTo(coordFrom.x, coordFrom.y);
                } else {
                    const coordTo = map.coordinateToContainerPoint(coordinates[i]);
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
    }

    _getStrokeStyle(color) {
        let strokeStyle = null;
        if (typeof color === 'string' && color.indexOf('#') > -1) {
            strokeStyle = color;
        } else if (color instanceof Array) {
            strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';
        } else {
            throw new Error('stroke color is invalid');
        }
        return strokeStyle;
    }
}

GlowLayer.registerRenderer('canvas', GlowLayerRenderer);

