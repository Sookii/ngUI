import { Directive, Input, ElementRef, HostBinding, HostListener, ViewContainerRef, ComponentRef, ComponentFactoryResolver, Renderer2 } from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { layoutFixed } from '../utils/position';
@Directive({
    selector: '[tooltip]',
})
export class TooltipDirective {
    @Input() tooltip: string;
    position: any;
    cache: any;
    _triggerListen: any = {};
    private componentRef: ComponentRef<TooltipComponent>;
    constructor(
        private _renderer: Renderer2,
        private elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver
    ) { }

    ngAfterViewInit() {
        this._triggerListen.enter = this._renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => this.viewInit());
        this._triggerListen.leave = this._renderer.listen(this.elementRef.nativeElement, 'mouseleave', () => { this.cache.instance.hide() });
    }

    ngOnDestroy() {
        for (let attr in this._triggerListen) {
            this._triggerListen[attr]();
        }
    }

    viewInit() {
        this.position = layoutFixed(this.elementRef.nativeElement);
        //待优化
        this.position.left = parseFloat(this.position.left.substr(0, this.position.left.length - 2)) + this.elementRef.nativeElement.offsetWidth / 2 + 'px';

        if (this.cache && this.cache.instance) {
            this.cache.instance.show(this);
            return;
        }

        this.cache = this.viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(TooltipComponent));

        this.cache.instance.show(this);
    }
}