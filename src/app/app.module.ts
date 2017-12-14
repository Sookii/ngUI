import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SlideNavComponent } from './slide-nav/slide-nav.component';

@NgModule({
    declarations: [
        AppComponent,
        SlideNavComponent
    ],
    imports: [
        BrowserModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
