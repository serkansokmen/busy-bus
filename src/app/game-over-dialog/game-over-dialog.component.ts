import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore } from 'angularfire2/firestore';

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

  @ViewChild('form') public scoreForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<GameOverDialogComponent>,
    private db: AngularFirestore,
  ) { }

  ngOnInit() {
    this.message = `Score: ${this.score}`;
    this.trophyImage = this.getTrophyImage(this.score);

    this.scoreForm = this.formBuilder.group({
      name: ['', Validators.required],
      score: [this.score, Validators.required],
    });
    if (this.score === 0) {
      this.scoreForm.disable();
    }
  }

  onSubmitScore(event) {
    if (this.scoreForm.valid) {
      this.scoreForm.disable();
      this.db.collection<{ name: string, score: number }>('scores-34as').add(this.scoreForm.value);
      // this.dialogRef.close({
      //   playAgain: false,
      //   saveScore: this.scoreForm.value,
      // });
    }
  }

  onPlayAgain(event) {
    this.dialogRef.close({
      playAgain: true,
      saveScore: false,
    });
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
