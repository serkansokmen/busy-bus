import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { GameOverDialog } from '../game-over-dialog/game-over-dialog.component';

@Injectable()
export class DialogService {

  constructor(private dialog: MatDialog) { }

  public confirm(title: string, score: number): Observable<boolean> {

    let dialogRef: MatDialogRef<GameOverDialog> = this.dialog.open(GameOverDialog);

    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.score = score;

    return dialogRef.afterClosed();
  }

}
