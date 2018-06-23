import { Component, HostBinding } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
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
  public scores$: Observable<any[]>;
  public isScoreboardVisible: boolean = false;

  @HostBinding('class.handset') isDeviceHandset: boolean;

  constructor(
    private pieces: PieceService,
    private scoreBoard: ScoreBoardService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.scores$ = scoreBoard.scores;
    this.images = pieces.images;

    this.breakpointObserver
      .observe(Breakpoints.Handset).pipe(
        map(result => result.matches),
      )
    .subscribe(isHandset => this.isDeviceHandset = isHandset );
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
