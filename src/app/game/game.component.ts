import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { Game, CANVAS, ScaleManager, Physics, Point, Sprite } from 'phaser-ce';

type BlockType =
    'arrow'
  | 'leftHook'
  | 'leftZag'
  | 'line'
  | 'rightHook'
  | 'rightZag'
  | 'square';


@Component({
  selector: 'dp-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input('width') canvasWidth: number = 100;
  @Input('height') canvasHeight: number = 100;
  @ViewChild('gameCanvas') canvasRef: ElementRef;

  private game: Game;
  private availableBlockTypes: BlockType[] = [
    'arrow',
    'leftHook',
    'leftZag',
    'line',
    'rightHook',
    'rightZag',
    'square'
  ];
  private currentSprite?: Sprite;

  // Keyboard down listener
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.currentSprite) { return }
    switch (event.code) {
      case 'ArrowLeft':
        this.currentSprite.body.velocity.x = -100;
        break;
      case 'ArrowRight':
        this.currentSprite.body.velocity.x = 100;
        break;
      case 'ArrowDown':
        this.currentSprite.body.velocity.y = 1000;
        break;
      case 'ArrowUp':
        this.currentSprite.body.rotation += 90 * Math.PI / 180;
        break;
      default: break;
    }
  }

  // Keyboard up listener
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (!this.currentSprite) { return }
    this.currentSprite.body.velocity.x = 0;
    this.currentSprite.body.velocity.y = 100;
  }

  constructor() { }

  ngOnInit() {
    this.game = new Game({
      antialias: true,
      enableDebug: true,
      width: this.canvasWidth,
      height: this.canvasHeight,
      resolution: 1,
      scaleMode: ScaleManager.NO_SCALE,
      transparent: false,
      renderer: CANVAS,
      state: {
        preload: () => {
          this.game.load.baseURL = 'http://localhost:4200';
          this.game.load.crossOrigin = 'anonymous';
          this.game.load.image('arrow', `/assets/blocks/arrow.png`);
          this.game.load.image('leftHook', `/assets/blocks/leftHook.png`);
          this.game.load.image('leftZag', `/assets/blocks/leftZag.png`);
          this.game.load.image('line', `/assets/blocks/line.png`);
          this.game.load.image('rightHook', `/assets/blocks/rightHook.png`);
          this.game.load.image('rightZag', `/assets/blocks/rightZag.png`);
          this.game.load.image('square', `/assets/blocks/square.png`);
          // this.game.load.onFileComplete.add((progress, cacheKey, success, totalLoaded, totalFiles) => {
          //   const image = this.game.add.image(this.canvasWidth / 2, 0, cacheKey);
          //   image.scale.set(0.5);
          // });
        },

        create: () => {
          this.game.physics.startSystem(Physics.ARCADE);
          this.game.stage.backgroundColor = '#cecece';
        },

        update: () => {
          const sprite = this.currentSprite;
          if (sprite) {
            if (sprite.body.blocked.up && this.game.stage.children.length > 3) {
              console.log('touching top');
              return;
            }
            if (sprite.body.blocked.down) {
              this.generateNewBlock();
            } else {
              for (let s of this.game.stage.children) {
                if (s == sprite) { return }
                if (this.game.physics.arcade.collide(sprite, s)) {
                  this.generateNewBlock();
                  break;
                }
              }
            }
            // if (maySpawn) {
            //   this.generateNewBlock();
            //   return;
            // }
          } else {
            this.generateNewBlock();
          }
        },

        render: () => {
          // this.game.debug.bodyInfo(this.currentSprite, 16, 24);
        },

        shutdown: () => {}
      }

    });
  }

  private generateNewBlock() {

    // stop the previous
    if (this.currentSprite) {
      this.currentSprite.body.velocity.x = 0;
      this.currentSprite.body.velocity.y = 0;
      this.currentSprite.body.immovable = true;
    }

    const newSprite = this.spawnBlock();

    newSprite.body.velocity.x = 0;
    newSprite.body.velocity.y = 100;
    this.game.stage.addChild(newSprite);
    this.currentSprite = newSprite;
  }


  private spawnBlock(): Sprite {

    const randomIndex = Math.floor(Math.random() * this.availableBlockTypes.length);
    const cacheKey = this.availableBlockTypes[randomIndex];
    const sprite = this.game.add.sprite(this.canvasWidth / 2, 100, cacheKey);

    this.game.physics.enable(sprite, Physics.ARCADE);

    sprite.anchor.set(0.5);
    sprite.scale.set(0.5);
    sprite.body.allowRotation = true;

    sprite.body.collideWorldBounds = true;
    sprite.body.bounce.setTo(0, 0);

    return sprite;
  }

}
