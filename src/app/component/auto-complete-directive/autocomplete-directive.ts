import { Directive, ElementRef, ComponentFactoryResolver, ComponentRef, ViewContainerRef, ComponentFactory, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { AutocompleteListComponent } from './autocomplete-list.component';

@Directive({
    selector: '[autocomplete]',
    host: {
        '(keyup)': 'onkeyup($event)',
        '(click)': 'painting()'
    },
})

export class AutocompleteDirective {
    private componentFactory: ComponentFactory<AutocompleteListComponent>;
    private componentRef: ComponentRef<AutocompleteListComponent>;

    @Input()
    set options(value) {
        if (value) {
            this._options = Object.assign(this._options, value);
        }
    }
    get options() {
        return this._options;
    }

    @Input()
    set dataList(value) {
        if (value && value.length > 0) {
            this._dataListCache = value;
        }
        if (this.componentRef) {
            this.componentRef.instance.dataList = this._dataListCache;
        }
    }
    get dataList() {
        return this._dataListCache || [];
    }

    _options: any = {
        showAttr: 'name'
    };
    _dataListCache: any[];

    positionInfo: any;
    eventSubscribe: any = {};       // 事件订阅对象
    eventListener: any = {};        // 事件监听对象

    timeout: any;
    keyword: string = '';

    //DOM元素
    wrapper: any;

    @Output() getAsyncList: EventEmitter<any> = new EventEmitter();
    @Output() selected: EventEmitter<any> = new EventEmitter();
    @Output() ngModelChange: EventEmitter<string | number> = new EventEmitter();

    constructor(
        private _renderer: Renderer2,
        private el: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef
    ) {
        this.el = el;
        this.componentFactory = componentFactoryResolver.resolveComponentFactory(AutocompleteListComponent);
    }

    ngOnInit() {
        this.mkWrapper();
    }

    onkeyup($event: any) {
        if (!this.componentRef) {
            this.open();
        }
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            /**
             * 输入结束时值一样，退出事件
             */
            if (this.keyword && this.keyword == this.el.nativeElement.value) return;
            this.keyword = this.el.nativeElement.value;
            /**
             * 抛出事件在调用组件层请求数据并传递进来。
             */
            this.getAsyncList.emit(this.el.nativeElement.value);
        }, 600);
    }
    //再次点击时重新获取上一次的结果
    painting() {
        if (!this.componentRef) {
            this.open();
        }
    }

    /**
     * 构建一个元素包裹 input
     */
    mkWrapper() {
        let oriElWidth = getComputedStyle(this.el.nativeElement).width;
        let oriELHeight = getComputedStyle(this.el.nativeElement).height;
        this.wrapper = this._renderer.createElement('span');

        this._renderer.setStyle(this.el.nativeElement, 'width', oriElWidth);
        this._renderer.setStyle(this.el.nativeElement, 'max-width', '100%');
        this._renderer.setStyle(this.wrapper, 'width', oriElWidth);
        this._renderer.setStyle(this.wrapper, 'height', oriELHeight);
        this._renderer.setStyle(this.wrapper, 'display', 'inline-block');
        this._renderer.setStyle(this.wrapper, 'position', 'relative');

        this.el.nativeElement.parentNode.insertBefore(this.wrapper, this.el.nativeElement);
        this.wrapper.appendChild(this.el.nativeElement);
    }

    open() {
        this.positionInfo = this.el.nativeElement.getBoundingClientRect();

        this.componentRef = this.viewContainerRef.createComponent(this.componentFactory);

        //绑定属性并初始化
        this.bindProperty(this.componentRef.instance);

        this.eventSubscribe.confirm = this.componentRef.instance.selected.subscribe((item: any) => {
            /* 双向绑定输出简单字符串 */
            this.keyword = item[this.options['showAttr']];
            this.ngModelChange.emit(item[this.options['showAttr']]);
            /* 输出完整对象 */
            this.selected.emit(item);
            this.close(true);
        });

        this.eventSubscribe.cancel = this.componentRef.instance.close.subscribe(_ => this.close());
    }

    close(clearCache?: boolean) {
        if (this.componentRef)
            this.viewContainerRef.remove(this.viewContainerRef.indexOf(this.componentRef.hostView));
        /* 取消事件订阅 */
        this.eventSubscribe.confirm.unsubscribe();
        this.eventSubscribe.cancel.unsubscribe();
        /* 并清除 componentRef */
        this.componentRef = null;
        /* 清除定时器 */
        clearTimeout(this.timeout);
        this.timeout = null;
        /* 选中某个选项后关闭时，清除列表缓存 */
        if (clearCache) {
            delete this._dataListCache;
        }
    }
    /**
     * 将指令的 Input 属性绑定到组件实例
     * @param component 
     */
    bindProperty(component: any) {
        component.options = this.options;
        component.hostEl = this.el.nativeElement;
        component.positionInfo = this.positionInfo;
        component.boundingRect = this.el.nativeElement.getBoundingClientRect();

        if (this._dataListCache && this.keyword && this.keyword == this.el.nativeElement.value) {
            this.componentRef.instance.dataList = this.dataList;
        } else {
            this.getAsyncList.emit(this.el.nativeElement.value);
        }
    }
}