import { Component, OnInit, Input, Output, OnChanges, EventEmitter, ContentChild, TemplateRef } from '@angular/core';

@Component({
    selector: 'ip-checkbox',
    templateUrl: './checkbox.component.html',
})
export class CheckboxComponent implements OnInit {
    @Input() options: any;
    @Input() isChecked: boolean;
    @Input() halfChecked: boolean;
    @Input() labelText: string;
    @Input() isDisabled: boolean;

    @Output() onCheck: EventEmitter<any> = new EventEmitter<any>();

    extendCfg: any;
    constructor() { }

    ngOnInit() {
    }

    check($event: any) {
        this.isChecked = !this.isChecked;
        this.onCheck.emit(this.isChecked);
    }

    //双击事件的组织冒泡
    onRowDblClick($event: any) {
        $event.stopPropagation();

    }
}