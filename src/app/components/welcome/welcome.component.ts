import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  @HostBinding('class.handset') hasDeviceHandsetClass: boolean;
  @Input()
  set isDeviceHandset(value) {  this.hasDeviceHandsetClass = value }
  get isDeviceHandset() { return this.hasDeviceHandsetClass }

  @Output('onStartGame') startGame = new EventEmitter<any>();

}
