import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { AppComponent } from './app.component';
import { TetrisComponent } from './tetris/tetris.component';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog.component';
import { DialogService } from './services/dialog.service';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
  ],
  declarations: [
    AppComponent,
    TetrisComponent,
    ConfirmDialog,
    WelcomeComponent,
  ],
  providers: [
    DialogService,
  ],
  entryComponents: [
    ConfirmDialog,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
