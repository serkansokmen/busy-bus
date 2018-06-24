import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatIconModule, MatDialogModule, MatInputModule, MatFormFieldModule } from '@angular/material';
import { ShareModule } from '@ngx-share/core';
import { AppRoutingModule, ROUTING_COMPONENTS, COMPONENTS, ENTRY_COMPONENTS } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScoreBoardService } from './services';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';
import { LayoutState } from './state/layout.state';
import { PiecesState } from './state/pieces.state';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot([
      LayoutState,
      PiecesState,
    ]),
    NgxsLoggerPluginModule.forRoot({}),
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
    ...ROUTING_COMPONENTS,
    ...COMPONENTS,
  ],
  providers: [
    ScoreBoardService,
  ],
  entryComponents: [
    ...ENTRY_COMPONENTS,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
