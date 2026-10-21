shader_type sky;
float hash(vec2 p){p.x=mod(p.x,20.);return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ellipse(vec2 p,vec2 r){return 1.-smoothstep(.98,1.02,length(p/r));}
vec2 cloud(vec2 p){
 vec2 id=floor(p);vec2 f=fract(p);float total=0.;float underside=0.;
 for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){
  vec2 cell=id+vec2(float(x),float(y));float h=hash(cell);
  vec2 center=vec2(float(x),float(y))+vec2(.25+hash(cell+7.)*.5,.25+hash(cell+19.)*.5);
  vec2 d=f-center;d.x/=(.8+h*.6);
  float c=max(ellipse(d+vec2(.24,.0),vec2(.26,.14)),ellipse(d-vec2(.0,.09),vec2(.25,.27)));
  c=max(c,ellipse(d-vec2(.25,.025),vec2(.28,.20)));
  c=max(c,ellipse(d-vec2(.41,-.025),vec2(.19,.12)));
  c*=step(.45,h);
  total=max(total,c);underside=max(underside,c*(1.-smoothstep(-.09,-.025,d.y)));
 }}return vec2(total,underside);
}
void sky(){
 vec3 blue=mix(vec3(.68,.87,.96),vec3(.08,.46,.76),smoothstep(-.03,.55,EYEDIR.y));
 vec2 uv=vec2((atan(EYEDIR.x,EYEDIR.z)/TAU+.5)*20.0,EYEDIR.y*5.6);
 vec2 c=cloud(uv);float height=smoothstep(.04,.10,EYEDIR.y)*(1.-smoothstep(.48,.63,EYEDIR.y));
 COLOR=mix(blue,mix(vec3(1.,.98,.92),vec3(.78,.87,.96),c.y),c.x*height);
}
