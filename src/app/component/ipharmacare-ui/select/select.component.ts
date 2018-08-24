import { Component, OnInit, OnDestroy, Input, Output, ViewChild, ElementRef, EventEmitter, ComponentRef, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { SelectListComponent } from './select-list/select-list.component';
@Component({
    selector: 'ip-select',
    templateUrl: './select.component.html',
    styles: [`
        :host {
            display: inline-block;
            position: relative;
        }
        .ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `]
})
export class SelectComponent implements OnInit {
    pDomEl: any;
    isSelectArrow: boolean = false;
    isContent: any;
    cache: any;
    position: Object = {
        right: 0,
        top: 0,
        width: 0
    };

    selectedItem: any;
    isInit: any = true;
    selectListElement: any;
    multipleSelect: boolean = false;
    constructor(private viewContainerRef: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver) { }
    private componentRef: ComponentRef<SelectListComponent>;

    _selectListData: any[];
    /**
     * options 参数
     *      key => key值意味着初始值为一个item的额外的唯一属性，用于匹配正确的item，选择id值输出
     *      oops！！！多选时默认存在key, 默认值为'id'。如需要额外的唯一属性来做判断，请输入。
     *      ez => boolean 简单模式，字符串列表，初始值也为字符串类型，默认 false。
     */
    @Input() options: any = {};
    @Input() fixList: boolean = false;
    @Input() initItem: any;
    @Input() disabled: boolean;
    @Input()
    set selectListData(value) {
        let keyId = this.options.id || 'name';
        if (this.options.clear) {
            if (this.options.ez) {
                this._selectListData = [''].concat(value);
            } else {
                let clear = {};
                clear[keyId] = this.options.clearChar || '';
                this._selectListData = [clear].concat(value);
            }
        } else {
            this._selectListData = value;
        }
        if (this.cache)
            this.cache.instance.selectListData = this._selectListData;
    }
    get selectListData() {
        return this._selectListData;
    }


    @Output() selecting: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectArrowShow: EventEmitter<any> = new EventEmitter<any>();
    @Output() query: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('selectElement') selectElement: ElementRef;

    ngOnInit() {
        this.options = Object.assign({ id: 'name', minWidth: '60px', key: 'id', placeholder: '请选择' }, this.options);
        if (this.options.multipleSelect) {
            this.multipleSelect = true;
            this.initItem = this.initItem || [];
        } else {
            this.selectedItem = this.parseInitItem(this.initItem);
        }
        this.isInit = false;
    }

    ngOnChanges(changes: any) {
        if (this.isInit) return;
        if (changes.initItem && !this.options.multipleSelect) {
            this.selectedItem = this.parseInitItem(changes.initItem.currentValue);
        }
    }

    ngOnDestroy() {
        this.isSelectArrow = false;
        if (this.cache && this.cache.instance)
            this.cache.instance.destroy();
    }

    parseInitItem(initItem: any) {
        if (initItem === undefined || initItem === null) return;
        if (this.options.ez) {
            return initItem;
        } else {
            if (typeof (initItem) == 'string' || typeof (initItem) == 'number' || typeof (initItem) == 'boolean') {
                for (let item of this.selectListData) {
                    if (item[this.options.key] == initItem) {
                        return item[this.options.id];
                    }
                }
                return initItem;
            } else if (typeof (initItem) == 'object') {
                return initItem[this.options.id]
            }
        }
    }


    ViewInit() {
        this.position = this.selectElement.nativeElement.getBoundingClientRect();
        if (this.cache && this.cache.instance) {
            this.cache.instance.show(this, this.position, this.selectListElement, this.isSelectArrow);
            return;
        }

        this.cache = this.viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(SelectListComponent));
        this.selectListElement = this.cache.location.nativeElement;
        this.cache.instance.show(this, this.position, this.selectListElement, this.isSelectArrow);

        this.cache.instance.selectContent.subscribe((result: any) => {
            if (this.multipleSelect) {
                this.initItem = result;
            } else {
                this.isSelectArrow = false;
                this.selectedItem = this.options.ez ? result : result[this.options.id];
            }
            this.selecting.emit(result);
        });
        this.cache.instance._selectArrow.subscribe((result: any) => {
            this.isSelectArrow = false;
        });

        this.cache.instance.search.subscribe(res => {
            this.query.emit(res);
        })
    }

    clickSelect($event: any, selectElement: any) {
        if (this.disabled) return;
        this.pDomEl = selectElement.parentNode;
        this.isSelectArrow = !this.isSelectArrow;
        this.ViewInit();
        if (this.isSelectArrow === false) {
            //this.pDomEl.removeChild(this.selectListElement);
            if (this.fixList) {
                if (!this.cache.location.nativeElement.parentNode) return;
                document.body.removeChild(this.cache.location.nativeElement);
            } else {
                if (this.cache.location.nativeElement.parentElement != this.pDomEl) return;
                this.pDomEl.removeChild(this.cache.location.nativeElement);
            }
        }
    }
    removeItem($event: any, idx: number) {
        $event.stopPropagation();

        this.initItem.splice(idx, 1);
    }
}