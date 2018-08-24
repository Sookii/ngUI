import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

//模块组件
import { AutocompleteDirective } from './autocomplete-directive';
import { AutocompleteListComponent } from './autocomplete-list.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
    ],
    exports: [ AutocompleteDirective, AutocompleteListComponent ],
    declarations: [
        AutocompleteDirective,
        AutocompleteListComponent
    ],
    entryComponents: [ AutocompleteListComponent ] 
})

export class AutocompleteModule { }
