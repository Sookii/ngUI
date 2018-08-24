import { Directive, Input, ElementRef, Output, EventEmitter, Renderer2 } from '@angular/core';

@Directive({
    selector: '[textfilter]'
})

export class TextFilterDirective {
    @Input()
    set textfilter(value) {
        if (value) {
            this.regExp = value;
        }
    }
    get textfilter() {
        return this.regExp;
    }
    @Output() ngModelChange = new EventEmitter<any>()

    //regExp: any = /(^\s*)|(\s*$)/g;
    regExp: any = /\s/g;
    /**
     * 监听事件对象集合
     */
    eventsListen: any;

    constructor(private el: ElementRef, private _renderer: Renderer2) {

    }

    ngAfterViewInit() {
        this.eventsListen = this._renderer.listen(this.el.nativeElement, 'keyup', () => this.onKeyup(this.el.nativeElement));
    }

    ngOnDestroy() {
        this.eventsListen();
    }

    onKeyup(el: any) {
        let result: string = '';
        let idx = el.selectionStart;

        result = el.value.replace(this.regExp, '');

        if (el.value.length - result.length == 1) {
            el.selectionStart = el.selectionEnd = idx - 1;
        }

        this.ngModelChange.emit(result);
    }
}
