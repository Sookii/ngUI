import { ComponentFactoryResolver, Injectable, Inject, ViewRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PromptComponent } from './prompt.component';
@Injectable()
export class PromptService {
    factoryResolver: any;
    /**
     * 渲染容器
     */
    rootViewContainer: any;
    /**
     * 当前渲染的宿主元素
     */
    viewRef: ViewRef;
    /**
     * 创建的组件
     */
    component: any;
    /**
     * Observable 对象
     */
    result$ = new Subject<boolean>();

    ignoreNext: boolean;
    constructor(@Inject(ComponentFactoryResolver) factoryResolver: ComponentFactoryResolver) {
        this.factoryResolver = factoryResolver
    }
    setRootViewContainerRef(viewContainerRef: any) {
        this.rootViewContainer = viewContainerRef
    }
    addDynamicComponent() {
        const factory = this.factoryResolver.resolveComponentFactory(PromptComponent);
        this.component = factory.create(this.rootViewContainer.parentInjector);
        this.viewRef = this.component.hostView;
        this.rootViewContainer.insert(this.component.hostView);
    }

    /*需要处理的业务逻辑*/
    handle: string;     //当前操作名称
    paramObj: any;      //当前操作出参数

    excute(handle: string, paramObj: any, source?: string) {
        this.handle = handle;
        this.paramObj = paramObj;
        
        if(source != 'apiError') {
            /* 接收到非接口错误弹窗时，设置忽略下一次弹窗不拦截，用于弹窗发起接口后报错时弹窗被错误拦截 */
            this.ignoreNext = true;
        }

        if (source == 'apiError' && !this.ignoreNext && (handle == 'prompt' || handle == 'alert') && this.rootViewContainer.length > 0) {
            this.ignoreNext = false;
            return
        }

        this.addDynamicComponent();

        /* 来自路由守卫的弹窗，返回一个 observable 对象 */
        if(source == 'deactivate') {
            return this.result$;
        }    
    }

    removeComponent(viewRef: ViewRef) {
        this.rootViewContainer.remove(this.rootViewContainer.indexOf(viewRef));
    }

    close() {
        this.component.instance.close();
    }
}