export class IsoProjection {
  constructor(tileWidth, tileHeight, originX = 0, originY = 0) {
    this.tileWidth = tileWidth; this.tileHeight = tileHeight;
    this.originX = originX; this.originY = originY;
  }
  toScreen(x, y) {
    return { x: this.originX + (x - y) * this.tileWidth / 2, y: this.originY + (x + y) * this.tileHeight / 2 };
  }
  toWorld(screenX, screenY) {
    const sx = (screenX - this.originX) / (this.tileWidth / 2);
    const sy = (screenY - this.originY) / (this.tileHeight / 2);
    return { x: (sx + sy) / 2, y: (sy - sx) / 2 };
  }
  depth(x, y) { return x + y; }
}
