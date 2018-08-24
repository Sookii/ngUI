import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IpSelectModule } from '../ipharmacare-ui/select/ip-select.module';
import { DragModule } from '../drag-directive/drag.module';
import { CascaderModule } from '../cascader/cascader.module';
import { AddHospitalComponent } from './add-hospital.component';
import { AutocompleteModule } from '../auto-complete-directive/autocomplete.module';
@NgModule({
    declarations: [
        AddHospitalComponent
    ],
    exports: [
        AddHospitalComponent
    ],
    imports:[
        CommonModule,
        FormsModule,
        IpSelectModule,
        DragModule,
        CascaderModule,
        AutocompleteModule
    ]
})

export class AddHospitalModule {}