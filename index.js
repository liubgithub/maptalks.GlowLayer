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
export class GlowLayer extends maptalks.CanvasLayer {
    constructor(id, options) {
        super(id, options);
        this.geometries = [];
        this.draw = this._draw;
    }

    addGeometry(geometry) {
        if (geometry instanceof maptalks.Geometry) {
            const type = geometry.getType();
            if (type.indexOf('Polygon') > -1 || type.indexOf('LineString') > -1) {
                this.geometries.push(geometry);
                this._draw(this.renderContext);
            }
        }
    }

    addGeometries(geometries) {
        if (geometries instanceof Array) {
            for (let i = 0; i < geometries.length; i++) {
                this.addGeometry(geometries[i]);
            }
        }
    }

    prepareToDraw(context) {
        this.renderContext = context;
    }

    _draw(context) {
        for (let i = 0; i < this.geometries.length; i++) {
            const geo = this.geometries[i];
            this._drawGeometry(geo, context);
        }
    }

    requestMapToRender() {

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

GlowLayer.mergeOptions(options);

class GlowLayerRenderer extends maptalks.renderer.CanvasLayerRenderer {

    onZoomEnd() {
        super.onZoomEnd.apply(this, arguments);
    }

    onResize() {
        super.onResize.apply(this, arguments);
    }

    onRemove() {
    }
}

GlowLayer.registerRenderer('canvas', GlowLayerRenderer);

