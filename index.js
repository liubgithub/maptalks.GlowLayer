import * as maptalks from 'maptalks';

const options = {
    color:[255, 106, 106]
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
                throw new Error('The geometry at ' + index + ' can not be added to layer');
            }
        });
        return super.addGeometry.apply(this, arguments);
    }
}

GlowLayer.mergeOptions(options);

class GlowLayerRenderer extends maptalks.renderer.OverlayLayerCanvasRenderer {

    draw() {
        this.prepareCanvas();
        const context = this.context;
        this._currentGeometries = this.layer.getGeometries();
        for (let i = 0; i < this.geometries.length; i++) {
            const geo = this.geometries[i];
            this._drawGeometry(geo, context);
        }
    }

    completeRender() {
        this.fire('layerload', { target:this });
    }

    _drawGeometry(geometry, context) {
        const coordinates = geometry.getCoordinates();
        //two cases,one is single geometry,and another is multi geometries
        if (coordinates[0] instanceof Array) {
            coordinates.forEach(function (coords) {
                this._drawLine(coords, context);
            }.bind(this));
        } else {
            this._drawLine(coordinates, context);
        }
    }

    _drawLine(coordinates, context) {
        const color = this.options['color'];
        const map = this.getMap();
        for (let j = 5; j >= 0; j--) {
            context.beginPath();
            // draw each line, the last line in each is always white
            context.lineWidth = (j + 1) * 4 - 2;
            if (j === 0) {
                context.strokeStyle = '#fff';
            } else {
                context.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0.2)';
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
            context.stroke();
            context.closePath();
        }
    }
}

GlowLayer.registerRenderer('canvas', GlowLayerRenderer);

