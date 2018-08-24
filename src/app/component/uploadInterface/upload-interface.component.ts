import { Component, forwardRef, Inject, OnInit, ViewRef, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { UploadInterfaceService } from './upload-interface.service';

export class Mission {
    xhr: XMLHttpRequest;
    formData: FormData;
    filename: string;
    filesize: number;   //通过 file 读取的文件大小
    loaded: number;     //当前已上传的文件大小
    total: number;      //实际要上传的总大小
    progress: any;
    abort: boolean;     //是否取消
    status: number;     // 0 => 未开始, 100 => 上传中, 200 => 上传成功, 300 => 上传取消, 500 => 上传失败
    constructor() {
        this.progress = 0;
        this.status = 0;
    }
}

@Component({
    selector: 'upload-interface',
    templateUrl: './upload-interface.component.html',
    styleUrls: ['./upload-interface.component.scss']
})

export class UploadInterfaceComponent implements OnInit {
    private viewRef: ViewRef;
    /**
     * 上传任务队列
     */
    missionQuery: any[] = [];
    fullThread: number = 2;             //同时上传的最大 ajax 接口数，防止页面其他操作阻塞
    counter: number = 0;                //当前上传接口数

    minimal: boolean;                   //最小化窗口
    positionInfo: any = {};             //最小化前窗口的位置

    totalSize: number = 0;              //总文件大小
    totalLoadedSize: number = 0;        //总上传文件大小
    totalProgress: string;              //总上传进度

    progressTimer: any;

    statusTips: any = {
        '0': '等待中...',
        '100': '上传中...',
        '200': '上传成功',
        '300': '上传取消',
        '500': '上传失败'
    }

    @ViewChild('uploadInterface') uploadInterface: ElementRef;

    constructor(
        @Inject(forwardRef(() => UploadInterfaceService)) private uploadInterfaceService: UploadInterfaceService,
        private _renderer: Renderer2
    ) { }

    ngOnInit() {
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'top', '50%');
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'left', '50%');
    }

    ngAfterViewInit() {
        this.viewRef = this.uploadInterfaceService.viewRef;
        //开启任务，同事开启队列轮询, 并计算任务进度
        this.uploading();

        this.fireCalc();
    }

    fireCalc() {
        if (this.progressTimer) return;
        this.progressTimer = setInterval(() => {
            this.calcProgress();
        }, 200);
    }
    /**
     * 计算当前总进度
     */
    calcProgress() {
        this.totalSize = 0;
        this.totalLoadedSize = 0;
        for (let mission of this.missionQuery) {
            if (mission.status == 0) {
                //为开始上传的文件，按照文件大小计算
                this.totalSize += mission.filesize;
            } else {
                //开始上传或上传完毕的文件，按照实际上传大小计算
                this.totalSize += mission.total ? mission.total : mission.filesize;
                this.totalLoadedSize += mission.loaded ? mission.loaded : 0;
            }
        }

        if (this.totalSize == 0) {
            //当前无任务
            this.totalProgress = '空闲';
        } else {
            this.totalProgress = (this.totalLoadedSize / this.totalSize * 100).toFixed(1) + '%';
        }

        if (this.totalLoadedSize == this.totalSize || this.counter == 0) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }
    }

    /**
     * 上传任务队列控制
     */
    uploading() {
        if (this.counter >= 3) return;
        let silenceMission = this.missionQuery.filter(el => {
            return el.status == 0;
        });

        //没有等待任务时返回
        if (silenceMission.length == 0) {
            return;
        }

        //当前可用的任务数
        let availableMissionLength = silenceMission.length > 3 - this.counter ? 3 - this.counter : silenceMission.length;

        for (let i = 0; i < availableMissionLength; i++) {
            this.fireAjax(silenceMission[i]);
            silenceMission[i].status = 100;
            this.counter++;
        }
    }

    fireAjax(mission: any) {
        let xhr = mission.xhr;

        xhr.upload.onprogress = ($event) => {
            mission.loaded = $event.loaded;
            mission.total = $event.total;
            mission.progress = $event.loaded / $event.total * 100 + '%';
        }
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState == 4) {
                this.counter--;
                this.uploading(); //当前任务完成后，从新检查队列

                if (xhr.status == 200) {
                    mission.status = 200;
                    /* 文件上传完成后通知外部查看结果 */
                    this.uploadInterfaceService.uploadResponse$.next(JSON.parse(xhr.response));
                } else {
                    if (mission.abort) {
                        mission.status = 300;
                    } else {
                        mission.status = 500;
                    }
                }
            }
        };

        xhr.send(mission.formData);
    }

    /**
     * 关闭任务
     * 未开始或已完成的任务直接移出队列，已开始的任务终止
     */
    closeMission(mission: any) {
        if (mission.status != 100) {
            this.missionQuery.splice(this.missionQuery.indexOf(mission), 1);
            this.calcProgress();
        } else {
            mission.abort = true;
            mission.xhr.abort();
        }
    }

    /**
     * 最小化窗口
     */
    minimize($event: any) {
        $event.stopPropagation();
        this.positionInfo = this.uploadInterface.nativeElement.getBoundingClientRect();
        this.minimal = true;
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'transition', 'left .15s ease-in, top .15s ease-in');
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'top', '80px');
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'left', window.innerWidth - 150 + 'px');
        setTimeout(() => {
            this._renderer.removeStyle(this.uploadInterface.nativeElement, 'transition');
        }, 150);
    }
    /**
     * 最大化窗口
     */
    maximize($event: any) {
        this.minimal = false;
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'transition', 'left .15s ease-in, top .15s ease-in');
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'top', this.positionInfo.top + this.positionInfo.height / 2 + 'px');
        this._renderer.setStyle(this.uploadInterface.nativeElement, 'left', this.positionInfo.left + this.positionInfo.width / 2 + 'px');
        setTimeout(() => {
            this._renderer.removeStyle(this.uploadInterface.nativeElement, 'transition');
        }, 150);
    }
    /**
     * 关闭窗口
     * TODO--关闭逻辑还未确认。暂定还有未完成任务的前提下不能关闭。
     */
    close() {
        if (this.counter != 0) {
            return;
        } else {
            this.uploadInterfaceService.removeComponent(this.viewRef);
        }
    }
}