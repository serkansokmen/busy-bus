import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';


interface BlockImage {
  rotatedImages: HTMLImageElement[];
};

@Component({
  selector: 'bb-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.css']
})
export class TetrisComponent implements OnInit {

  @Input('columns') columns: number = 16;
  @Input('rows') rows: number = 32;
  @Input('brickSize') brickSize: number = 20;

  @ViewChild('game') gameCanvas: ElementRef;

  private gameCtx: CanvasRenderingContext2D;
  private dropCounter = 0;
  private dropInterval = 500;
  private lastTime = 0;
  private colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
  ];
  private arena;
  private player = {
    pos: {
      x: 0, y: 0
    },
    matrix: null,
    score: 0
  };
  // ILJOZST
  private imageIdentifiers = [
    null,
    'line1',
    'rightHook',
    'leftHook',
    'square',
    'leftZag',
    'rightZag',
    'arrow',
  ];

  private images: HTMLImageElement[] = [null];
  constructor() {
    for (let identifier of this.imageIdentifiers) {
      if (identifier) {
        let img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = `/assets/img/${identifier}.png`;
        this.images.push(img);
      }
    }
  }

  ngOnInit() {
    this.gameCtx = this.gameCanvas.nativeElement.getContext('2d');
    // this.gameCtx.scale(this.brickSize, this.brickSize);
    this.gameCtx.fillStyle = '#fff';
    this.gameCtx.fillRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    this.arena = this.createMatrix(this.columns, this.rows);

    this.playerReset();
    this.updateScore();
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
    requestAnimationFrame(this.update.bind(this));
  }

  updateScore() {
    console.log(this.player.score);
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

  private createPiece(type) {
    if (type === 'I') {
      return [
        [0, [1, 0], 0, 0],
        [0, [1, 0], 0, 0],
        [0, [1, 0], 0, 0],
        [0, [1, 0], 0, 0],
      ];
    } else if (type === 'L') {
      return [
        [0, [2, 0], 0],
        [0, [2, 0], 0],
        [0, [2, 0], [2, 0]],
      ];
    } else if (type === 'J') {
      return [
        [0,      [3, 0], 0],
        [0,      [3, 0], 0],
        [[3, 0], [3, 0], 0],
      ];
    } else if (type === 'O') {
      return [
        [[4, 0], [4, 0]],
        [[4, 0], [4, 0]],
      ];
    } else if (type === 'Z') {
      return [
        [0,      [5, 0], 0],
        [[5, 0], [5, 0], 0],
        [[5, 0], 0, 0],
      ];
    } else if (type === 'S') {
      return [
        [0, [6, 0], 0],
        [0, [6, 0], [6, 0]],
        [0, 0,      [6, 0]],
      ];
    } else if (type === 'T') {
      return [
        [0,      [7, 0], 0],
        [[7, 0], [7, 0], [7, 0]],
        [0,      0,      0],
      ];
    }
  }

  private drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          this.gameCtx.fillStyle = this.colors[value[0]];
          this.gameCtx.fillRect(x + offset.x,
                                y + offset.y,
                                1, 1);

          const sx = (x + offset.x) * this.brickSize;
          const sy = (y + offset.y) * this.brickSize;
          const sw = this.brickSize;
          const sh = this.brickSize;
          const dx = (x + offset.x) * this.brickSize;
          const dy = (y + offset.y) * this.brickSize;
          const dw = this.brickSize;
          const dh = this.brickSize;
          const img = this.images[value[0]];

          this.gameCtx.save();
          const radians = value[1] * Math.PI / 180;
          this.gameCtx.translate(sx + this.brickSize/2, sy + this.brickSize/2);
          this.gameCtx.rotate(radians);
          this.gameCtx.drawImage(img, -this.brickSize/2, -this.brickSize/2, sw, sh);
          this.gameCtx.restore();
        }
      });
    });
  }

  private draw() {
    this.gameCtx.fillStyle = '#ece';
    this.gameCtx.fillRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    this.drawMatrix(this.arena, {x: 0, y: 0});
    this.drawMatrix(this.player.matrix, this.player.pos);
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
      this.updateScore();
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
    const pieces = 'TJLOSZI';
    this.player.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
    this.player.pos.y = 0;
    this.player.pos.x = (this.arena[0].length / 2 | 0) -
             (this.player.matrix[0].length / 2 | 0);
    if (this.collide(this.arena, this.player)) {
      this.arena.forEach(row => row.fill(0));
      this.player.score = 0;
      this.updateScore();
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
}
