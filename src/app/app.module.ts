import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatIconModule, MatDialogModule } from '@angular/material';
import { ShareModule } from 'ng2share/share.module';
import { AppComponent } from './app.component';
import { TetrisComponent } from './tetris/tetris.component';
import { GameOverDialog } from './game-over-dialog/game-over-dialog.component';
import { DialogService } from './services/dialog.service';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ShareModule,
  ],
  declarations: [
    AppComponent,
    TetrisComponent,
    GameOverDialog,
    WelcomeComponent,
  ],
  providers: [
    DialogService,
  ],
  entryComponents: [
    GameOverDialog,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
