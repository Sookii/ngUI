import { Directive, HostListener, ElementRef, ComponentFactoryResolver, ComponentRef, ViewContainerRef, ComponentFactory, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { DatepickerComponent } from './datepicker.component';
@Directive({
    selector: '[datepicker]',
    host: {
        '(click)': 'open($event)'
    }
})
export class DatepikerDirective {
    private componentFactory: ComponentFactory<DatepickerComponent>;
    private componentRef: ComponentRef<DatepickerComponent>;
    @Input()
    set options(value) {
        if (value) {
            this._options = Object.assign(this._options, value);
            if (this._options.editable) {
                this._options.timestamp = false;
                this._options.exact = false;
            }
        }
    }
    get options() {
        return this._options;
    }

    _options: any = {
        editable: false,            // true 允许输入日期。优先级高，允许输入时输出日期字符串且不支持时分秒 等价于同时设置 {timestamp: false, exact: false}
        timestamp: true,            // 默认输出时间戳。 false 输出日期字符串 默认连接符 '-'
        exact: false,               // 精确时间，需要时分秒。优先级高，设置 true 时忽略可选时间范围
        fixed: false,               // 窗口定位 TODO--相关代码赞未开发
        monthPicker: false          // 选择月份的时间控件
    }

    @Input()
    set ngModel(value) {
        this.initTime(value);
    }
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

    @Input()
    set time(value) {
        this.initTime(value);
    }
    @Output() timeChange: EventEmitter<any> = new EventEmitter();
    _time: any;

    @Input() minDate: string | number;
    @Input() maxDate: string | number;

    eventSubscribe: any = {};       // 事件订阅对象
    eventListener: any = {};        // 事件监听对象

    //DOM元素
    wrapper: any;
    calenderIcon: any;
    clearBtn: any;

    constructor(
        private _renderer: Renderer2,
        private el: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef
    ) {
        this.el = el;
        this.componentFactory = componentFactoryResolver.resolveComponentFactory(DatepickerComponent);
    }

    ngOnInit() {
        this.init();
    }

    ngOnDestroy() {
        //取消事件监听
        for (let attr in this.eventListener) {
            this.eventListener[attr]();
        }
    }

    init() {
        this.mkWrapper();
        this.addIcon();
        this.addClearBtn();
        this.initProperties();
    }

    initTime(value: any) {
        this._time = value;
        if (this._time) {
            if (this.calenderIcon)
                this._renderer.setStyle(this.calenderIcon, 'display', 'none');
            if (this.clearBtn)
                this._renderer.setStyle(this.clearBtn, 'display', 'inline-block');
        } else {
            if (this.calenderIcon)
                this._renderer.setStyle(this.calenderIcon, 'display', 'inline-block');
            if (this.clearBtn)
                this._renderer.setStyle(this.clearBtn, 'display', 'none');
        }
    }
    /**
     * 构建一个元素包裹 input
     */
    mkWrapper() {
        this.wrapper = this._renderer.createElement('span');

        this._renderer.setStyle(this.wrapper, 'display', 'inline-block');
        this._renderer.setStyle(this.wrapper, 'position', 'relative');

        this.el.nativeElement.parentNode.insertBefore(this.wrapper, this.el.nativeElement);
        this.wrapper.appendChild(this.el.nativeElement);
    }
    /**
     * 添加图标
     */
    addIcon() {
        this.calenderIcon = this._renderer.createElement('i');

        this._renderer.addClass(this.calenderIcon, 'iconfont');
        this._renderer.addClass(this.calenderIcon, 'icon-calendar');
        this._renderer.setStyle(this.calenderIcon, 'position', 'absolute');
        this._renderer.setStyle(this.calenderIcon, 'top', '6px');
        this._renderer.setStyle(this.calenderIcon, 'right', '6px');
        this._renderer.setStyle(this.calenderIcon, 'color', '#aaa');
        if (this._time) {
            this._renderer.setStyle(this.calenderIcon, 'display', 'none');
        } else {
            this._renderer.setStyle(this.calenderIcon, 'display', 'inline-block');
        }

        this._renderer.setStyle(this.el.nativeElement, 'paddingRight', '22px');

        this.el.nativeElement.parentNode.insertBefore(this.calenderIcon, this.el.nativeElement);
    }
    /**
     * 添加清空按钮
     */
    addClearBtn() {
        this.clearBtn = this._renderer.createElement('i');

        this._renderer.addClass(this.clearBtn, 'iconfont');
        this._renderer.addClass(this.clearBtn, 'icon-close-fill');
        this._renderer.setStyle(this.clearBtn, 'position', 'absolute');
        this._renderer.setStyle(this.clearBtn, 'top', '6px');
        this._renderer.setStyle(this.clearBtn, 'right', '6px');
        this._renderer.setStyle(this.clearBtn, 'color', '#aaa');
        this._renderer.setStyle(this.clearBtn, 'cursor', 'pointer');
        this._renderer.setStyle(this.clearBtn, 'display', 'none');
        if (this._time) {
            this._renderer.setStyle(this.clearBtn, 'display', 'inline-block');
        } else {
            this._renderer.setStyle(this.clearBtn, 'display', 'none');
        }

        this._renderer.setStyle(this.el.nativeElement, 'paddingRight', '22px');

        this.el.nativeElement.parentNode.insertBefore(this.clearBtn, this.el.nativeElement);

        this.eventListener.click = this._renderer.listen(this.clearBtn, 'click', (e) => {
            e.stopPropagation();
            this.timeChange.emit();
            this.ngModelChange.emit();

            if (this.componentRef && this.componentRef.instance) {
                this.componentRef.instance.time = '';
            }
        });
    }

    /**
     * 初始化属性
     */
    initProperties() {
        if (!this._options.editable) {
            this._renderer.setAttribute(this.el.nativeElement, 'readonly', 'readonly');
        } else {
            this._renderer.setAttribute(this.el.nativeElement, 'maxLength', '10');
            if (this._options.editable) {
                this.eventListener.keyup = this._renderer.listen(this.el.nativeElement, 'keyup', (e) => {
                    this.formatDate(this.el.nativeElement.value);
                });
            }
        }
    }

    //============================================
    open($event: any) {
        if (this.componentRef) {
            this.close();
            return;
        }

        this.componentRef = this.viewContainerRef.createComponent(this.componentFactory);

        //绑定属性并初始化
        this.bindProperty(this.componentRef.instance);

        this.eventSubscribe.confirm = this.componentRef.instance.timeSetted.subscribe((time: any) => {
            this.outputTime(time);
        });

        this.eventSubscribe.cancel = this.componentRef.instance.close.subscribe(_ => this.close());
    }

    close() {
        if (this.componentRef)
            this.viewContainerRef.remove(this.viewContainerRef.indexOf(this.componentRef.hostView));
        //取消事件订阅
        this.eventSubscribe.confirm.unsubscribe();
        this.eventSubscribe.cancel.unsubscribe();
        //并清除 componentRef
        this.componentRef = null;
    }

    /**
     * 将指令的 Input 属性绑定到组件实例
     * @param component 
     */
    bindProperty(component: any) {
        component.hostEl = this.el.nativeElement;
        component.boundingRect = this.el.nativeElement.getBoundingClientRect();
        //字符串时间戳转换成数字，日期字符串不做转换
        if (this._options.editable) {
            component.time = this.formatTime(this._time, true);
        } else {
            component.time = this.formatTime(this._time);
        }

        if (this._options.exact) {
            component.exact = this._options.exact;
        } else {
            if (this.minDate)
                component.minDate = this.formatTime(this.minDate);
            if (this.maxDate)
                component.maxDate = this.formatTime(this.maxDate);
        }

        if (this._options.monthPicker) {
            component.monthPicker = this._options.monthPicker;
        }
    }
    //格式化时间
    formatTime(time: any, format?: boolean) {
        let timestamp: any;

        if (parseInt(time) == time && !format) {
            //参数为时间戳
            timestamp = parseInt(time);
        } else {
            //合格的时间字符串
            if (!isNaN(new Date(time).getTime())) {
                timestamp = new Date(time).getTime();
            }
        }
        return timestamp;
    }
    /**
     * 输出日期
     */
    outputTime(time: any) {
        if (this._options.timestamp) {
            //时间戳支持 time 接口双向绑定
            this.timeChange.emit(time);
        } else {
            let date = new Date(time);
            let year, month, day, hour, mins, seconds;
            let timeStr: string = '';

            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
            hour = date.getHours();
            mins = date.getMinutes();
            seconds = date.getSeconds();

            if (this._options.exact) {
                timeStr = `${year}-${this.place0(month)}-${this.place0(day)} ${this.place0(hour)}:${this.place0(mins)}:${this.place0(seconds)}`;
            } else {
                timeStr = `${year}-${this.place0(month)}-${this.place0(day)}`;
            }
            //日期字符串支持 time 和 ngModel 两个接口双向绑定
            this.timeChange.emit(time);
            this.ngModelChange.emit(timeStr);
        }
        this.close();
    }

    //月 日 日期补全
    place0(variable: number) {
        return variable < 10 ? '0' + variable : variable;
    }

    //输入日期格式化
    formatDate(value: string) {
        if (value.length < 4) {
            this._renderer.removeClass(this.el.nativeElement, 'ip-input-error');
            return;
        }

        this._time = value.replace(/[^\d]/g, '').replace(/(\d{4})(?=\d)/i, "$1-").replace(/(\d{4}-\d{2})(?=\d)/i, "$1-");
        this.ngModelChange.emit(this._time);

        if (!isNaN(new Date(this._time).getTime())) {
            this._renderer.removeClass(this.el.nativeElement, 'ip-input-error');
            //完整的数据格式则更新日期面板
            if (/(\d{4}-\d{1,2}-\d{1,2})/i.test(this._time)) {
                if (this.componentRef && this.componentRef.instance) {
                    this.componentRef.instance.time = this._time;
                }
            }
        } else {
            this._renderer.addClass(this.el.nativeElement, 'ip-input-error');
        }
    }
}