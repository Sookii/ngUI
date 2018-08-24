import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextFilterDirective } from './textfilter.directive';

@NgModule({
    declarations: [
        TextFilterDirective
    ],
    exports: [
        TextFilterDirective
    ],
    imports:[
       
    ]
})

export class TextFilterModule {}