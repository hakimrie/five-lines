
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

interface FallingState {
  isFalling(): boolean;

  moveHorizontal(tile: Tile, dx: number): void;
}

class Falling implements FallingState {
  isFalling() { return true; }

  moveHorizontal(tile: Tile, dx: number): void { }
}

class Resting implements FallingState {
  isFalling() { return false; }

  moveHorizontal(tile: Tile, dx: number): void {
    if (map[playery][playerx + dx + dx].isAir()
        && !map[playery + 1][playerx + dx].isAir()) {
        map[playery][playerx + dx + dx] = tile;
        moveToTile(playerx + dx, playery);
      }
  }
}

class FallStrategy {
  constructor(private falling: FallingState) {}

  update(tile: Tile, x: number, y: number): void {
    this.falling = map[y + 1][x].isAir() ? new Falling() : new Resting();
    this.drop(tile, y, x);
  }

  private drop(tile: Tile, y: number, x: number) {
    if (this.falling.isFalling()) {
      map[y + 1][x] = tile;
      map[y][x] = new Air();
    }
  }

  getFalling() {
    return this.falling;
  }
}

class KeyConfiguration {
  constructor(private color: string, private _1: boolean, private removeStrategy: RemoveStrategy) {}

  getColor () { return this.color }
  is1() {return this._1}
  getRemoveStrategy() {
    return this.removeStrategy
  }
}

interface Tile {
  isAir(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;

  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(dx: number): void;
  moveVertical(dy: number): void;
  canFall(): boolean;

  drop(): void;
  rest(): void;

  update(x: number, y: number): void;
}

class Air implements Tile {
  isAir() { return true; }
  isLock1() { return false; }
  isLock2() { return false; }

  color(g: CanvasRenderingContext2D) {}

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    // Air tiles do not need to be drawn, they are transparent.
  }
  moveHorizontal(dx: number) {
    moveToTile(playerx + dx, playery);
  }
  moveVertical(dy: number) {
    moveToTile(playerx, playery + dy);
  }
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }

  update(x: number, y: number): void {
    // Air tiles do not need to be updated.
  }
}

class Flux implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    moveToTile(playerx + dx, playery);
  }
  moveVertical(dy: number) {
    moveToTile(playerx, playery + dy);
  }
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }
  update(x: number, y: number): void {
    // Flux tiles do not need to be updated.
  }
}
class Unbreakable implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
  }
  moveVertical(dy: number) {}
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }
  update(x: number, y: number): void {
    // Unbreakable tiles do not need to be updated.
  }
}
class Player implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ff0000";
  }
  moveHorizontal(dx: number) {}
  moveVertical(dy: number) {}
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }
  update(x: number, y: number): void {
    // Player tiles do not need to be updated.
  }
}
class Stone implements Tile {
  private fallStrategy: FallStrategy;

  constructor(private falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling)
  }

  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  color(g: CanvasRenderingContext2D) {
    g.fillStyle = "#0000cc";
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    this.fallStrategy.getFalling().moveHorizontal(this, dx);
  }
  moveVertical(dy: number) {
  }
  canFall(): boolean {
    return true;
  }
  drop(): void { 
    this.falling = new Falling();
  }
  rest(): void { 
    this.falling = new Resting();
  }
  update(x: number, y: number): void {
    this.fallStrategy.update(this, x, y);
  }
}
class Box implements Tile {
  private fallStrategy: FallStrategy;

  constructor(private falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling)
  }

  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    if (map[playery][playerx + dx + dx].isAir()
      && !map[playery + 1][playerx + dx].isAir()) {
      map[playery][playerx + dx + dx] = this;
      moveToTile(playerx + dx, playery);
    }
  }
  moveVertical(dy: number) {
  }
  canFall(): boolean {
    return true;
  }
  drop(): void { 
    this.falling = new Falling();
  }
  rest(): void { 
    this.falling = new Resting();
  }

  update(x: number, y: number): void {
    this.fallStrategy.update(this, x, y);
  }
}
class Key implements Tile {
  constructor(private keyConf: KeyConfiguration) {
    // Key1 tiles do not need to be initialized with a falling state.
  }
  isAir() { return false; }
  isFalling() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = this.keyConf.getColor();
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    remove(this.keyConf.getRemoveStrategy())
    moveToTile(playerx + dx, playery);
  }
  moveVertical(dy: number) {
    remove(this.keyConf.getRemoveStrategy())
    moveToTile(playerx, playery + dy);
  }
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }
  update(x: number, y: number): void {
    // Key1 tiles do not need to be updated.
  }
}
class LockX implements Tile {
  constructor(private keyConf: KeyConfiguration) {
  }

