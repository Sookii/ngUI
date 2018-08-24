import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DatepickerComponent } from './datepicker.component';
import { DatepikerDirective } from './datepicker.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        DatepickerComponent,
        DatepikerDirective
    ],
    exports: [
        DatepickerComponent,
        DatepikerDirective
    ],
    entryComponents: [DatepickerComponent]
})
export class DatepickerModule { }
