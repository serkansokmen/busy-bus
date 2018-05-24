import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatIconModule, MatDialogModule, MatInputModule, MatFormFieldModule } from '@angular/material';
import { ShareModule } from '@ngx-share/core';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { TetrisComponent } from './tetris/tetris.component';
import { GameOverDialogComponent } from './game-over-dialog/game-over-dialog.component';
import { DialogService } from './services/dialog.service';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';
import { ScoreBoardComponent } from './score-board/score-board.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    ShareModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
  ],
  declarations: [
    AppComponent,
    WelcomeComponent,
    TetrisComponent,
    GameOverDialogComponent,
    ScoreBoardComponent
  ],
  providers: [
    DialogService,
  ],
  entryComponents: [
    GameOverDialogComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
