import { Component, Input, HostListener, ElementRef, EventEmitter, Output, Renderer2 } from '@angular/core';

@Component({
    selector: 'autocomplete-window',
    template: `
    <div class="select-list" [style.position]="options.fixed ? 'fixed' : 'absolute'">
        <ul class="list">
            <li *ngIf="!dataList || dataList.length <= 0">暂无数据</li>
            <li (click)="onSelect($event, item)" #selectContent *ngFor="let item of dataList" [attr.title]="options.ez ? item : item[options.showAttr]">
                {{ options.ez ? item : item[options.showAttr] }}
            </li>
        </ul>
    </div>
    `,
    styles: [`
        .select-list {
            width: 100%;
            z-index: 10;
        }
        ul.list li{
            height: 35px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `]
})

export class AutocompleteListComponent {
    options: any = {};
    /**
     * 宿主元素在窗口中的位置
     */
    @Input()
    set boundingRect(value) {
        if (value) {
            this._boundingRect = value;
        }
    }
    _boundingRect: any;

    dataList: any[] = [];
    hostEl: any;                //指令宿主元素
    eventListener: any;         //事件监听对象

    @Output() selected: EventEmitter<any> = new EventEmitter();
    @Output() close: EventEmitter<any> = new EventEmitter();

    constructor(private _renderer: Renderer2, private el: ElementRef) {
        this.eventListener = this._renderer.listen(document, 'click', ($event) => {
            this.cancel($event)
        })
    }

    ngOnInit() {
        
    }

    ngOnDestroy() {
        this.eventListener();
    }

    onSelect($event: any, item: any) {
        $event.stopPropagation();
        this.selected.emit(item);
    }

    /**
     * 
     */
    cancel($event: any) {
        if (!(this.chcekElChain($event.target, this.el.nativeElement) || this.chcekElChain($event.target, this.hostEl))) {
            this.close.emit();
        }
    }
    /**
     * 冒泡检查是否点击了某个元素或其子元素
     * @param _el => 点击元素
     * @param el => 目标元素
     */
    chcekElChain(_el: any, el: any): boolean {
        if (_el == el) {
            return true;
        } else {
            if (!_el.parentElement) {
                return false;
            } else {
                return this.chcekElChain(_el.parentElement, el);
            }
        }
    }
}