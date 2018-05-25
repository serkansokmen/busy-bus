import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ScoreBoardService } from '../services';

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
    private scoreBoard: ScoreBoardService,
  ) { }

  ngOnInit() {
    this.message = `Score: ${this.score}`;
    this.trophyImage = this.scoreBoard.getTrophyImage(this.score);

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
      this.scoreBoard.save(this.scoreForm.value);
    }
  }

  onPlayAgain(event) {
    this.dialogRef.close(true);
  }

  onCancel(event) {
    this.dialogRef.close(false);
  }

}
