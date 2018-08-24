import { Component, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
@Component({
    selector: 'dropdown',
    templateUrl: './dropdown.component.html',
    styles: [`
        .select-list {
            min-width: 80px;
            position: fixed;
            z-index: 1;
        }
    `],
})
export class DropdownComponent {

    @Input()
    set trigger(value) {
        this._trigger = value;
    }
    get trigger() {
        return this._trigger;
    }

    @Input()
    set horizontal(value) {
        this._horizontal = value;
    }
    get horizontal() {
        return this._horizontal;
    }

    @Input()
    set vertival(value) {
        this._vertival = value;
    }
    get vertival() {
        return this._vertival;
    }

    @Input()
    set boundary(value) {
        this._boundary = value;
    }
    get boundary() {
        return this._boundary;
    }

    @ViewChild('ipDropdown') hostEl: ElementRef;


    _trigger: string = 'click';
    _triggerListen: any = {};
    /**
     * 下拉列表位置
     */
    _horizontal: string = 'r';    //l
    _vertival: string = 'b';      //t
    /**
     * 相对于页面的位置信息
     */
    positionInfo: any;
    _left: number;
    _top: number;
    _right: number;
    _bottom: number;
    _threshold: number = 200;   //阈值

    _visible: boolean = false;

    _boundary: number = 2;
    constructor(public elementRef: ElementRef, private _renderer: Renderer2) {

    }

    ngOninit() {

    }

    ngAfterViewInit() {
        //事件绑定
        if (this._trigger === 'hover') {
            this._triggerListen.mouseenter = this._renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => this.show());
            this._triggerListen.mouseleave = this._renderer.listen(this.elementRef.nativeElement, 'mouseleave', () => this.hide());
        } else if (this._trigger === 'click') {
            this._triggerListen.clickShow = this._renderer.listen(this.elementRef.nativeElement, 'click', (e) => {
                e.preventDefault();
                this.setPosition();
                this._visible = !this._visible;
            });

            this._triggerListen.clickHide = this._renderer.listen(document, 'click', (e) => this.hide(e))
        }
    }

    ngOnDestroy() {
        for (let attr in this._triggerListen) {
            this._triggerListen[attr]();
        }
    }

    /**
     * 设置下拉列表在页面上的位置。
     */
    setPosition() {
        this.positionInfo = this.hostEl.nativeElement.getBoundingClientRect();

        if (window.innerHeight - this.positionInfo.bottom < this._threshold) {
            this._vertival = 't';
            this._bottom = window.innerHeight - this.positionInfo.top + this._boundary;
        } else {
            this._top = this.positionInfo.bottom + this.boundary;
        }

        if (this._horizontal == 'r') {
            this._right = window.innerWidth - this.positionInfo.right;
        } else {
            this._left = this.positionInfo.left;
        }
    }

    show() {
        this.setPosition();
        this._visible = true;
    }

    hide(e?: any) {
        if (e) {
            if (this._visible && this.chcekElChain(e.target, this.hostEl)) {
                e.stopPropagation();
            } else {
                this._visible = false;
            }
        } else {
            this._visible = false;
        }
    }

    /**
     * 冒泡检查是否点击了某个元素或其子元素
     * @param _el => 点击元素
     * @param el => 目标元素
     */
    chcekElChain(_el: any, el: any): boolean {
        if (_el == el.nativeElement) {
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