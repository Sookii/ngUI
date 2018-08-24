import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

//共享模块
import { DatepickerModule } from './datepicker/datepicker.module';
import { DragModule } from './drag-directive/drag.module';
import { IpRadioModule } from './ipharmacare-ui/radio/ip-radio-module';
import { IpCheckboxModule } from './ipharmacare-ui/checkbox/ip-checkbox-module';
import { IpSelectModule } from './ipharmacare-ui/select/ip-select.module';
import { PopupModule } from './popup/popup.module';
//import { TableModule } from './ipharmacare-table/table.module';
import { TooltipModule } from './tooltip/tooltip.module';
import { SwitchModule } from './switch/switch.module';
import { DropdownModule } from './dropdown/dropdown.module';
import { TextFilterModule } from './textfilter-directive/textfilter.module';
import { CascaderModule } from './cascader/cascader.module';
import { AutocompleteModule } from './auto-complete-directive/autocomplete.module';
//管道
import { FormatPipeModule } from './format-pipe/format.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DatepickerModule,
        DragModule,
        IpRadioModule,
        IpCheckboxModule,
        IpSelectModule,
        PopupModule,
        //TableModule,
        TooltipModule,
        SwitchModule,
        DropdownModule,
        TextFilterModule,
        CascaderModule,
        AutocompleteModule,

        FormatPipeModule,
    ],
    declarations: [
        
    ],
    exports: [
        CommonModule,
        FormsModule,
        DatepickerModule,
        DragModule,
        IpRadioModule,
        IpCheckboxModule,
        IpSelectModule,
        PopupModule,
        //TableModule,
        TooltipModule,
        SwitchModule,
        DropdownModule,
        TextFilterModule,
        CascaderModule,
        AutocompleteModule,

        FormatPipeModule,
    ],
})
export class SharedModule { }
