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
      .confirm("Game Over!", `Score: ${score}`)
      .subscribe(res => this.isGameMounted = res);
  }

  handleGameCancelled(score: number) {
    this.isGameMounted = false;

    this.dialogService
      .confirm("Not bad!", `Score: ${score}`)
      .subscribe(res => this.isGameMounted = res);
  }
}
