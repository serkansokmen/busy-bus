import { Component, HostBinding, HostListener } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, from, of } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { map, tap } from 'rxjs/operators';
import { ScoreBoardService } from './services';
import { environment } from '../environments/environment';

import { SetIsHandset } from './state/layout.actions';
import { LoadPieceImages } from './state/pieces.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  public scores$: Observable<any[]>;
  public isScoreboardVisible: boolean = false;

  @HostBinding('class.handset') isDeviceHandset: boolean;

  constructor(
    private store: Store,
    private scoreBoard: ScoreBoardService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.scores$ = scoreBoard.scores;

    this.store.dispatch(new LoadPieceImages());

    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches),
    ).subscribe(isHandset => {
      this.store.dispatch(new SetIsHandset(isHandset));
    });
  }
}
