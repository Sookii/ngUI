import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

//模块组件
import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';
//服务



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    exports: [TooltipDirective, TooltipComponent],
    declarations: [
        TooltipDirective,
        TooltipComponent
    ],
    entryComponents: [TooltipComponent]
})

export class TooltipModule { }
