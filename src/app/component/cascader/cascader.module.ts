import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CascaderComponent } from './cascader.component';

@NgModule({
    declarations: [
        CascaderComponent
    ],
    exports: [
        CascaderComponent
    ],
    imports:[
        CommonModule,
        FormsModule
    ]
})

export class CascaderModule {}