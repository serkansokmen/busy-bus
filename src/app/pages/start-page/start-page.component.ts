import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { LayoutState } from '../../state/layout.state';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent {

  @Select(LayoutState.isHandset) isHandset$: Observable<boolean>;

  constructor(private router: Router) { }

  onStartGame(event) {
    this.router.navigate(['/game']);
  }

}
