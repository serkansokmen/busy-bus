import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-game-over-dialog',
  templateUrl: './game-over-dialog.component.html',
  styleUrls: ['./game-over-dialog.component.scss']
})
export class GameOverDialogComponent implements OnInit {

  public title: string;
  public message: string;
  public score: number;
  public trophyImage: string;

  constructor(public dialogRef: MatDialogRef<GameOverDialogComponent>) { }

  ngOnInit() {
    this.message = `Score: ${this.score}`;
    this.trophyImage = this.getTrophyImage(this.score);
  }

  private getTrophyImage(score: number): string {
    if (score >= 1000) {
      return 'trophy-leaves';
    } else if (score < 1000 && score >= 500) {
      return 'trophy-bridge';
    } else if (score < 500 && score >= 100) {
      return 'trophy-building';
    } else {
      return 'trophy-flame';
    }
  }

}
