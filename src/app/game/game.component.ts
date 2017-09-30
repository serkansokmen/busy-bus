import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { Game, CANVAS, ScaleManager, Physics, Point, Sprite } from 'phaser-ce';

type BlockType =
    'arrow'
  | 'leftHook'
  | 'leftZag'
  | 'line1'
  | 'line2'
  | 'rightHook'
  | 'rightZag'
  | 'square';

@Component({
  selector: 'bb-game',
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
    'line1',
    'line2',
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
        this.currentSprite.body.rotation -= 90 * Math.PI / 180;
        break;
      case 'Space':
        this.generateNewBlock();
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
      antialias: false,
      enableDebug: false,
      width: this.canvasWidth,
      height: this.canvasHeight,
      resolution: 1,
      scaleMode: ScaleManager.NO_SCALE,
      transparent: true,
      renderer: CANVAS,
      state: {
        preload: () => {
          this.game.load.baseURL = 'http://localhost:4200';
          this.game.load.crossOrigin = 'anonymous';
          this.game.load.image('arrow', `/assets/img/arrow.svg`);
          this.game.load.image('leftHook', `/assets/img/leftHook.svg`);
          this.game.load.image('leftZag', `/assets/img/leftZag.svg`);
          this.game.load.image('line1', `/assets/img/line1.svg`);
          this.game.load.image('line2', `/assets/img/line2.svg`);
          this.game.load.image('rightHook', `/assets/img/rightHook.svg`);
          this.game.load.image('rightZag', `/assets/img/rightZag.svg`);
          this.game.load.image('square', `/assets/img/square.svg`);
        },

        create: () => {
          this.game.physics.startSystem(Physics.ARCADE);
          // this.game.physics.p2.restitution = 0.0;
          // this.game.physics.arcade.gravity.y = 100;
        },

        update: () => {
          const sprite = this.currentSprite;
          if (sprite) {
            // if (sprite.body.blocked.up && this.game.stage.children.length > 3) {
            //   console.log('touching top');
            //   return;
            // }
            // if (sprite.body.blocked.down) {
            //   this.generateNewBlock();
            // } else {
            for (let s of this.game.stage.children) {
              if (s == sprite) { return }
              if (this.game.physics.arcade.collide(sprite, s)) {
                this.generateNewBlock();
                break;
              }
            }
            // }
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
    const x = this.canvasWidth / 2;
    const y = 20;
    const newSprite = this.spawnBlock(x, y);

    this.game.stage.addChild(newSprite);
    this.currentSprite = newSprite;
  }


  private spawnBlock(x: number, y: number): Sprite {

    const randomIndex = Math.floor(Math.random() * this.availableBlockTypes.length);
    const cacheKey = this.availableBlockTypes[randomIndex];
    const sprite = this.game.add.sprite(x, y, cacheKey);
    sprite.scale.set(0.5);

    this.game.physics.arcade.enable(sprite);

    // sprite.anchor.set(0.5);
    sprite.body.allowRotation = true;
    // sprite.body.mass = 1;
    sprite.body.angularDamping = 1.0;
    sprite.body.fixedRotation = false;
    // sprite.body.damping = 1.0;
    // sprite.body.onBeginContact.add(this.blockHit, this);
    // sprite.body.scale = 0.5;
    sprite.body.collideWorldBounds = true;

    return sprite;
  }

  blockHit(body, bodyB, shapeA, shapeB, equation) {
    //  The block hit something.
    //
    //  This callback is sent 5 arguments:
    //
    //  The Phaser.Physics.P2.Body it is in contact with. *This might be null* if the Body was created directly in the p2 world.
    //  The p2.Body this Body is in contact with.
    //  The Shape from this body that caused the contact.
    //  The Shape from the contact body.
    //  The Contact Equation data array.
    //
    //  The first argument may be null or not have a sprite property, such as when you hit the world bounds.
    if (body) {
      console.log('You last hit: ' + body.sprite.key);
    } else {
      console.log('You last hit: The wall :)');
    }

}

}
