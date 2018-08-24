import { Component, Input, HostListener, ElementRef, EventEmitter, Output, Renderer2 } from '@angular/core';

@Component({
    selector: 'ip-datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.css']
})

export class DatepickerComponent {
    @Input()
    set monthPicker(value) {
        if (value) {
            this._monthPicker = true;
            this.pannelType = 2;
        }
    }
    get monthPicker() {
        return this._monthPicker;
    }
    @Input()
    set minDate(value) {
        this._minDate = value;
        this.init();
    }
    get minDate() {
        return this._minDate;
    }
    @Input()
    set maxDate(value) {
        this._maxDate = value;
        this.init();
    };
    get maxDate() {
        return this._maxDate;
    }

    @Input()
    set time(value) {
        this._time = value;
        this.init();
    }
    get time() {
        return this._time;
    }

    _monthPicker: boolean;      //选择月份
    pannelType: number = 1;     //日，月，年
    hostEl: any;                //指令宿主元素

    _time: any;
    _minDate: any;
    _maxDate: any;
    dateStr: string;    // yyyy-MM-dd 格式的日期
    todayStr: string;

    year: number;
    month: number;
    day: number;

    /**
     * 时, 分, 秒
     */
    @Input() exact: boolean;    //精确时间。需要选择时分秒
    hour: any = '00';
    mins: any = '00';
    seconds: any = '00';

    days: any[] = [];
    months = [
        [{ id: '1', name: '1月' }, { id: '2', name: '2月' }, { id: '3', name: '3月' }],
        [{ id: '4', name: '4月' }, { id: '5', name: '5月' }, { id: '6', name: '6月' }],
        [{ id: '7', name: '7月' }, { id: '8', name: '8月' }, { id: '9', name: '9月' }],
        [{ id: '10', name: '10月' }, { id: '11', name: '11月' }, { id: '12', name: '12月' }]
    ];
    years = [];


    @Output() timeSetted: EventEmitter<any> = new EventEmitter();
    @Output() close: EventEmitter<any> = new EventEmitter();

    eventListener: any;         //事件监听对象

    /**
     * 宿主元素在窗口中的位置
     */
    @Input()
    set boundingRect(value) {
        if (value) {
            this._boundingRect = value;
            setTimeout(() => {
                this.calcPosition(value);
            })
        }
    }
    _boundingRect: any;
    //组件内容显示位置，默认 右下 扩展
    verticalChar = 'b';
    horizontalChar = 'r';
    afterCalc: boolean = false;

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

    /**
     * 计算组件展示的方向
     * h 244px, exact h 286px
     * w 257px
     */
    calcPosition(rect: any) {
        let height = this.exact ? 286 : 244;
        let width = 257;

        if (window.innerHeight - rect.bottom < height) {
            if (rect.top > height) {
                this.verticalChar = 't';
            }
        }

        if (window.innerWidth - rect.right < width) {
            if (rect.left > width) {
                this.horizontalChar = 'l';
            }
        }
        this.setCalcedPosition(rect.width, rect.height);
    }
    /**
     * 设置计算过的组件位置属性
     */
    setCalcedPosition(elWidth, elHeight) {
        let pannel = this.el.nativeElement.firstElementChild;
        if (this.verticalChar == 't') {
            this._renderer.setStyle(pannel, 'bottom', elHeight + 4 + 'px');
        } else {
            this._renderer.setStyle(pannel, 'top', elHeight + 4 + 'px');
        }

        if (this.horizontalChar == 'l') {
            this._renderer.setStyle(pannel, 'right', 0);
        } else {
            this._renderer.setStyle(pannel, 'left', 0);
        }

        this.afterCalc = true;
    }

    /**
     * 初始化日期信息
     */
    init() {
        let _default: boolean = false;
        /* 月份选择器不执行日期渲染 */
        if(this.monthPicker) return;

        if (!this._time) {
            //没传入时间的默认当前时间
            _default = true;
            this._time = new Date().getTime();
        }
        /**
         * 开始构建日期数组
         */
        let _date = new Date(this._time);

        this.year = _date.getFullYear();
        this.month = _date.getMonth() + 1;
        this.day = _date.getDate();

        this.hour = _default ? '00' : this.place0(_date.getHours());
        this.mins = _default ? '00' : this.place0(_date.getMinutes());
        this.seconds = _default ? '00' : this.place0(_date.getSeconds());

        if (_default) {
            this.dateStr = '';
            this.todayStr = `${_date.getFullYear()}-${_date.getMonth() + 1}-${_date.getDate()}`;
        } else {
            this.dateStr = `${_date.getFullYear()}-${_date.getMonth() + 1}-${_date.getDate()}`;
        }

        this.getYears(this.year);

        this.paintPanel();
    }

