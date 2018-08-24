import { NgModule }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectComponent } from './select.component';
import { IpSelectListModule } from './select-list/ip-select-list-module';

@NgModule({
  declarations: [
    SelectComponent
  ],
  exports: [
    SelectComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    IpSelectListModule
  ]
})
export class IpSelectModule {}