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
  ChangeDetectionStrategy } from '@angular/core';

/** Utility function to create a K:V from a list of strings */
function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

/** Create a K:V */
const PieceType = strEnum([
  'lineF',
  'lineM',
  'leftHook',
  'rightHook',
  'square',
  'rightZag',
  'leftZag',
  'arrow'
]);

/** Create a Type */
type PieceType = keyof typeof PieceType;


@Component({
  selector: 'bb-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TetrisComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('columns') columns: number = 16;
  @Input('rows') rows: number = 32;
  @Input('brickSize') brickSize: number = 20;

  @ViewChild('game') canvas: ElementRef;

  @Output('onGameFinished') gameFinishedWithScore = new EventEmitter<number>();
  @Output('onGameCancelled') gameCancelled = new EventEmitter<number>();

  private animationFrameRequestId?: any;
  public isRunning = false;
  public nextPieceType: PieceType;

  // probabilities
  private pieces: PieceType[] = [
    PieceType.lineF, PieceType.lineF, PieceType.lineF, PieceType.lineF,
    PieceType.lineM, PieceType.lineM, PieceType.lineM, PieceType.lineM,
    PieceType.leftHook, PieceType.leftHook, PieceType.leftHook, PieceType.leftHook,
    PieceType.rightHook, PieceType.rightHook, PieceType.rightHook, PieceType.rightHook,
    PieceType.square, PieceType.square, PieceType.square, PieceType.square,
    PieceType.rightZag, PieceType.rightZag, PieceType.rightZag, PieceType.rightZag,
    PieceType.leftZag, PieceType.leftZag, PieceType.leftZag, PieceType.leftZag,
    PieceType.arrow, PieceType.arrow, PieceType.arrow, PieceType.arrow,
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
  private images: any = {};
  private backgroundImg: HTMLImageElement;
  constructor() {
    // Pieces
    // IILJOZST
    [
      [PieceType.lineF, 4],
      [PieceType.lineM, 4],
      [PieceType.rightHook, 4],
      [PieceType.leftHook, 4],
      [PieceType.square, 4],
      [PieceType.leftZag, 4],
      [PieceType.rightZag, 4],
      [PieceType.arrow, 4],
    ].map(item => {
      this.loadImagePiece(item[0], item[1]);
    });
  }

  private loadImagePiece(identifier: any, partCount: any) {
    for (var part = 0; part < partCount; ++part) {
      let img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      const partCacheKey = `${identifier}-p${part+1}`;
      img.src = `/assets/img/${partCacheKey}@2x.png`;
      this.images[partCacheKey] = img;
    }
  }

  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.context.imageSmoothingEnabled = true;
    this.context.mozImageSmoothingEnabled = true;
    this.context.webkitImageSmoothingEnabled = true;
    this.context.mozImageSmoothingEnabled = true;
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  ngAfterViewInit() {
    this.startNewGame();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameRequestId);
  }

  startNewGame() {
    this.arena = this.createMatrix(this.columns, this.rows);
    this.player.score = 0;
    this.dropInterval = 800;
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
    if (type === PieceType.lineF) {
      return [
        [0, ['lineF-p1', 0], 0, 0],
        [0, ['lineF-p2', 0], 0, 0],
        [0, ['lineF-p3', 0], 0, 0],
        [0, ['lineF-p4', 0], 0, 0],
      ];
    }
    else if (type === PieceType.lineM) {
      return [
        [0, ['lineM-p1', 0], 0, 0],
        [0, ['lineM-p2', 0], 0, 0],
        [0, ['lineM-p3', 0], 0, 0],
        [0, ['lineM-p4', 0], 0, 0],
      ];
    } else if (type === PieceType.rightHook) {
      return [
        [0, ['rightHook-p1', 0], 0],
        [0, ['rightHook-p2', 0], 0],
        [0, ['rightHook-p3', 0], ['rightHook-p4', 0]],
      ];
    } else if (type === PieceType.leftHook) {
      return [
        [0,                  ['leftHook-p4', 0], 0],
        [0,                  ['leftHook-p3', 0], 0],
        [['leftHook-p1', 0], ['leftHook-p2', 0], 0],
      ];
    } else if (type === PieceType.square) {
      return [
        [['square-p1', 0], ['square-p2', 0]],
        [['square-p3', 0], ['square-p4', 0]],
      ];
    } else if (type === PieceType.leftZag) {
      return [
        [0,                 ['leftZag-p1', 0], 0],
        [['leftZag-p3', 0], ['leftZag-p2', 0], 0],
        [['leftZag-p4', 0], 0,                 0],
      ];
    } else if (type === PieceType.rightZag) {
      return [
        [0, ['rightZag-p1', 0], 0],
        [0, ['rightZag-p2', 0], ['rightZag-p3', 0]],
        [0, 0,                  ['rightZag-p4', 0]],
      ];
    } else if (type === PieceType.arrow) {
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
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

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
}
