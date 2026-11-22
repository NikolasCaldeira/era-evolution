/**
 * Navegação em coordenadas de tela para um mundo desenhado em projeção isométrica.
 * A mesma regra de colisão é usada na procura de rota e no deslocamento real.
 * Não depende do Phaser, facilitando testes automatizados.
 */
export class NavigationGrid {
  constructor({ projection, columns, rows, obstacles, cellSize = 24, radius = 10, margin = 1.55 }) {
    this.projection = projection;
    this.columns = columns;
    this.rows = rows;
    this.obstacles = obstacles;
    this.cellSize = cellSize;
    this.radius = radius;
    this.margin = margin;
    this.width = Math.ceil((columns + rows) * projection.tileWidth / 2 / cellSize) + 2;
    this.height = Math.ceil((columns + rows) * projection.tileHeight / 2 / cellSize + projection.originY / cellSize) + 2;
    this.count = this.width * this.height;
    this.edgeCache = new Map();

    // Índice espacial para não verificar todas as árvores/rochas a cada movimento.
    this.bucketSize = 96;
    this.buckets = new Map();
    for (const obstacle of obstacles) {
      const minX = Math.floor((obstacle.x - obstacle.rx - radius) / this.bucketSize);
      const maxX = Math.floor((obstacle.x + obstacle.rx + radius) / this.bucketSize);
      const minY = Math.floor((obstacle.y - obstacle.ry - radius) / this.bucketSize);
      const maxY = Math.floor((obstacle.y + obstacle.ry + radius) / this.bucketSize);
      for (let by = minY; by <= maxY; by++) {
        for (let bx = minX; bx <= maxX; bx++) {
          const key = `${bx},${by}`;
          if (!this.buckets.has(key)) this.buckets.set(key, []);
          this.buckets.get(key).push(obstacle);
        }
      }
    }
    this.walkable = new Uint8Array(this.count);
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.walkable[row * this.width + col] = Number(this.isOpen(col * cellSize, row * cellSize));
      }
    }
  }

  isOpen(x, y) {
    const tile = this.projection.toWorld(x, y);
    if (tile.x < this.margin || tile.y < this.margin ||
        tile.x > this.columns - this.margin || tile.y > this.rows - this.margin) return false;
    const key = `${Math.floor(x / this.bucketSize)},${Math.floor(y / this.bucketSize)}`;
    const nearby = this.buckets.get(key) || [];
    return !nearby.some(o => Math.abs(x - o.x) < o.rx + this.radius && Math.abs(y - o.y) < o.ry + this.radius);
  }

  lineClear(x1, y1, x2, y2) {
    const distance = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(distance / 10));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (!this.isOpen(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return false;
    }
    return true;
  }

  point(index) {
    const col = index % this.width;
    const row = Math.floor(index / this.width);
    return { x: col * this.cellSize, y: row * this.cellSize };
  }

  closestIndex(x, y, maxRing = 7, requireVisible = false) {
    const col = Math.round(x / this.cellSize);
    const row = Math.round(y / this.cellSize);
    let best = -1, bestDist = Infinity;
    for (let ring = 0; ring <= maxRing; ring++) {
      for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
        const c = col + dx, r = row + dy;
        if (c < 0 || c >= this.width || r < 0 || r >= this.height) continue;
        const index = r * this.width + c;
        if (!this.walkable[index]) continue;
        const p = this.point(index), dist = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (dist >= bestDist) continue;
        if (requireVisible && !this.lineClear(x, y, p.x, p.y)) continue;
        best = index; bestDist = dist;
      }
      // Não selecionar células muito distantes se uma adjacente já for válida.
      if (best !== -1) return best;
    }
    return best;
  }

  /** Uma aresta só é válida se o segmento real for livre (não basta ambas as células). */
  edgeClear(from,to) {
    const a=Math.min(from,to),b=Math.max(from,to);
    const key=a*this.count+b;
    if(this.edgeCache.has(key))return this.edgeCache.get(key);
    const p=this.point(from),q=this.point(to);
    const clear=this.lineClear(p.x,p.y,q.x,q.y);
    this.edgeCache.set(key,clear);
    return clear;
  }

  /** Saída acessível quando o movimento fica preso numa concavidade ou esquina. */
  escapeWaypoint(x,y,targetX,targetY,side=1) {
    let best=null,bestScore=Infinity;
    const direction=Math.atan2(targetY-y,targetX-x);
    for(const radius of [28,48,72,96])for(let i=0;i<16;i++){
      const angle=direction+side*(i+1)*Math.PI/8;
      const point={x:x+Math.cos(angle)*radius,y:y+Math.sin(angle)*radius};
      if(!this.isOpen(point.x,point.y)||!this.lineClear(x,y,point.x,point.y))continue;
      const progress=Math.hypot(point.x-targetX,point.y-targetY);
      const score=progress+radius*.2+(i%16)*.8;
      if(score<bestScore){bestScore=score;best=point;}
    }
    return best;
  }

  nearestOpenPoint(x, y) {
    const index = this.closestIndex(x, y, 12);
    return index === -1 ? null : this.point(index);
  }

  findPath(startX, startY, endX, endY) {
    if (!this.isOpen(startX, startY)) return [];
    if (this.lineClear(startX, startY, endX, endY)) return [{ x: endX, y: endY }];
    const start = this.closestIndex(startX, startY, 9, true);
    const goal = this.closestIndex(endX, endY, 12, this.isOpen(endX, endY));
    if (start < 0 || goal < 0) return [];

    const cost = new Float64Array(this.count); cost.fill(Infinity);
    const previous = new Int32Array(this.count); previous.fill(-1);
    const closed = new Uint8Array(this.count);
    const heap = new MinHeap();
    const goalPoint = this.point(goal);
    const heuristic = index => {
      const p = this.point(index);
      return Math.hypot(p.x - goalPoint.x, p.y - goalPoint.y);
    };
    cost[start] = 0;
    heap.push({ index: start, priority: heuristic(start) });
    let arrived = false;
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [1, -1], [-1, 1], [1, 1]
    ];

    while (heap.length) {
      const { index } = heap.pop();
      if (closed[index]) continue;
      if (index === goal) { arrived = true; break; }
      closed[index] = 1;
      const row = Math.floor(index / this.width), col = index % this.width;
      for (const [dx, dy] of directions) {
        const nextCol = col + dx, nextRow = row + dy;
        if (nextCol < 0 || nextCol >= this.width || nextRow < 0 || nextRow >= this.height) continue;
        const next = nextRow * this.width + nextCol;
        if (!this.walkable[next] || closed[next] || !this.edgeClear(index,next)) continue;
        // Impede passar por diagonal entre duas células bloqueadas.
        if (dx !== 0 && dy !== 0 &&
          (!this.walkable[row * this.width + nextCol] || !this.walkable[nextRow * this.width + col])) continue;
        const step = (dx && dy ? Math.SQRT2 : 1) * this.cellSize;
        const newCost = cost[index] + step;
        if (newCost >= cost[next]) continue;
        cost[next] = newCost;
        previous[next] = index;
        heap.push({ index: next, priority: newCost + heuristic(next) });
      }
    }
    if (!arrived) return [];

    const raw = [];
    let next = goal;
    while (next !== -1) {
      raw.push(this.point(next));
      if (next === start) break;
      next = previous[next];
    }
    raw.reverse();
    const end = this.isOpen(endX, endY) ? { x: endX, y: endY } : goalPoint;
    raw.push(end);

    // Path smoothing: usa o ponto mais distante acessível sem atravessar rochas.
    const path = [];
    let cursor = 0;
    let anchor = { x: startX, y: startY };
    while (cursor < raw.length) {
      let furthest = cursor;
      for (let i = cursor; i < raw.length; i++) {
        if (this.lineClear(anchor.x, anchor.y, raw[i].x, raw[i].y)) furthest = i;
        // Depois do primeiro ponto obstruído, não há vantagem em testar muitos outros.
        else if (i > furthest + 8) break;
      }
      if (furthest === cursor && !this.lineClear(anchor.x, anchor.y, raw[furthest].x, raw[furthest].y)) return [];
      anchor = raw[furthest];
      path.push(anchor);
      cursor = furthest + 1;
    }
    return path;
  }
}

/** Priority queue mínima para A*. */
class MinHeap {
  constructor() { this.items = []; }
  get length() { return this.items.length; }
  push(value) {
    const arr = this.items; arr.push(value);
    let i = arr.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (arr[parent].priority <= value.priority) break;
      arr[i] = arr[parent]; i = parent;
    }
    arr[i] = value;
  }
  pop() {
    const arr = this.items;
    const result = arr[0]; const last = arr.pop();
    if (arr.length) {
      let i = 0;
      while (true) {
        let child = i * 2 + 1;
        if (child >= arr.length) break;
        if (child + 1 < arr.length && arr[child + 1].priority < arr[child].priority) child++;
        if (last.priority <= arr[child].priority) break;
        arr[i] = arr[child]; i = child;
      }
      arr[i] = last;
    }
    return result;
  }
}
