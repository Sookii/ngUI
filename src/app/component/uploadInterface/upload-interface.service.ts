import { ComponentFactoryResolver, Injectable, Inject, ViewRef } from '@angular/core';
import { UploadInterfaceComponent, Mission } from './upload-interface.component';
import { Observable, Subject } from 'rxjs';
@Injectable()
export class UploadInterfaceService {
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
     * 上传返回
     */
    uploadResponse$ = new Subject<any>();


    constructor(@Inject(ComponentFactoryResolver) factoryResolver: ComponentFactoryResolver) {
        this.factoryResolver = factoryResolver;
    }
    /**
     * 从根组件初始化，获得渲染容器
     * @param viewContainerRef 
     */
    setRootViewContainerRef(viewContainerRef: any) {
        this.rootViewContainer = viewContainerRef;
    }
    /**
     * 创建并向容器中添加组件
     */
    addDynamicComponent(mission: any) {
        const factory = this.factoryResolver.resolveComponentFactory(UploadInterfaceComponent);
        this.component = factory.create(this.rootViewContainer.parentInjector);
        this.viewRef = this.component.hostView;
        this.rootViewContainer.insert(this.component.hostView);

        this.component.instance.missionQuery.push(mission);
    }
    /**
     * 从容器中移除 指定 viewRef
     * @param viewRef 
     */
    removeComponent(viewRef: ViewRef) {
        this.rootViewContainer.remove(this.rootViewContainer.indexOf(viewRef));
    }

    /**
     * 开始上传
     */
    upload(xhr: XMLHttpRequest, formData: FormData, file: any) {
        let mission: Mission = new Mission();
        mission.xhr = xhr;
        mission.formData = formData;
        mission.filename = file.name;
        mission.filesize = file.size;
        /**
         * 如果有已经存在上传列表，直接在当前列表添加
         */
        if (this.rootViewContainer.length > 0) {
            this.component.instance.missionQuery.push(mission);
            this.component.instance.uploading();
            this.component.instance.fireCalc();
            return;   
        }
        /**
         * 创建上传列表
         */
        this.addDynamicComponent(mission);
    }
}