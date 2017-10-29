import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DialogService } from './services/dialog.service';
import { PieceType } from './tetris/tetris.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

  public isGameMounted: boolean = false;
  public images: any = {};

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
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

  ngAfterViewInit() {
  }

  handleGameOverDialog(score: number) {
    this.isGameMounted = false;

    this.dialogService
      .confirm('Game Over!', score)
      .subscribe(res => this.isGameMounted = res);
  }

  handleGameCancelled(score: number) {
    this.isGameMounted = false;

    this.dialogService
      .confirm('Game Over!', score)
      .subscribe(res => this.isGameMounted = res);
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
}
