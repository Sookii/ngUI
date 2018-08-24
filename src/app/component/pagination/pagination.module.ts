import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { IpSelectModule } from '../ipharmacare-ui/select/ip-select.module';
//模块组件
import { PaginationComponent } from './pagination.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IpSelectModule
    ],
    exports: [ PaginationComponent ],
    declarations: [
        PaginationComponent
    ]
})
export class PaginationModule { }
