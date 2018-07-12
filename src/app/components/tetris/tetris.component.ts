import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  HostListener,
  HostBinding,
  ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { PieceType } from '../../services/piece.service';

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TetrisComponent implements OnInit, AfterViewInit, OnDestroy {

  private _columns = new BehaviorSubject<number>(1);
  @Input('columns')
  set columns(value) { this._columns.next(value); }
  get columns() { return this._columns.value; }

  private _rows = new BehaviorSubject<number>(3);
  @Input('rows')
  set rows(value) { this._rows.next(value); }
  get rows() { return this._rows.value; }

  private _brickSize = new BehaviorSubject<number>(10);
  @Input('brickSize')
  set brickSize(value) { this._brickSize.next(value); }
  get brickSize() { return this._brickSize.value; }

  @Input('images') images: any = {};

  @ViewChild('game') canvas: ElementRef;

  @Output('onGameFinished') gameFinishedWithScore = new EventEmitter<number>();
  @Output('onGameCancelled') gameCancelled = new EventEmitter<number>();

  @HostBinding('class.handset') hasDeviceHandsetClass: boolean;
  @Input()
  set isDeviceHandset(value) { this.hasDeviceHandsetClass = value }
  get isDeviceHandset() { return this.hasDeviceHandsetClass }

  private animationFrameRequestId?: any;
  public isRunning = false;
  public nextPieceType: PieceType;

  // probabilities
  public pieces: PieceType[] = [
    'lineF', 'lineF', 'lineF', 'lineF',
    'lineM', 'lineM', 'lineM', 'lineM',
    'leftHook', 'leftHook', 'leftHook', 'leftHook',
    'rightHook', 'rightHook', 'rightHook', 'rightHook',
    'square', 'square', 'square', 'square',
    'rightZag', 'rightZag', 'rightZag', 'rightZag',
    'leftZag', 'leftZag', 'leftZag', 'leftZag',
    'arrow', 'arrow', 'arrow', 'arrow',
  ];
  private context: CanvasRenderingContext2D;
  private dropCounter = 0;
  private dropInterval = 800;
  private lastTime = 0;
  private arena;
  private player = {
    pos: {
      x: 0, y: 0
    },
    matrix: null,
    score: 0
  };
  private backgroundImg: HTMLImageElement;

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.context.imageSmoothingEnabled = true;
    this.context.mozImageSmoothingEnabled = true;
    this.context.webkitImageSmoothingEnabled = true;
    this.context.mozImageSmoothingEnabled = true;
  }

  ngAfterViewInit() {
    this.clearCanvas();
    this.scaleCanvasForRetina(this.canvas.nativeElement, this.context, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.startNewGame();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameRequestId);
  }

  private clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  startNewGame() {
    this.arena = this.createMatrix(this._columns.value, this._rows.value);
    this.player.score = 0;
    this.dropInterval = 960;
    this.nextPieceType = this.randomPieceType();
    this.playerReset();
    this.isRunning = true;
    this.update();
  }

  private update(time = 0) {
    const deltaTime = time - this.lastTime;

    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.playerDrop();
    }

    this.lastTime = time;

    this.draw();
    this.cdRef.detectChanges();
    this.animationFrameRequestId = requestAnimationFrame(this.update.bind(this));
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'ArrowLeft') {
      this.playerMove(-1);
    } else if (event.code === 'ArrowRight') {
      this.playerMove(1);
    } else if (event.code === 'ArrowDown') {
      this.playerDrop();
    } else if (event.code === 'KeyQ') {
      this.playerRotate(-1);
    } else if (event.code === 'KeyW') {
      this.playerRotate(1);
    }
  }

  handleTap(event) {
    this.playerDrop();
  }

  handlePanEnd(event) {
    switch (event.additionalEvent) {

      case 'panright':
        this.playerMove(1);
        break;

      case 'panleft':
        this.playerMove(-1);
        break;

      case 'panup':
        this.playerRotate(-1);
        break;

      default: break;
    }
  }

  // handleSwipe(event) {
  //   if (event.direction === 4) {
  //     this.playerRotate(-1);
  //   } else if (event.direction === 2) {
  //     this.playerRotate(1);
  //   }
  // }

  // handleTap(event) {
  //   console.log(event);
  //   const isTapLeft = event.center.x < this.canvas.nativeElement.width / 2;
  //   if (isTapLeft) {
  //     this.playerMove(-1);
  //   } else {
  //     this.playerMove(1);
  //   }
  // }

  handleGameCancelled() {
    this.gameCancelled.emit(this.player.score);
  }

  private arenaSweep() {
    let rowCount = 1;
    outer: for (let y = this.arena.length -1; y > 0; --y) {
      for (let x = 0; x < this.arena[y].length; ++x) {
        if (this.arena[y][x] === 0) {
          continue outer;
        }
      }

      const row = this.arena.splice(y, 1)[0].fill(0);
      this.arena.unshift(row);
      ++y;

      this.player.score += rowCount * 10;
      rowCount *= 2;
    }
  }

  private collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
           (arena[y + o.y] &&
            arena[y + o.y][x + o.x]) !== 0) {
            return true;
        }
      }
    }
    return false;
  }

  private createMatrix(w: number, h: number) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  private createBlockPiece(type, part) {
    return [type, part];
  }

  private getBlock(type: PieceType) {
    if (type === 'lineF') {
      return [
        [0, ['lineF-p1', 0], 0, 0],
        [0, ['lineF-p2', 0], 0, 0],
        [0, ['lineF-p3', 0], 0, 0],
        [0, ['lineF-p4', 0], 0, 0],
      ];
    }
    else if (type === 'lineM') {
      return [
        [0, ['lineM-p1', 0], 0, 0],
        [0, ['lineM-p2', 0], 0, 0],
        [0, ['lineM-p3', 0], 0, 0],
        [0, ['lineM-p4', 0], 0, 0],
      ];
    } else if (type === 'rightHook') {
      return [
        [0, ['rightHook-p1', 0], 0],
        [0, ['rightHook-p2', 0], 0],
        [0, ['rightHook-p3', 0], ['rightHook-p4', 0]],
      ];
    } else if (type === 'leftHook') {
      return [
        [0,                  ['leftHook-p4', 0], 0],
        [0,                  ['leftHook-p3', 0], 0],
        [['leftHook-p1', 0], ['leftHook-p2', 0], 0],
      ];
    } else if (type === 'square') {
      return [
        [['square-p1', 0], ['square-p2', 0]],
        [['square-p3', 0], ['square-p4', 0]],
      ];
    } else if (type === 'leftZag') {
      return [
        [0,                 ['leftZag-p1', 0], 0],
        [['leftZag-p3', 0], ['leftZag-p2', 0], 0],
        [['leftZag-p4', 0], 0,                 0],
      ];
    } else if (type === 'rightZag') {
      return [
        [0, ['rightZag-p1', 0], 0],
        [0, ['rightZag-p2', 0], ['rightZag-p3', 0]],
        [0, 0,                  ['rightZag-p4', 0]],
      ];
    } else if (type === 'arrow') {
      return [
        [0,               ['arrow-p1', 0], 0],
        [['arrow-p2', 0], ['arrow-p3', 0], ['arrow-p4', 0]],
        [0,               0,               0],
      ];
    }
  }

  private drawMatrix(ctx, matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {

          const img = this.images[value[0]];
          const radians = value[1] * Math.PI / 180;
          const dx = (x + offset.x) * this.brickSize;
          const dy = (y + offset.y) * this.brickSize;

          ctx.save();
          ctx.translate(dx + this.brickSize/2, dy + this.brickSize/2);
          ctx.rotate(radians);
          ctx.drawImage(img, -this.brickSize/2, -this.brickSize/2, this.brickSize, this.brickSize);
          ctx.restore();
        }
      });
    });
  }

  private draw() {
    this.clearCanvas();

    this.drawMatrix(this.context, this.arena, {x: 0, y: 0});
    this.drawMatrix(this.context, this.player.matrix, this.player.pos);
  }

  private merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  private rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [
          matrix[x][y],
          matrix[y][x],
        ] = [
          matrix[y][x],
          matrix[x][y],
        ];
      }
    }

    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }

    // save rotation info into value's second index
    matrix.forEach(row => {
      row.forEach(value => {
        if (value !== 0) {
          if (dir > 0) {
            value[1] += 90;
          } else {
            value[1] -= 90;
          }
        }
      });
    });
  }

  private playerDrop() {
    this.player.pos.y++;
    if (this.collide(this.arena, this.player)) {
      this.player.pos.y--;
      this.merge(this.arena, this.player);
      this.playerReset();
      this.arenaSweep();
    }
    this.dropCounter = 0;
  }

  private playerMove(offset) {
    this.player.pos.x += offset;
    if (this.collide(this.arena, this.player)) {
      this.player.pos.x -= offset;
    }
  }

  private playerReset() {
    this.player.matrix = this.getBlock(this.nextPieceType);
    this.nextPieceType = this.randomPieceType();
    this.dropInterval -= this.dropInterval * 0.01;

    this.player.pos.y = 0;
    this.player.pos.x = (this.arena[0].length / 2 | 0) -
             (this.player.matrix ? this.player.matrix[0].length / 2 | 0 : 0);
    // check end game
    if (this.collide(this.arena, this.player)) {
      this.arena.forEach(row => row.fill(0));
      this.isRunning = false;
      this.gameFinishedWithScore.emit(this.player.score);
    }
  }

  private playerRotate(dir) {
    const pos = this.player.pos.x;
    let offset = 1;
    this.rotate(this.player.matrix, dir);
    while (this.collide(this.arena, this.player)) {
      this.player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > this.player.matrix[0].length) {
        this.rotate(this.player.matrix, -dir);
        this.player.pos.x = pos;
        return;
      }
    }
  }

  private randomPieceType() {
    return this.pieces[Math.floor(this.random(0, this.pieces.length-1))];
  }

  private random(min, max) { return (min + (Math.random() * (max - min))); }

  /**
   * This function takes a canvas, context, width and height. It scales both the
   * canvas and the context in such a way that everything you draw will be as
   * sharp as possible for the device.
   *
   * It doesn't return anything, it just modifies whatever canvas and context you
   * pass in.
   *
   * Adapted from Paul Lewis's code here:
   * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
   */
  private scaleCanvasForRetina(canvas, context, width, height) {
    // assume the device pixel ratio is 1 if the browser doesn't specify it
    const devicePixelRatio = window.devicePixelRatio || 1;

    // determine the 'backing store ratio' of the canvas context
    const backingStoreRatio = (
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1
    );

    // determine the actual ratio we want to draw at
    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
      // set the 'real' canvas size to the higher width/height
      canvas.width = width * ratio;
      canvas.height = height * ratio;

      // ...then scale it back down with CSS
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }
    else {
      // this is a normal 1:1 device; just scale it simply
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = '';
      canvas.style.height = '';
    }

    // scale the drawing context so everything will work at the higher ratio
    context.scale(ratio, ratio);
  }
}
