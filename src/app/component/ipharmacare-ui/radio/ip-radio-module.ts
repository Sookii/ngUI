import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioComponent } from './radio.component';

@NgModule({
  declarations: [
    RadioComponent
  ],
  exports: [
    RadioComponent
  ],
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class IpRadioModule {}