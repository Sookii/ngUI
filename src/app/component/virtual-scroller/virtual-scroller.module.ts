import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

//模块组件
import { VirtualScrollerDirective } from './virtual-scroller.directive';
//服务

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    exports: [VirtualScrollerDirective],
    declarations: [
        VirtualScrollerDirective
    ]
})

export class VirtualScrollerModule { }
