import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, OnDestroy } from '@angular/core';
import { Container, autoDetectRenderer, Texture, Rectangle, Sprite, Point } from 'pixi.js';

type BlockType =
    'arrow'
  | 'leftHook'
  | 'leftZag'
  | 'line'
  | 'rightHook'
  | 'rightZag'
  | 'square';


class Block {
  position: Point;
  velocity: Point;
  sprite: Sprite;

  constructor(type: BlockType, position: Point) {
    this.position = position;
    this.velocity = new Point();

    const texture = Texture.fromImage(`/assets/blocks/${type}.png`);
    this.sprite = new Sprite(texture);

    const scale = 0.5;
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.scale.x = scale;
    this.sprite.scale.y = scale;
    this.sprite.position = this.position;
    this.sprite.rotation = 0;
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.sprite.position = this.position;
  }
}

@Component({
  selector: 'dp-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  @Input('width') canvasWidth: number = 100;
  @Input('height') canvasHeight: number = 100;
  @ViewChild('gameCanvas') canvasRef: ElementRef;

  private stage: Container;
  private renderer: any;
  private availableBlockTypes: BlockType[] = [
    'arrow',
    'leftHook',
    'leftZag',
    'line',
    'rightHook',
    'rightZag',
    'square'
  ];
  private currentBlock?: Block;
  private currentBlockVelocity: Point;
  private blocks: Block[];
  private speed: number = 1;
  private groundSprite: Sprite;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.currentBlock) { return }
    switch (event.code) {
      case 'ArrowLeft':
        this.currentBlock.velocity.x = -5;
        break;
      case 'ArrowRight':
        this.currentBlock.velocity.x = 5;
        break;
      case 'ArrowDown':
        this.currentBlock.velocity.y = 10;
        break;
      case 'ArrowUp':
        this.currentBlock.sprite.rotation += 90 * Math.PI / 180;
        break;
      default: break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (!this.currentBlock) { return }
    this.currentBlock.velocity.x = 0;
    this.currentBlock.velocity.y = 1;
  }

  constructor() {
    this.blocks = [];
  }

  ngOnInit() {
    this.stage = new Container();
    this.renderer = autoDetectRenderer(this.canvasWidth, this.canvasHeight, {
      view: this.canvasRef.nativeElement
    });

    requestAnimationFrame(this.onUpdateGame.bind(this));

    this.groundSprite = new Sprite();
    this.groundSprite.width = this.canvasWidth;
    this.groundSprite.height = 2;
    this.groundSprite.y = this.canvasHeight + this.groundSprite.height;
    this.stage.addChild(this.groundSprite);
  }

  onUpdateGame() {
    this.renderer.render(this.stage);
    requestAnimationFrame(this.onUpdateGame.bind(this));

    if (this.currentBlock) {
      this.updateBlock(this.currentBlock);
    } else {
      this.spawnBlock();
    }
  }

  ngOnDestroy() {
  }

  private spawnBlock() {

    const randomIndex = Math.floor(Math.random() * this.availableBlockTypes.length);
    const type = this.availableBlockTypes[randomIndex];

    const block = new Block(type, new Point(this.canvasWidth / 2, 0));
    this.stage.addChild(block.sprite);
    block.velocity.y = 1;
    this.blocks.push(block);
    this.currentBlock = block;
  }

  private updateBlock(block?: Block) {
    if (!block) { return }
    if (!this.hitTest(block.sprite, this.groundSprite)) {
      block.update();
    } else {
      this.spawnBlock();
      // this.stage.removeChild(block.sprite);
      // this.blocks = this.blocks.filter((block) => block.sprite != block.sprite);
      // this.currentBlock = null;

    }
  }

  private hitTest(r1: Sprite, r2: Sprite) {
    return !(r2.x > (r1.x + r1.width) ||
             (r2.x + r2.width) < r1.x ||
             r2.y > (r1.y + r1.height) ||
             (r2.y + r2.height) < r1.y);
  }

}
