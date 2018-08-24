import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

//模块组件
import { DropdownComponent } from './dropdown.component';
//服务

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    exports: [DropdownComponent],
    declarations: [
        DropdownComponent
    ]
})

export class DropdownModule { }
