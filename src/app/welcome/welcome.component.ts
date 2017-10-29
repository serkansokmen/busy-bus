import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bb-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  @Output('onStartGame') startGame = new EventEmitter<any>();

  constructor() { }

}
