import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  @Output('onStartGame') startGame = new EventEmitter<any>();

  @HostBinding('class.handset') hasDeviceHandsetClass: boolean;
  @Input()
  set isDeviceHandset(value) {  this.hasDeviceHandsetClass = value }
  get isDeviceHandset() { return this.hasDeviceHandsetClass }

}
