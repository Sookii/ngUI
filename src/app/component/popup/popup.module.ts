import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { PopupComponent } from './popup.component';
import { DragModule } from '../drag-directive/drag.module';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DragModule
    ],
    declarations: [
        PopupComponent
    ],
    exports: [
        PopupComponent
    ]
})
export class PopupModule { }
