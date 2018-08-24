import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
@Component({
    selector: 'popup',
    templateUrl: './popup.component.html',
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ backgroundColor: 'rgba(0, 0, 0, 0)' }),
                animate(100, style({ backgroundColor: 'rgba(0, 0, 0, .3)' }))
            ]),
            transition(':leave', [
                animate(100, style({ backgroundColor: 'rgba(0, 0, 0, 0)' }))
            ])
        ])
    ]
})
export class PopupComponent implements OnInit {
    @Input() options: any = {};

    @Input()
    set visible(value) {
        this._visible = value;
    }
    get visible() {
        return this._visible;
    }
    @Output() visibleChange: EventEmitter<any> = new EventEmitter();


    @Output() onSubmit = new EventEmitter();
    @Output() cancelFn = new EventEmitter();
    @ContentChild('popupTemplate') popupTemplate: TemplateRef<any>;

    popupData: any = {};

    _visible: boolean = false;
    
    constructor() { }

    ngOnInit() {
        this.options = Object.assign({ title: '提示' }, this.options);
    }

    open() {
        this._visible = true;
    }

    close() {
        this._visible = false;
        this.visibleChange.emit(this._visible);
    }

    submit(submitBtn: any) {
        this.onSubmit.emit({});
    }
}
