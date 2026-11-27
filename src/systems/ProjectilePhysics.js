/** Colisão entre o caminho varrido por um projétil e a silhueta visível da criatura.
 * Independente de Phaser para permitir testes em todas as eras. */
export function getAimPoint(creature){
  return {x:creature.x,y:creature.y-(creature.isBoss?60:27)};
}
export function advanceShot(projectile,milliseconds){
  const dt=Math.max(0,milliseconds)/1000;
  const dx=projectile.vx*dt,dy=projectile.vy*dt;
  return {x:projectile.x+dx,y:projectile.y+dy,distance:Math.hypot(dx,dy)};
}
export function pointSegmentDistanceSquared(px,py,x1,y1,x2,y2){
  const dx=x2-x1,dy=y2-y1,denom=dx*dx+dy*dy;
  const t=denom===0?0:Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/denom));
  return (px-x1-t*dx)**2+(py-y1-t*dy)**2;
}
function ccw(ax,ay,bx,by,cx,cy){return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);}
function segmentsCross(a,b,c,d){
  const s1=ccw(a.x,a.y,b.x,b.y,c.x,c.y),s2=ccw(a.x,a.y,b.x,b.y,d.x,d.y);
  const s3=ccw(c.x,c.y,d.x,d.y,a.x,a.y),s4=ccw(c.x,c.y,d.x,d.y,b.x,b.y);
  const epsilon=1e-9;
  if(Math.abs(s1)<epsilon&&Math.abs(s2)<epsilon&&Math.abs(s3)<epsilon&&Math.abs(s4)<epsilon){
    return !(Math.max(a.x,b.x)<Math.min(c.x,d.x)-epsilon ||
      Math.max(c.x,d.x)<Math.min(a.x,b.x)-epsilon ||
      Math.max(a.y,b.y)<Math.min(c.y,d.y)-epsilon ||
      Math.max(c.y,d.y)<Math.min(a.y,b.y)-epsilon);
  }
  return s1*s2<=epsilon&&s3*s4<=epsilon;
}
export function segmentDistanceSquared(a,b,c,d){
  if(segmentsCross(a,b,c,d))return 0;
  return Math.min(
    pointSegmentDistanceSquared(a.x,a.y,c.x,c.y,d.x,d.y),
    pointSegmentDistanceSquared(b.x,b.y,c.x,c.y,d.x,d.y),
    pointSegmentDistanceSquared(c.x,c.y,a.x,a.y,b.x,b.y),
    pointSegmentDistanceSquared(d.x,d.y,a.x,a.y,b.x,b.y)
  );
}
export function creatureBody(creature){
  // Pés = coordenadas do mundo. A silhueta ocupa uma altura acima deles.
  const high=creature.isBoss?105:48;
  const low=creature.isBoss?25:13;
  return {a:{x:creature.x,y:creature.y-low},b:{x:creature.x,y:creature.y-high},radius:creature.isBoss?25:14};
}
export function projectileHitsCreature(previous,current,shotRadius,creature){
  const body=creatureBody(creature);
  const r=shotRadius+body.radius;
  return segmentDistanceSquared(previous,current,body.a,body.b)<=r*r;
}
export function splashHitsCreature(projectile,creature,splashRadius){
  const body=creatureBody(creature);
  const r=splashRadius+body.radius;
  return pointSegmentDistanceSquared(projectile.x,projectile.y,body.a.x,body.a.y,body.b.x,body.b.y)<=r*r;
}