  isAir() { return false; }
  isFalling() { return false; }
  isLock1() { return this.keyConf.is1(); }
  isLock2() { return !this.keyConf.is1(); }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = this.keyConf.getColor();
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    remove(new RemoveLock2());
    moveToTile(playerx + dx, playery);
  }
  moveVertical(dy: number) {
  }
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }
  update(x: number, y: number): void {
    // Lock1 tiles do not need to be updated.
  }
}
class Key2 implements Tile {
  isAir() { return false; }
  isFalling() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#00ccff";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
    remove(new RemoveLock2());
    moveToTile(playerx + dx, playery);
  }
  moveVertical(dy: number) {
    remove(new RemoveLock2());
    moveToTile(playerx, playery + dy);
  }
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }
  update(x: number, y: number): void {
    // Key2 tiles do not need to be updated.
  }
}
class Lock2 implements Tile {
  isAir() { return false; }
  isFalling() { return false; }
  isLock1() { return false; }
  isLock2() { return true; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ffcc00";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(dx: number) {
  }
  moveVertical(dy: number) {
  }
  canFall(): boolean {
    return false;
  }
  drop(): void { }
  rest(): void { }
  update(x: number, y: number): void {
    // Lock2 tiles do not need to be updated.
  }
}

interface Input {
  handle(): void;
}

class Right implements Input {
  handle() {
    moveHorizontal(1);
  }
}
class Left implements Input {
  handle() {
    moveHorizontal(-1);
  }
}
class Up implements Input {
  handle() {
    moveVertical(-1);
  }
}
class Down implements Input {
  handle() {
    moveVertical(1);
  }
} 

class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock1();
  }
}
class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock2();
  }
}

let playerx = 1;
let playery = 1;
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][] = rawMap.map(row => row.map(tile => {
  const YELLOW_KEY = new KeyConfiguration("#00ff00", true, new RemoveLock1());
  switch (tile) {
    case RawTile.AIR: return new Air();
    case RawTile.FLUX: return new Flux();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.PLAYER: return new Player();
    case RawTile.STONE: return new Stone(new Resting());
    case RawTile.FALLING_STONE: return new Stone(new Falling());
    case RawTile.BOX: return new Box(new Resting());
    case RawTile.FALLING_BOX: return new Box(new Falling());
    case RawTile.KEY1: return new Key(YELLOW_KEY);
    case RawTile.LOCK1: return new LockX(YELLOW_KEY);
    case RawTile.KEY2: return new Key2();
    case RawTile.LOCK2: return new Lock2();
  }
}));

let inputs: Input[] = [];

interface RemoveStrategy {
  check(tile: Tile): boolean;
}

function check(tile: Tile) {
  return tile.isLock1();
}

function remove(shouldRemove: RemoveStrategy) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (shouldRemove.check(map[y][x])) {
        map[y][x] = new Air();
      }
    }
  }
}

function moveToTile(newx: number, newy: number) {
  map[playery][playerx] = new Air();
  map[newy][newx] = new Player();
  playerx = newx;
  playery = newy;
}

function moveHorizontal(dx: number) {
  map[playery][playerx + dx].moveHorizontal(dx);
}

function moveVertical(dy: number) {
  map[playery + dy][playerx].moveVertical(dy);
}

function update() {
  handleInputs();
  updateMap();
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].update(x, y);
    }
  }
}

function handleInputs() {
  while (inputs.length > 0) {
    let input = inputs.pop();
    handleInput(input);
  }
}

function handleInput(input: Input) {
  input.handle();
}

function draw() {
  let g = createGraphics();
  drawMap(g);
  drawPlayer(g);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
}

function drawPlayer(g: CanvasRenderingContext2D) {
  g.fillStyle = "#ff0000";
  g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawMap(g: CanvasRenderingContext2D) {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        map[y][x].draw(g, x, y);
      }
    }
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  gameLoop();
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});

