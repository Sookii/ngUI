import { NgModule } from '@angular/core';

import { TextFormatPipe, TextFilterPipe, ArrayLengthFilter } from './format.pipe'
@NgModule({
    declarations: [
        TextFormatPipe,
        TextFilterPipe,
        ArrayLengthFilter
    ],
    exports: [
        TextFormatPipe,
        TextFilterPipe,
        ArrayLengthFilter
    ],
    imports: [
        
    ]
})
export class FormatPipeModule { }