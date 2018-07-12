import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { LayoutState } from '../../state/layout.state';
import { PiecesState } from '../../state/pieces.state';
import { GameOverDialogComponent } from '../../components/game-over-dialog/game-over-dialog.component';
import { ScoreBoardService, PieceService, PieceType } from '../../services';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css']
})
export class GamePageComponent {

  isGameMounted: boolean = true;

  @Select(LayoutState.isHandset) isHandset$: Observable<boolean>;
  @Select(PiecesState.images) images$: Observable<any>;

  constructor(private router: Router,
              private store: Store,
              private dialog: MatDialog,
  ) { }

  handleGameFinished(score: number) {
    this.launchGameOverDialog(score);
  }

  handleGameCancelled(score: number) {
    this.launchGameOverDialog(score);
  }

  private launchGameOverDialog(score: number) {
    const dialogRef: MatDialogRef<GameOverDialogComponent> = this.dialog.open(GameOverDialogComponent);

    dialogRef.componentInstance.title = 'Game Over!';
    dialogRef.componentInstance.score = score;

    this.isGameMounted = false;

    dialogRef.afterClosed().subscribe(res => {
      if (res === true) {
        this.isGameMounted = true;
      } else {
        this.isGameMounted = false;
        this.router.navigate(['/']);
      }
    });
  }

}
