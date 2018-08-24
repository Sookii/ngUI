/**
 * 虚拟滚动条
 * 支持2个方向的拖动，支持 Y 轴方向滚轮
 * 要求 容器具有固定的宽高属性。
 */
import { Directive, Input, ElementRef, HostBinding, HostListener, ComponentRef, Renderer2 } from '@angular/core';
@Directive({
    selector: '[virtualScroller]',
})
export class VirtualScrollerDirective {
    @Input()
    set virtualScroller(value) {
        if (value) {
            this.options = Object.assign({}, this.options, value);
        }
    }
    get virtualScroller() {
        return this.options;
    }

    options: any = {
        barBackground: 'rgba(0, 0, 0, .15)',
        barWidth: 8,
        barOpacity: 1,
        barBorderRadius: 4
    }
    //事件绑定接收对象
    eventListener: any = {};
    xfadeTimer: any;
    yfadeTimer: any;
    //拖动的当前 scroller
    curScroller: any;
    mouseX: number;
    mouseY: number;
    barX: number;
    barY: number;
    //DOM 变化监听
    mutationObserver: MutationObserver;
    mutationThrottleTimeout: number = 50;

    /**
     * 容器与内容
     */
    wrapper: any;
    _container: any;
    _scrollBody: any;

    /**
     * scroller parameter
     * scrollLength => 滚动条总长度, barLength => 滚动块长度, factor => 乘数因子
     */
    yaxisScroller: any;
    xaxisScroller: any;

    constructor(
        private _renderer: Renderer2,
        private el: ElementRef
    ) { }

    ngOnInit() {
        this.viewInit();
    }

    ngAfterViewInit() {
        this.createScroller();

        this.eventListener.resize = this._renderer.listen(window, 'resize', (e) => {
            this.createScroller();
        })
    }

    ngOnDestroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        for (let attr in this.eventListener) {
            this.eventListener[attr]();
        }
    }

    //容器初始化
    viewInit() {
        this._scrollBody = this.el.nativeElement;
        this._container = this._scrollBody.parentNode;

        this._renderer.setStyle(this._container, 'position', 'relative');
        this._renderer.setStyle(this._container, 'overflow', 'hidden');

        this.wrapContainer();

        if (MutationObserver) {
            this.mutationObserver = new MutationObserver((e) => {
                if (this.mutationThrottleTimeout) {
                    clearTimeout(this.mutationThrottleTimeout);
                    this.mutationThrottleTimeout = setTimeout(this.onMutation.bind(this), 50);
                }
            });
            this.mutationObserver.observe(this._container, { subtree: true, childList: true });
            //用于父元素 [hidden] 绑定的修正，需要手动对当前 DOM 元素设置一个随机的属性
            this.mutationObserver.observe(this._scrollBody, { attributes: true });
        }
    }

    wrapContainer(): void {
        this.wrapper = this._renderer.createElement('div');

        this._renderer.setStyle(this.wrapper, 'position', 'absolute');
        this._renderer.setStyle(this.wrapper, 'overflow', 'hidden');
        this._renderer.setStyle(this.wrapper, 'display', 'inline-block');
        this._renderer.setStyle(this.wrapper, 'margin', '-' + getComputedStyle(this._container).padding);
        this._renderer.setStyle(this.wrapper, 'padding', getComputedStyle(this._container).padding);
        this._renderer.setStyle(this.wrapper, 'width', '100%');
        this._renderer.setStyle(this.wrapper, 'height', '100%');

        this._container.insertBefore(this.wrapper, this._scrollBody);
        this.wrapper.appendChild(this._scrollBody);
    }

    onMutation() {
        this.createScroller();
    }
    /**
     * 创建滚动条对象
     */
    createScroller() {
        //创建 y 轴滚动条
        if (this._scrollBody.offsetHeight > this.wrapper.offsetHeight) {
            if (!this.yaxisScroller) {
                this.yaxisScroller = {};
                this.yaxisScroller.axis = 'y';
                this.yaxisScroller.scrollLength = this.wrapper.offsetHeight;
                this.yaxisScroller.factor = this.wrapper.offsetHeight / this._scrollBody.offsetHeight;
                this.yaxisScroller.barLength = this.yaxisScroller.factor * this.yaxisScroller.scrollLength;

                this.initBar(this.yaxisScroller, 'y');
            } else {
                this.updateBar(this.yaxisScroller);
            }
        } else {
            if (this.yaxisScroller) {
                this._container.removeChild(this.yaxisScroller.DOMEl);
                delete this.yaxisScroller;
            }
        }

        //创建 x 轴滚动条
        if (this._scrollBody.offsetWidth > this.wrapper.offsetWidth) {
            if (!this.xaxisScroller) {
                this.xaxisScroller = {};
                this.xaxisScroller.axis = 'x';
                this.xaxisScroller.scrollLength = this.wrapper.offsetWidth;
                this.xaxisScroller.factor = this.wrapper.offsetWidth / this._scrollBody.offsetWidth;
                this.xaxisScroller.barLength = this.xaxisScroller.factor * this.xaxisScroller.scrollLength;

                this.initBar(this.xaxisScroller, 'x');
            } else {
                this.updateBar(this.xaxisScroller);
            }
        } else {
            if (this.xaxisScroller) {
                this._container.removeChild(this.xaxisScroller.DOMEl);
                delete this.xaxisScroller;
            }
        }
    }

    initBar(scroller: any, axis: string): void {
        scroller.DOMEl = this._renderer.createElement('div');

        this._renderer.addClass(scroller.DOMEl, 'virtual-scroller-bar');
        this._renderer.setStyle(scroller.DOMEl, 'position', 'absolute');
        if (axis == 'y') {
            this._renderer.setStyle(scroller.DOMEl, 'top', '0');
        } else {
            this._renderer.setStyle(scroller.DOMEl, 'left', '0');
        }
        this._renderer.setStyle(scroller.DOMEl, axis == 'y' ? 'right' : 'bottom', '0');
        this._renderer.setStyle(scroller.DOMEl, 'width', axis == 'y' ? `${this.options.barWidth}px` : `${scroller.barLength}px`);
        this._renderer.setStyle(scroller.DOMEl, 'height', axis == 'y' ? `${scroller.barLength}px` : `${this.options.barWidth}px`);
        this._renderer.setStyle(scroller.DOMEl, 'margin', '1px');
        this._renderer.setStyle(scroller.DOMEl, 'background', this.options.barBackground);
        this._renderer.setStyle(scroller.DOMEl, 'opacity', this.options.barOpacity);
        this._renderer.setStyle(scroller.DOMEl, 'display', 'block');
        this._renderer.setStyle(scroller.DOMEl, 'cursor', 'pointer');
        this._renderer.setStyle(scroller.DOMEl, 'z-index', '100');
        this._renderer.setStyle(scroller.DOMEl, 'border-radius', `${this.options.barBorderRadius}px`);

        //指定滚动条位置修正
        if (this.options.top) {
            this._renderer.setStyle(scroller.DOMEl, 'top', `${this.options.top}px`);
            this._renderer.removeStyle(scroller.DOMEl, 'bottom');
        } else if (this.options.left) {
            this._renderer.setStyle(scroller.DOMEl, 'top', `${this.options.left}px`);
            this._renderer.removeStyle(scroller.DOMEl, 'right');
        }

        this._container.appendChild(scroller.DOMEl);

        if (axis == 'y') {
            this.eventListener[axis] = this._renderer.listen(this._scrollBody, 'mousewheel', (e) => {
                this.mouseWheel(scroller, e);
            });
            //火狐浏览器
            this.eventListener[axis] = this._renderer.listen(this._scrollBody, 'DOMMouseScroll', (e) => {
                this.mouseWheel(scroller, e);
            });
        }

        setTimeout(() => {
            this.eventListener.mouseDown = this._renderer.listen(scroller.DOMEl, 'mousedown', (e) => {
                this.onMouseDown(scroller, e);
            });
            this.eventListener.mouseMove = this._renderer.listen(document, 'mousemove', (e) => {
                this.onMouseMove(scroller, axis, e);
            });
            this.eventListener.mouseUp = this._renderer.listen(document, 'mouseup', (e) => {
                this.onMouseUp();
            });
            this.eventListener.update = this._renderer.listen(this.wrapper, 'scroll', (e) => {
                this.updateScroll(scroller, e)
            });
        })
    }

    updateBar(scroller: any) {
        if (scroller.axis == 'y') {
            scroller.scrollLength = this.wrapper.offsetHeight;
            scroller.factor = this.wrapper.offsetHeight / this._scrollBody.offsetHeight;
            scroller.barLength = scroller.factor * scroller.scrollLength;
            this._renderer.setStyle(scroller.DOMEl, 'width', `${this.options.barWidth}px`);
            this._renderer.setStyle(scroller.DOMEl, 'height', `${scroller.barLength}px`);
        } else {
            scroller.scrollLength = this.wrapper.offsetWidth;
            scroller.factor = this.wrapper.offsetWidth / this._scrollBody.offsetWidth;
            scroller.barLength = scroller.factor * scroller.scrollLength;
            this._renderer.setStyle(scroller.DOMEl, 'width', `${scroller.barLength}px`);
            this._renderer.setStyle(scroller.DOMEl, 'height', `${this.options.barWidth}px`);
        }
    }

    /**
     * 内容 scroll 改变后更新位置
     * @param scroller 
     * @param e 
     */
    updateScroll(scroller: any, e: any) {
        if (this[scroller.axis + 'fadeTimer']) {
            clearInterval(this[scroller.axis + 'fadeTimer']);
            this[scroller.axis + 'fadeTimer'] = null;
        }
        this[scroller.axis + 'fadeTimer'] = setTimeout(_ => {
            this._renderer.removeClass(scroller.DOMEl, 'active');
        }, 800);

        if (scroller.axis == 'x') {
            let deltaX = e.target.scrollLeft * scroller.factor;
            this._renderer.setStyle(scroller.DOMEl, 'left', `${deltaX}px`);
        } else if (scroller.axis == 'y') {
            let deltaY = e.target.scrollTop * scroller.factor;
            this._renderer.setStyle(scroller.DOMEl, 'top', `${deltaY}px`);
        }
    }

    /**
     * 鼠标滚轮 滚轮只支持 Y 轴方向
     * @param scroller 
     * @param e 
     */
    mouseWheel(scroller: any, e: any) {
        let distance = (e.wheelDeltaY || -e.detail * 10) / 2;
        let delta, multiplier;
        distance = distance > 18 ? 18 : distance < -18 ? -18 : distance;
        multiplier = Math.abs(distance / 3);

        if (distance / scroller.factor < -30) {
            distance = -scroller.factor * 30 * multiplier;
        } else if (distance / scroller.factor > 30) {
            distance = scroller.factor * 30 * multiplier;
        }

        delta = parseInt(getComputedStyle(scroller.DOMEl).top, 10) - distance;
        delta = delta < 0 ? 0 : delta > (this._container.offsetHeight - scroller.barLength) ? (this._container.offsetHeight - scroller.barLength) : delta;

        if (delta > 0 && delta < this._container.offsetHeight - scroller.barLength) {
            e.preventDefault();
        }

        this._renderer.setStyle(scroller.DOMEl, 'top', `${delta}px`);

        if (this.wrapper.scrollTo) {
            this.wrapper.scrollTo(this.wrapper.scrollLeft, (delta / scroller.factor));
        } else {
            this.wrapper.scrollTop = delta / scroller.factor;
        }

        this._renderer.addClass(scroller.DOMEl, 'active');
    }

    /**
     * 拖拽滚动条
     */
    onMouseDown(scroller: any, e: any) {
        e.preventDefault();
        this.curScroller = scroller;

        this.mouseX = e.pageX;
        this.mouseY = e.pageY;
        if (this[scroller.axis + 'fadeTimer']) {
            clearInterval(this[scroller.axis + 'fadeTimer']);
            this[scroller.axis + 'fadeTimer'] = null;
        }
        this._renderer.addClass(scroller.DOMEl, 'active');
        if (this.curScroller.axis == 'x') {
            this.barX = parseInt(getComputedStyle(scroller.DOMEl).left, 10);
        } else if (this.curScroller.axis == 'y') {
            this.barY = parseInt(getComputedStyle(scroller.DOMEl).top, 10);
        }
    }
    onMouseMove(scroller: any, axis: string, e: any) {
        if (this.curScroller) {
            let delta;

            if (axis == 'y' && this.curScroller.axis == 'y') {
                delta = this.barY + e.pageY - this.mouseY;
                delta = delta < 0 ? 0 : delta > (this._container.offsetHeight - this.yaxisScroller.barLength) ? (this._container.offsetHeight - this.yaxisScroller.barLength) : delta;

                this._renderer.setStyle(scroller.DOMEl, 'top', `${delta}px`);

                if (this.wrapper.scrollTo) {
                    this.wrapper.scrollTo(this.wrapper.scrollLeft, (delta / scroller.factor));
                } else {
                    this.wrapper.scrollTop = delta / scroller.factor;
                }

            } else if (axis == 'x' && this.curScroller.axis == 'x') {
                delta = this.barX + e.pageX - this.mouseX;
                delta = delta < 0 ? 0 : delta > (this._container.offsetWidth - this.xaxisScroller.barLength) ? (this._container.offsetWidth - this.xaxisScroller.barLength) : delta;

                this._renderer.setStyle(scroller.DOMEl, 'left', `${delta}px`);

                if (this.wrapper.scrollTo) {
                    this.wrapper.scrollTo((delta / scroller.factor), this.wrapper.scrollTop);
                } else {
                    this.wrapper.scrollLeft = delta / scroller.factor;
                }
            }
        }
    }
    onMouseUp() {
        this.curScroller = null;
    }
}