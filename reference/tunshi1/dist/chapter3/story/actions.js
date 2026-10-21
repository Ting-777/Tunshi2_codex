import {OutdoorActions} from './outdoor-actions.js';
import {VillaActions} from './villa-actions.js';
export class ThirdActions{
 constructor(rt){this.rt=rt;this.outdoor=new OutdoorActions(rt);this.villa=new VillaActions(rt);}
 handler(o){return o.id.startsWith('c304')?this.villa:this.outdoor;}
 begin(o,p){this.rt.world.clearEnemies();this.handler(o).begin(o,p);}
 tick(o,p,dt){return this.handler(o).tick(o,p,dt);}
 interact(o,p){return this.villa.interact(o,p)||this.outdoor.interact(o,p);}
 finish(o,p){this.handler(o).finish(o,p);}
 destination(o,p){return {...(o.id.startsWith('c304')?{at:o.at,label:o.text}:this.outdoor.destination(o,p)),area:o.area||'outside'};}
 hint(o,p){return this.handler(o).hint(o,p);}
}
