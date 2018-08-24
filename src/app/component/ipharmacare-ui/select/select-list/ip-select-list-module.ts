import { NgModule }      from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectListComponent } from './select-list.component';

@NgModule({
  declarations: [
    SelectListComponent
  ],
  exports: [
    SelectListComponent
  ],
  imports: [
    FormsModule,
    CommonModule
  ],
  entryComponents: [ SelectListComponent ]
})
export class IpSelectListModule {}