    /**
     * 构建日期面板数据
     */
    paintPanel() {
        this.days = [];

        let lastDay = new Date(this.year, this.month, 0).getDate();
        let firstWeekDay = new Date(this.year, this.month - 1, 1).getDay();
        let lastWeekDay = new Date(this.year, this.month, 0).getDay();

        /**
         * 补全上一个月的日期
         */
        for (let i = 0; i < firstWeekDay; i++) {
            let date = new Date(this.year, this.month - 1, - i);
            this.mkDayArray(date, 'prev');
        }

        /**
         * 当月日期
         */
        for (let i = 1; i <= lastDay; i++) {
            let date = new Date(this.year, this.month - 1, i);
            this.mkDayArray(date, 'curr');
        }

        /**
         * 补全下一个月的日期
         */
        for (let i = lastWeekDay; i < 6; i++) {
            let date = new Date(this.year, this.month, i - lastWeekDay + 1);
            this.mkDayArray(date, 'next');
        }

        //将日期分组
        let arr = [], result = [];
        this.days.forEach((item, idx) => {
            arr.push(item);

            if ((idx + 1) % 7 === 0) {
                if (arr && arr.length) result.push(arr);
                arr = [];
            }
        });

        this.days = result;
    }

    /**
     * 构建当前显示月日期数组
     * @param date 
     * @param type 
     */
    mkDayArray(date: any, type: string) {
        let day: any = {};

        day.type = type;
        day.time = date.getTime();
        day.dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        day.day = date.getDate();
        if (!this.exact)
            day.disable = this.isDisable(day.time);

        if (type == 'prev') {
            this.days.unshift(day);
        } else {
            this.days.push(day);
        }
    }

    /**
     * 上一月
     */
    prevMonth() {
        this.month--;
        this.paintPanel();
    }
    /**
     * 下一月
     */
    nextMonth() {
        this.month++;
        this.paintPanel();
    }
    /**
     * 上一年
     */
    prevYear() {
        this.year--;
        this.paintPanel();
    }
    /**
     * 下一年
     */
    nextYear() {
        this.year++;
        this.paintPanel();
    }
    /**
     * 设置年
     */
    setYear(yearObj, $event) {
        $event.stopPropagation();
        if (yearObj.target) {
            this.getYears(yearObj.year);
        } else {
            this.year = yearObj.year;
            if(this.monthPicker) {
                this.pannelType = 2;
                return;
            }
            this.paintPanel();
            this.pannelType = 1;
        }
    }
    /**
     * 设置月
     */
    setMonth(id, $event) {
        $event.stopPropagation();
        if(this.monthPicker) {
            this.selectMonth(id);
            return;
        }
        this.month = id;
        this.paintPanel();
        this.pannelType = 1;
    }
    /**
     * 
     * @param year 
     */
    getYears(year) {
        let minyear = parseInt(year / 10 + '') * 10 - 1,
            maxyear = minyear + 11;

        this.years = [];
        let len = 0,
            _arr = [];
        for (var i = minyear; i <= maxyear; i++) {
            _arr.push({
                year: i,
                target: i == minyear || i == maxyear
            });
            ++len;
            if (len % 3 === 0) {
                this.years.push(_arr);
                _arr = [];
            }
        }
    }

    /**
    * 获取当天
    */
    today() {
        this._time = new Date().getTime();
        this.init();
    }
    /**
     * 选择日期
     * @param day 
     */
    selectDay(day: any, $event: any) {
        $event.stopPropagation();
        this._time = day.time;
        this.dateStr = day.dateStr;
        if (this.exact) {
            if (day.type != 'curr') {
                this.init();
            }
        } else {
            this.timeSetted.emit(this._time);
        }
    }
    /**
     * 选择月份
     */
    selectMonth(month: string) {
        this._time = new Date(this.year, parseInt(month) - 1, 1).getTime();
        this.timeSetted.emit(this._time);
    }
    /**
     * 确认时间
     */
    confirm() {
        //TODO--
        let dateStr = `${this.dateStr} ${this.hour}:${this.mins}:${this.seconds}`;
        this.timeSetted.emit(new Date(dateStr).getTime());
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

    isDisable(date: any) {
        if (this._minDate || this._maxDate) {
            if (date < this._minDate || date > this._maxDate) {
                return true;
            }
        }
        return false;
    }

    //检查时间输入正确性
    validate(variable, type) {
        variable = parseInt(variable);
        if (/\d+/g.test(variable)) {
            if (type == 'hour') {
                if (0 < variable && variable < 24) {
                    this[type] = this.place0(variable).toString();
                } else {
                    this[type] = '00'
                }
            }
            if (type == 'mins' || type == 'seconds') {
                if (0 < variable && variable < 60) {
                    this[type] = this.place0(variable).toString();
                } else {
                    this[type] = '00'
                }
            }
        } else {
            this[type] = '00';
        }
    }

    //月 日 日期补全
    place0(variable: number) {
        return variable < 10 ? '0' + variable : variable;
    }
}