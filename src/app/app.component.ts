import { Component } from '@angular/core';
import { DialogService } from './services/dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public isGameMounted: boolean = false;

  constructor(private dialogService: DialogService) {}

  handleGameOverDialog(score: number) {
    this.isGameMounted = false;

    this.dialogService
      .confirm('Game Over!', `Score: ${score}`, this.getTrophyImage(score))
      .subscribe(res => this.isGameMounted = res);
  }

  handleGameCancelled(score: number) {
    this.isGameMounted = false;

    this.dialogService
      .confirm('Not bad!', `Score: ${score}`, this.getTrophyImage(score))
      .subscribe(res => this.isGameMounted = res);
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
