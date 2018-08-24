import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DragModule } from '../drag-directive/drag.module';
import { VirtualScrollerModule } from '../virtual-scroller/virtual-scroller.module';

import { UploadInterfaceComponent } from './upload-interface.component';
import { UploadInterfaceService } from './upload-interface.service';
@NgModule({
    declarations: [
        UploadInterfaceComponent
    ],
    exports: [
        UploadInterfaceComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        DragModule,
        VirtualScrollerModule
    ],
    providers: [
        UploadInterfaceService
    ],
    entryComponents: [UploadInterfaceComponent]
})
export class UploadInterfaceModule { }