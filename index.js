import * as maptalks from 'maptalks';

const options = {
    color:'#1afb56'
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
   constructor(id, options){
      super(id, options);
   }

   prepareToDraw(context) {

   }

   draw(context) {

   }

   requestMapToRender() {

   }

   completeRender() {
      this.fire('layerload',{});
   }

   addGeometry() {

   }

}

SnapTool.mergeOptions(options);

