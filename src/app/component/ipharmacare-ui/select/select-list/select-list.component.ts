import { Component, OnInit, Input, Output, ElementRef, EventEmitter, ViewChild, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
    selector: 'select-list-component',
    templateUrl: 'select-list.component.html',
    styles: [`
        .select-list .flex-1 {
            flex-basis: auto;
        }
        ul.list li{
            height: 35px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `]
})
export class SelectListComponent implements OnInit {
    //搜索
    queryString: string;

    private searchText$ = new Subject<string>();
    isFixed: boolean = false;
    handler: any;
    options: any;
    pDomEl: any = window.document.body;
    reverseDirection: boolean = false;
    position: any = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };
    selectListData: any[];
    isSelectArrow: boolean;
    _that: any;
    selectData: any;
    multipleSelect: boolean = false;

    constructor(private renderer: Renderer2, private el: ElementRef) {

    }


    @ViewChild('selectListElement') selectListElement: ElementRef;
    @Output() selectContent: EventEmitter<any> = new EventEmitter<any>();
    @Output() _selectArrow: EventEmitter<any> = new EventEmitter<any>();
    @Output() search: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        this.searchText$.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(res => {
            this.search.emit(this.queryString);
        })
        this.search.emit('');
    }

    ngAfterViewInit() {
        this.handler = this.renderer.listen(document, 'click', $event => {
            if (this.chcekElChain($event.target, this.pDomEl) || this.chcekElChain($event.target, this.el.nativeElement)) {
                $event.stopPropagation();
            } else {
                this._selectArrow.emit(false);
                if (this.isFixed) {
                    if (!this._that.cache.location.nativeElement.parentNode) return;
                    document.body.removeChild(this._that.cache.location.nativeElement);
                } else {
                    if (this._that.cache.location.nativeElement.parentElement != this.pDomEl) return;
                    this.pDomEl.removeChild(this._that.cache.location.nativeElement);
                }
            }
        })
    }

    typing() {
        this.searchText$.next(this.queryString);
    }

    show(that: any, position: any, selectListElement: any, isSelectArrow: boolean) {
        this._that = that;
        this.isFixed = that.fixList;
        this.pDomEl = that.pDomEl;
        this.options = that.options;

        for (let attr in position) {
            this.position[attr] = position[attr] + 'px';
        }

        if (that.options.multipleSelect) {
            this.multipleSelect = true;
            this.selectData = that.initItem || [];
        }

        if (that.options.reverseDirection || (parseInt(this.position.bottom) + (that.selectListData.length > 6 ? 6 : that.selectListData.length) * 35) > window.innerHeight) {
            this.reverseDirection = true;
            this.position.bottom = this.position.height || window.innerHeight - parseInt(this.position.top) + this.pDomEl.offsetHeight + 'px';
        } else {
            delete this.reverseDirection;
        }

        this.isSelectArrow = isSelectArrow;
        this.selectListData = that.selectListData;
        if (this.isFixed) {
            document.body.appendChild(selectListElement);
        } else {
            this.pDomEl.appendChild(selectListElement);
        }
    }

    containsIn(item: any) {
        if (!this.multipleSelect || !this.selectData) return false;
        for (let listItem of this.selectData) {
            if (item[this._that.options.key] == listItem[this._that.options.key]) return true;
        }
        return false;
    }

    _selectData($event: any, selectData: any) {
        $event.stopPropagation();
        /* 只读选项 */
        if(selectData.readonly) return;
        if (this.multipleSelect) {
            /**
             * 这部分代码定制化太强，需要改进
             */
            if (selectData[this._that.options.key] == '全部') {
                this.selectData = [selectData];
                this.selectContent.emit(this.selectData);
                return;
            }

            if (this.containsIn(selectData)) {
                this.selectData.splice(this.selectData.indexOf(selectData), 1);
            } else {
                if (this.selectData[0] && this.selectData[0][this._that.options.key] == '全部') {
                    this.selectData.splice(0, 1);
                }
                this.selectData.push(selectData);
            }

            this.selectContent.emit(this.selectData);
        } else {
            if (this.isFixed) {
                if (!this._that.cache.location.nativeElement.parentNode) return;
                document.body.removeChild(this._that.cache.location.nativeElement);
            } else {
                if (!this._that.cache.location.nativeElement.parentNode) return;
                this.pDomEl.removeChild(this._that.cache.location.nativeElement);
            }
            this.selectData = selectData;
            this.selectContent.emit(selectData);
        }
    }

    destroy() {
        this.handler();
        this.isSelectArrow = false;
        if (this.isFixed) {
            if (!this._that.cache.location.nativeElement.parentNode) return;
            document.body.removeChild(this._that.cache.location.nativeElement);
        } else {
            if (!this._that.cache.location.nativeElement.parentNode) return;
            this.pDomEl.removeChild(this._that.cache.location.nativeElement);
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