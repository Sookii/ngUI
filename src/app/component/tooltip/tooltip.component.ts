import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, ElementRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Observable';
@Component({
    selector: 'tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss'],
})
export class TooltipComponent {
    @Input()
    set title(value) {
        this._title = value;
    } 
    get title() {
        return this._title;
    }

    @Input()
    set trigger(value) {
        this._trigger = value;
    }
    get trigger() {
        return this._trigger;
    }

    @Input()
    set position(value) {
        this._position = value;
    }
    get position() {
        return this._position;
    }
    
    @ContentChild('innerTemplate') innerTemplate: TemplateRef<any>;

    _title: string = 'tips';
    _trigger: string = 'hover';
    _position: string = 'tc';    //tc tr rt rc rb br bc bl lb lc lt  TODO--
    _visible: boolean = false;
    _fixed: boolean = false;
    _fixPos: any;

    _triggerListen: any = {};
    constructor(public elementRef: ElementRef, private _renderer: Renderer2) {
        
    }

    ngAfterViewInit() {
        if (this._trigger === 'hover') {
            this._triggerListen.enter = this._renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => this.show());
            this._triggerListen.leave = this._renderer.listen(this.elementRef.nativeElement, 'mouseleave', () => this.hide());
        } else if (this._trigger === 'focus') {
            this._triggerListen.focus = this._renderer.listen(this.elementRef.nativeElement, 'focus', () => this.show());
            this._triggerListen.blur = this._renderer.listen(this.elementRef.nativeElement, 'blur', () => this.hide());
        } else if (this._trigger === 'click') {
            this._triggerListen.click = this._renderer.listen(this.elementRef.nativeElement, 'click', (e) => {
                e.preventDefault();
                this.show()
            });
        }
    }

    ngOnDestroy() {
        for (let attr in this._triggerListen) {
            this._triggerListen[attr]();
        }
    }

    show(el?: any) {
        if(el) {
            this._fixed = true;
            this._fixPos = el.position;
            this.title = el.tooltip;
        }
        this._visible = true;
    }

    hide() {
        this._visible = false;
    }
}