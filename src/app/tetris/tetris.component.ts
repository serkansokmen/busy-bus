import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'bb-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TetrisComponent implements OnInit {

  @Input('columns') columns: number = 16;
  @Input('rows') rows: number = 32;
  @Input('brickSize') brickSize: number = 20;

  @ViewChild('game') canvas: ElementRef;
  @ViewChild('currentPiece') currentPiece: ElementRef;

  public blockTypes = 'TJLOSZI';
  // probabilities
  private pieces = [
    'I1','I1','I1','I1',
    'I2','I2','I2','I2',
    'J','J','J','J',
    'L','L','L','L',
    'O','O','O','O',
    'S','S','S','S',
    'T','T','T','T',
    'Z','Z','Z','Z'
  ];
  private context: CanvasRenderingContext2D;
  private dropCounter = 0;
  private dropInterval = 800;
  private lastTime = 0;
  public arena;
  public player = {
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
      ['lineF', 4],
      ['lineM', 4],
      ['rightHook', 4],
      ['leftHook', 4],
      ['square', 4],
      ['leftZag', 4],
      ['rightZag', 4],
      ['arrow', 4],
    ].map(item => {
      this.loadImagePiece(item[0], item[1]);
    });
  }

  private loadImagePiece(identifier: any, partCount: any) {
    for (var part = 0; part < partCount; ++part) {
      let img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      const partCacheKey = `${identifier}-p${part+1}`;
      img.src = `/assets/img/pieces/${partCacheKey}@2x.png`;
      this.images[partCacheKey] = img;
    }
  }

  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.context.fillStyle = '#88b6a5';
    this.context.imageSmoothingEnabled = true;
    // this.context.mozImageSmoothingEnabled = true;
    // this.context.webkitImageSmoothingEnabled = true;
    // this.context.mozImageSmoothingEnabled = true;
    this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.arena = this.createMatrix(this.columns, this.rows);

    this.playerReset();
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

  private createBlockPiece(type, part) {
    return [type, part];
  }

  private createBlock(type) {
    if (type === 'I1') {
      return [
        [0, ['lineF-p1', 0], 0, 0],
        [0, ['lineF-p2', 0], 0, 0],
        [0, ['lineF-p3', 0], 0, 0],
        [0, ['lineF-p4', 0], 0, 0],
      ];
    }
    else if (type === 'I2') {
      return [
        [0, ['lineM-p1', 0], 0, 0],
        [0, ['lineM-p2', 0], 0, 0],
        [0, ['lineM-p3', 0], 0, 0],
        [0, ['lineM-p4', 0], 0, 0],
      ];
    } else if (type === 'L') {
      return [
        [0, ['rightHook-p1', 0], 0],
        [0, ['rightHook-p2', 0], 0],
        [0, ['rightHook-p3', 0], ['rightHook-p4', 0]],
      ];
    } else if (type === 'J') {
      return [
        [0,                  ['leftHook-p4', 0], 0],
        [0,                  ['leftHook-p3', 0], 0],
        [['leftHook-p1', 0], ['leftHook-p2', 0], 0],
      ];
    } else if (type === 'O') {
      return [
        [['square-p1', 0], ['square-p2', 0]],
        [['square-p3', 0], ['square-p4', 0]],
      ];
    } else if (type === 'Z') {
      return [
        [0,                 ['leftZag-p1', 0], 0],
        [['leftZag-p3', 0], ['leftZag-p2', 0], 0],
        [['leftZag-p4', 0], 0,                 0],
      ];
    } else if (type === 'S') {
      return [
        [0, ['rightZag-p1', 0], 0],
        [0, ['rightZag-p2', 0], ['rightZag-p3', 0]],
        [0, 0,                  ['rightZag-p4', 0]],
      ];
    } else if (type === 'T') {
      return [
        [0,               ['arrow-p1', 0], 0],
        [['arrow-p2', 0], ['arrow-p3', 0], ['arrow-p4', 0]],
        [0,               0,               0],
      ];
    }
  }

  private drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {

          const img = this.images[value[0]];
          const radians = value[1] * Math.PI / 180;
          const dx = (x + offset.x) * this.brickSize;
          const dy = (y + offset.y) * this.brickSize;

          this.context.save();
          this.context.translate(dx + this.brickSize/2, dy + this.brickSize/2);
          this.context.rotate(radians);
          this.context.drawImage(img, -this.brickSize/2, -this.brickSize/2, this.brickSize, this.brickSize);
          this.context.restore();
        }
      });
    });
  }

  private draw() {
    // this.context.fillStyle = '#f2adb7';
    this.context.fillStyle = '#fff';
    this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

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
    this.player.matrix = this.randomPiece();
    this.player.pos.y = 0;
    this.player.pos.x = (this.arena[0].length / 2 | 0) -
             (this.player.matrix ? this.player.matrix[0].length / 2 | 0 : 0);
    if (this.collide(this.arena, this.player)) {
      this.arena.forEach(row => row.fill(0));
      this.player.score = 0;
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

  private randomPiece() {
    const type = this.pieces[Math.floor(this.random(0, this.pieces.length-1))];
    return this.createBlock(type);
  }

  private random(min, max)      { return (min + (Math.random() * (max - min)));            }
}
