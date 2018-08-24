import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PromptComponent } from './prompt.component';

import { PromptService } from './prompt.service';
@NgModule({
    declarations: [
        PromptComponent
    ],
    exports: [
        PromptComponent
    ],
    imports: [
        FormsModule,
        CommonModule
    ],
    providers: [
        PromptService
    ],
    entryComponents: [PromptComponent]
})
export class PromptModule { }