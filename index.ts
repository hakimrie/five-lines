
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

  moveHorizontal(plyaer: Player, tile: Tile, dx: number): void;
  drop(tile: Tile, x: number, y: number): void;
}

class Falling implements FallingState {
  isFalling() { return true; }

  moveHorizontal(player: Player, tile: Tile, dx: number): void { }
  
  drop(tile: Tile, x: number, y: number): void {
    map[y + 1][x] = tile;
    map[y][x] = new Air();
  }
}

class Resting implements FallingState {
  isFalling() { return false; }

  moveHorizontal(player: Player, tile: Tile, dx: number): void {
    player.pushHorizontal(tile, dx);
  }
  drop(tile: Tile, x: number, y: number): void {
    // Resting tiles do not fall.
  }
}

class FallStrategy {
  constructor(private falling: FallingState) {}

  update(tile: Tile, x: number, y: number): void {
    this.falling = map[y + 1][x].getBlockOnTopState();
    this.falling.drop(tile, y, x);
  }

  private drop(tile: Tile, y: number, x: number) {
    if (this.falling.isFalling()) {
      map[y + 1][x] = tile;
      map[y][x] = new Air();
    }
  }

  moveHorizontal(tile: Tile, dx: number) {
    this.falling.moveHorizontal(player, tile, dx);
  }
}

class KeyConfiguration {
  constructor(private color: string, private _1: boolean, private removeStrategy: RemoveStrategy) {}

  private getColor () { return this.color }
  setColor(g: CanvasRenderingContext2D) { g.fillStyle = this.color; }

  is1() {return this._1}
  removeLock() {
    remove(this.removeStrategy);
  }
}

class Player {
  private x = 1;
  private y = 1;

  private getX() { return this.x; }
  getY() { return this.y; }
  setX(x: number) { this.x = x; }
  setY(y: number) { this.y = y; }

  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {
    map[this.y][this.x + dx].moveHorizontal(this, dx);
  }

  moveVertical(dy: number) {
    map[this.y + dy][this.x].moveVertical(this, dy);
  }

  move(dx: number, dy: number) {
    this.moveToTile(this.x + dx, this.y + dy);
  }

  pushHorizontal(tile: Tile, dx: number) {
    if (map[this.y][this.x + dx + dx].isAir() && !map[this.y + 1][this.x + dx].isAir()) {
      map[this.y][this.x + dx + dx] = tile;
      moveToTile(this, this.x + dx, this.y);
    }
  }

  moveToTile(newx: number, newy: number) {
    map[this.y][this.x] = new Air();
    map[newy][newx] = new PlayerTile();
    this.x = newx;
    this.y = newy;
  }
}

interface Tile {
  isAir(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;

  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(player: Player, dx: number): void;
  moveVertical(player: Player, dy: number): void;
  canFall(): boolean;
  getBlockOnTopState(): FallingState;

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
  moveHorizontal(player: Player, dx: number) {
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    player.move(0, dy);
  }
  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {
    // Air tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Falling();
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
  moveHorizontal(player: Player, dx: number) {
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    player.move(0, dy);
  }
  canFall(): boolean {
    return false;
  }
  update(x: number, y: number): void {
    // Flux tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
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
  moveHorizontal(plyaer: Player, dx: number) {
  }
  moveVertical(plyaer: Player, dy: number) {}
  canFall(): boolean {
    return false;
  }
  update(x: number, y: number): void {
    // Unbreakable tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
  }
}
class PlayerTile implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ff0000";
  }
  moveHorizontal(plyaer: Player, dx: number) {}
  moveVertical(plyaer: Player, dy: number) {}
  canFall(): boolean {
    return false;
  }
  update(x: number, y: number): void {
    // Player tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
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
  moveHorizontal(player: Player, dx: number) {
    this.fallStrategy.moveHorizontal(this, dx);
  }
  moveVertical(player: Player, dy: number) {
  }
  canFall(): boolean {
    return true;
  }
  update(x: number, y: number): void {
    this.fallStrategy.update(this, x, y);
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
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
  moveHorizontal(plyaer: Player, dx: number) {
    this.fallStrategy.moveHorizontal(this, dx);
  }
  moveVertical(plyaer: Player, dy: number) {
  }
  canFall(): boolean {
    return true;
  }

  update(x: number, y: number): void {
    this.fallStrategy.update(this, x, y);
  }

  getBlockOnTopState(): FallingState {
    return new Resting();
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
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.keyConf.removeLock()
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    this.keyConf.removeLock()
    player.move(0, dy);
  }
  canFall(): boolean {
    return false;
  }
  update(x: number, y: number): void {
    // Key1 tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
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
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(player: Player, dx: number) {
    this.keyConf.removeLock();
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
  }
  canFall(): boolean {
    return false;
  }
  update(x: number, y: number): void {
    // Lock1 tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
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
  moveHorizontal(player: Player, dx: number) {
    remove(new RemoveLock2());
    player.move(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    remove(new RemoveLock2());
    player.move(0, dy);
  }
  canFall(): boolean {
    return false;
  }
  update(x: number, y: number): void {
    // Key2 tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
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
  moveHorizontal(plyaer: Player, dx: number) {
  }
  moveVertical(plyaer: Player, dy: number) {
  }
  canFall(): boolean {
    return false;
  }
  update(x: number, y: number): void {
    // Lock2 tiles do not need to be updated.
  }
  getBlockOnTopState(): FallingState {
    return new Resting();
  }
}

interface Input {
  handle(player: Player): void;
}

class Right implements Input {
  handle(player: Player) {
    player.moveHorizontal(1);
  }
}
class Left implements Input {
  handle(player: Player) {
    player.moveHorizontal(-1);
  }
}
class Up implements Input {
  handle(player: Player) {
    player.moveVertical(-1);
  }
}
class Down implements Input {
  handle(player: Player) {
    player.moveVertical(1);
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

let player: Player = new Player();
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
const YELLOW_KEY = new KeyConfiguration("#00ff00", true, new RemoveLock1());
let map: Tile[][] = rawMap.map(row => row.map(tile => {
  switch (tile) {
    case RawTile.AIR: return new Air();
    case RawTile.FLUX: return new Flux();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.PLAYER: return new PlayerTile();
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

function moveToTile(player: Player, newx: number, newy: number) {
  player.moveToTile(newx, newy);
}

function moveHorizontal(dx: number) {
  player.moveHorizontal(dx);
  // map[player.getY()][player.getX() + dx].moveHorizontal(player, dx);
}

function moveVertical(dy: number) {
  player.moveVertical(dy);
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
  input.handle(player);
}

function draw() {
  let g = createGraphics();
  drawMap(g);
  player.draw(g);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
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

