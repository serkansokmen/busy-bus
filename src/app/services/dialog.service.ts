import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog.component';

@Injectable()
export class DialogService {

  constructor(private dialog: MatDialog) { }

  public confirm(title: string, message: string, trophyImage: string): Observable<boolean> {

    let dialogRef: MatDialogRef<ConfirmDialog> = this.dialog.open(ConfirmDialog);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.trophyImage = trophyImage;

    return dialogRef.afterClosed();
  }

}
