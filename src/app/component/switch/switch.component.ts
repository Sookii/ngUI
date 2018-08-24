import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
    selector: 'switch',
    template: `
        <span [ngClass]="_classMap" [style.background]="_checked ? color : ''">
            <span [ngClass]="'switch-inner'">
                <ng-template [ngIf]="_checked">
                    <ng-content select="[checked]"></ng-content>
                </ng-template>
                <ng-template [ngIf]="!_checked">
                    <ng-content select="[unchecked]"></ng-content>
                </ng-template>
            </span>
        </span>
    `,
    styleUrls: ['./switch.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SwitchComponent),
            multi: true
        }
    ]
})
export class SwitchComponent implements OnInit, ControlValueAccessor {
    @Input() color: string = '#3DBD7D';
    @Input() disabled: boolean = false;
    @Output() switching: EventEmitter<any> = new EventEmitter();

    _checked: boolean = true;
    _classMap: any;

    onChange: any = Function.prototype;
    onTouched: any = Function.prototype;

    constructor() { }

    ngOnInit() {
        this.setClassMap();
    }

    @HostListener('click', ['$event'])
    onClick(e) {
        e.preventDefault();
        if (!this.disabled) {
            this.onChange(this._checked);
            this.switching.emit(this._checked);
        }
    }

    writeValue(value: any): void {
        if (this._checked === value) {
            return;
        }
        this._checked = value;
        this.setClassMap();
    }

    registerOnChange(fn: (_: any) => {}): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    setClassMap(): void {
        this._classMap = {
            ['ip-switch']: true,
            ['checked']: this._checked
        };
    }
}
