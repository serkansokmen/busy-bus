import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { GameOverDialogComponent } from '../game-over-dialog/game-over-dialog.component';

@Injectable()
export class DialogService {

  constructor(private dialog: MatDialog) { }

  public confirm(title: string, score: number): Observable<boolean> {

    let dialogRef: MatDialogRef<GameOverDialogComponent> = this.dialog.open(GameOverDialogComponent);

    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.score = score;

    return dialogRef.afterClosed();
  }

}
