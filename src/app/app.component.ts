import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable, from } from 'rxjs';
import { ScoreBoardService, PieceService, PieceType } from './services';
import { environment } from '../environments/environment';
import { GameOverDialogComponent } from './game-over-dialog/game-over-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  public isGameMounted: boolean = false;
  public images: any = {};
  public scores: Observable<any[]>;

  constructor(
    private pieces: PieceService,
    private scoreBoard: ScoreBoardService,
    private dialog: MatDialog,
  ) {
    this.scores = scoreBoard.scores;
    this.images = pieces.images;
  }

  handleGameOverDialog(score: number) {
    this.isGameMounted = false;
    this.launchGameOverDialog(score);
  }

  handleGameCancelled(score: number) {
    this.isGameMounted = false;
    this.launchGameOverDialog(score);
  }

  private launchGameOverDialog(score: number) {
    let dialogRef: MatDialogRef<GameOverDialogComponent> = this.dialog.open(GameOverDialogComponent);

    dialogRef.componentInstance.title = 'Game Over!';
    dialogRef.componentInstance.score = score;

    dialogRef.afterClosed().subscribe(res => this.isGameMounted = res);
  }
}
