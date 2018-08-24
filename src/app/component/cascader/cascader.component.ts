/**
 * 多级联动数据下拉选择组件
 * 支持同步传入树形结构数据，或异步获取下级数据冰缓存
 */
import { Component, OnInit, Input, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'cascader, [cascader]',
    templateUrl: './cascader.component.html',
    styleUrls: ['./cascader.component.css'],
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ height: 0 }),
                animate(150)
            ]),
            transition(':leave', [
                animate(150, style({ height: 0 }))
            ])
        ])
    ]
})
export class CascaderComponent implements OnInit {
    @Input()
    set initValue(value) {
        if (value) {
            if (typeof (value) == 'string') {
                this._curResultStr = value;
            } else {
                this.constructResultString();
            }
        } else {
            this._curResultStr = '';
        }
    }

    @Input()
    set cascaderTree(value) {
        if (value) {
            this._cascaderTree = value;
            this._uiList[0] = this._cascaderTree;
        }
    }
    get cascaderTree() {
        return this._cascaderTree;
    }

    @Input()
    set cascaderChildren(value) {
        if (value && this.hangUp) {
            this.hangUp = false;
            this._curResult[this._curResult.length - 1] && (this._curResult[this._curResult.length - 1].children = value);       //缓存
            this._uiList.push(value);
        }
    }

    @Input()
    set options(value) {
        if (value) {
            this._options = Object.assign(this._options, value);
        }
    }
    get options() {
        return this._options;
    }


    @Output() getNextLevel: EventEmitter<any> = new EventEmitter();
    @Output() outputResult: EventEmitter<any> = new EventEmitter();

    /* 配置 */
    _options: any = {
        key: 'name',        //显示字段
        async: true,        //是否异步加载数据
    };
    /* 渲染方式 */
    renderType: number;     //1 => 组件模式渲染， 2 => 原生元素渲染

    /* 数据源 */
    _cascaderTree: any[] = [];
    /* UI 对象 */
    _uiList: any[] = [];

    /* 操作数据源 */
    _curTarget: any;
    _curResult: any[] = [];
    _curResultStr: string = '';

    /* 操作状态 */
    active: boolean = false;
    hangUp: boolean = false;    //等待状态，异步模式下等待前一次数据返回，防止缓存错误
    /* 时间监听对象 */
    listener: any = {};

    constructor(private _renderer: Renderer2, private el: ElementRef) {
        this.listener.close = this._renderer.listen(document, 'click', (e) => {
            this.close(e);
        });

        this.renderByEl(this.el);
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        for (let attr in this.listener) {
            this.listener[attr]();
        }
    }

    /**
     * 渲染
     */
    renderByEl(el: ElementRef) {
        if (this.el.nativeElement.localName == 'cascader') {
            //选择器模式渲染
            this.renderType = 1;
        } else {
            //原生元素渲染 不支持 input 之类的元素
            this.renderType = 2;
            this._renderer.setStyle(this.el.nativeElement, 'position', 'relative');
            this.listener.render = this._renderer.listen(this.el.nativeElement, 'click', (e) => {
                this.active = !this.active;
            });
        }
    }

    /**
     * 
     * @param item 
     * @param level 
     */
    checkItem(item: any, level: number, $event: any) {
        $event.stopPropagation();
        if (this._curTarget == item) return;
        this._curTarget = item;
        //重置两个数组到当前状态
        this._curResult.splice(level, this._curResult.length - level);
        this._uiList.splice(level + 1, this._uiList.length - level - 1);

        this._curResult.push(item);

        if (item.hasChildren) {
            if (this._options.async && !item.children) {
                //向外请求下一级数据 TODO--
                if (this.hangUp) return;
                this.getNextLevel.emit(item);
                this.hangUp = true;
            }
            if (item.children && item.children.length > 0) {    //容错机制
                this._uiList.push(item.children);
            }
        } else {
            this.active = false;
        }

        //构建字符串
        this.constructResultString();

        this.outputResult.emit(this._curResult);
    }

    constructResultString() {
        let arr = [];
        for (let item of this._curResult) {
            arr.push(item[this._options.key]);
        }

        this._curResultStr = arr.join('/');
    }

    inCurResult(item: any, level: number) {
        if (this._options.checkedKey) {
            return this._curResult[level] && this._curResult[level][this._options.checkedKey] == item[this._options.checkedKey];
        }
    }

    /**
     * 清除当前选中
     */
    clear($event: any) {
        $event.stopPropagation();
        this._curTarget = {};
        //重置两个数组
        this._curResult = [];
        this._uiList.splice(1, this._uiList.length);
        this._curResultStr = '';

        this.outputResult.emit(this._curResult);
    }

    /**
     * 
     */
    close($event: any) {
        if (!(this.chcekElChain($event.target, this.el.nativeElement))) {
            this.active = false;
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