import { Directive, Input, HostListener, ElementRef, Output, EventEmitter, Renderer2 } from '@angular/core';
import { layoutFixed } from '../utils/position';

@Directive({
    selector: '[draggable]'
})

export class DragDirective {
    @Input()
    set draggable(value) {
        if (value) {
            this.fullCoverage = value;
        }
    }

    fullCoverage: boolean;

    transformed: boolean = true;
    target: any;
    mouseX: number;
    mouseY: number;
    elX: number;
    elY: number;
    disX: number;
    disY: number;

    eventsListen: any = {};

    constructor(private el: ElementRef, private _renderer: Renderer2) {

    }

    ngAfterViewInit() {
        this.eventsListen.mousedown = this._renderer.listen(this.el.nativeElement, 'mousedown', ($event) => this.onMousedown($event));
        this.eventsListen.mousemove = this._renderer.listen(document, 'mousemove', ($event) => this.onMouseMoving($event));
        this.eventsListen.mouseup = this._renderer.listen(document, 'mouseup', ($event) => this.onMouseup());
        this.eventsListen.resize = this._renderer.listen(window, 'resize', () => this.modifyPosition());
    }

    ngOnDestroy() {
        for(let attr in this.eventsListen) {
            this.eventsListen[attr]();
        }
    }

    /**
     * 窗口定位修正
     */
    modifyPosition() {
        if(this.el.nativeElement.offsetTop < 0) {
            this.el.nativeElement.style.top = this.el.nativeElement.offsetHeight/2 + 'px';
        }
    }


    onMousedown($event: any) {
        if (this.fullCoverage || this.chcekElChain($event.target)) {
            $event.stopPropagation();
            this.target = this.el.nativeElement;
            this.mouseX = $event.pageX;
            this.mouseY = $event.pageY;
            this.elX = parseInt(layoutFixed(this.target).left);
            this.elY = parseInt(layoutFixed(this.target).top);
        }
    }

    onMouseMoving($event: any) {
        if (this.target) {
            this.disX = $event.pageX - this.mouseX + (this.transformed ? this.target.offsetWidth / 2 : 0);
            this.disY = $event.pageY - this.mouseY + (this.transformed ? this.target.offsetHeight / 2 : 0);;

            this.target.style.left = this.restrictBoundary(this.elX + this.disX, 'x');
            this.target.style.top = this.restrictBoundary(this.elY + this.disY, 'y');
        }
    }

    restrictBoundary(dis: number, axis: string) {
        if (axis == 'x') {
            let boundaryXL = this.transformed ? this.target.offsetWidth / 2 : 0;
            let boundaryXR = this.transformed ? window.innerWidth - this.target.offsetWidth / 2 : window.innerWidth - this.target.offsetWidth;
            if (dis < boundaryXL) {
                dis = boundaryXL;
            } else if (dis > boundaryXR) {
                dis = boundaryXR;
            }
        } else {
            let boundaryYT = this.transformed ? this.target.offsetHeight / 2 : 0;
            let boundaryYB = this.transformed ? window.innerHeight - this.target.offsetHeight / 2 : window.innerHeight - this.target.offsetHeight;
            if (dis < boundaryYT) {
                dis = boundaryYT;
            } else if (dis > boundaryYB) {
                dis = boundaryYB;
            }
            //y轴方向，顶部限制优先
            dis = dis < this.el.nativeElement.offsetHeight/2 ? this.el.nativeElement.offsetHeight/2 : dis;
        }
        return dis + 'px';
    }

    onMouseup() {
        this.target = null;
    }

    chcekElChain(_el: any): boolean {
        if (_el.id == 'dragTarget') {
            return true;
        } else {
            if (!_el.parentElement || _el.parentElement == this.el.nativeElement) {
                return false;
            } else {
                return this.chcekElChain(_el.parentElement);
            }
        }
    }
}
