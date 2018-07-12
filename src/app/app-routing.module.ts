import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartPageComponent } from './pages/start-page/start-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';

import { WelcomeComponent } from './components/welcome/welcome.component';
import { TetrisComponent } from './components/tetris/tetris.component';
import { GameOverDialogComponent } from './components/game-over-dialog/game-over-dialog.component';
import { ScoreBoardComponent } from './components/score-board/score-board.component';

export const ROUTING_COMPONENTS = [
  StartPageComponent,
  GamePageComponent,
];

export const COMPONENTS = [
  WelcomeComponent,
  TetrisComponent,
  GameOverDialogComponent,
  ScoreBoardComponent,
];

export const ENTRY_COMPONENTS = [
  GameOverDialogComponent,
];

const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'game', component: GamePageComponent },
  // { path: 'game-over', component: GameOverComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    enableTracing: false,
    onSameUrlNavigation: 'reload',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
