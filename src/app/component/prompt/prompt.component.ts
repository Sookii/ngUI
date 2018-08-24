import { Component, forwardRef, Inject, OnInit, ViewRef, ElementRef, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { PromptService } from './prompt.service';
@Component({
    selector: 'prompt-component',
    template: `
		<div class="prompt" [@fadeInOut]="state" (@fadeInOut.done)="voidCallback($event)" *ngIf="show && handle != 'tips'">
			<div class="prompt-dialog" [class.showing]="show" [class.hiding]="hiding">
				<div class="prompt-dialog-content">
                    <i class="iconfont icon-warning-fill icon-yellow" *ngIf="tipsType == 'warning'"></i>
                    <i class="iconfont icon-close-fill icon-red" *ngIf="tipsType == 'error'"></i>
                    <i class="iconfont icon-check-fill icon-green" *ngIf="tipsType == 'success'"></i>
					<div class="text-content">
						<h3 class="main-text">{{tip}}</h3>
						<div class="sub-text" *ngIf="otherTip">
							{{otherTip}}
                        </div>
					</div>
				</div>
				<div class="prompt-footer btns-collection">
				    <button #verifyBtn class="ip-btn ip-btn-primary" style="height:32px;width:64px;" (click)="fnHandle('successCallback')">确认</button>
                    <button class="ip-btn ip-btn-outline-default" *ngIf="handle == 'prompt' && !noCancel" style="height:32px;width:64px;"  (click)="fnHandle('closeCallback')">取消</button>
				</div>
			</div>
		</div>
		<div class="hints" [@floatInOut]="state" (@floatInOut.done)="voidCallback($event)" *ngIf="show && handle == 'tips'">
            <i class="iconfont icon-warning-fill icon-yellow" *ngIf="tipsType == 'warning'"></i>
            <i class="iconfont icon-close-fill icon-red" *ngIf="tipsType == 'error'"></i>
            <i class="iconfont icon-check-fill icon-green" *ngIf="tipsType == 'success'"></i>
            {{tip}}
		</div>
    `,
    animations: [
        trigger('fadeInOut', [
            state('active', style({ backgroundColor: 'rgba(0, 0, 0, .3)' })),
            transition('void => *', [
                style({ backgroundColor: 'rgba(0, 0, 0, 0)' }),
                animate(200)
            ]),
            transition('* => void', [
                animate(350, style({ backgroundColor: 'rgba(0, 0, 0, 0)' }))
            ])
        ]),
        trigger('floatInOut', [
            state('active', style({ transform: 'translate(-50%, 16px)', opacity: 1 })),
            transition('void => *', [
                style({ transform: 'translate(-50%, 0)', opacity: 0 }),
                animate(350)
            ]),
            transition('* => void', [
                animate(350, style({ transform: 'translate(-50%, 0)', opacity: 0 }))
            ])
        ]),
    ]
})

export class PromptComponent implements OnInit {

    constructor(@Inject(forwardRef(() => PromptService)) private promptService: PromptService) { }

    handle: string;                     //调用的动作类型
    tipsType: string = 'warning';       //提示图表展示类型  success/成功 warning/警告（默认） error/错误 

    state: string = 'active'; // 'enter', 'leave'
    show: boolean = true;
    hiding: boolean = false;
    tip: string = '提示内容';
    otherTip: string = '';
    noCancel: boolean;
    @ViewChild('verifyBtn') verifyBtn: ElementRef;

    successCallback: any = function () { };
    closeCallback: any = function () { };

    private viewRef: ViewRef;

    ngOnInit() {
        this.execute();
    }

    ngAfterViewInit() {
        //加载完成后，让确认按钮获得焦点
        this.setBtnFocus();
    }

    setBtnFocus() {
        if(this.handle == 'alert' || this.handle == 'prompt') {
            this.verifyBtn.nativeElement.focus();
        }
    }

    execute() {
        this.handle = this.promptService.handle;
        this.viewRef = this.promptService.viewRef;
        switch (this.handle) {
            case 'tips':
                this.tips(this.promptService.paramObj);
                break;
            case 'alert':
                this.alert(this.promptService.paramObj);
                break;
            case 'prompt':
                this.prompt(this.promptService.paramObj);
                break;
            default:
                break;
        }
    }

    tips(tip: any) {
        //this.state = 'enter';
        this.show = true;
        if (typeof tip == 'string') {
            this.tip = tip;
        } else {
            for (let prop in tip) {
                if (tip.hasOwnProperty(prop)) {
                    this[prop] = tip[prop];
                }
            }
        }
        setTimeout(() => {
            this.close();
        }, 2500)
    }

    alert(tip: any) {
        //this.state = 'enter';
        this.show = true;
        this.tipsType = 'error';
        if (typeof tip == 'string') {
            this.tip = tip;
        } else {
            for (let prop in tip) {
                if (tip.hasOwnProperty(prop)) {
                    this[prop] = tip[prop];
                }
            }
        }
    }

    prompt(param: any) {
        //this.state = 'enter';
        this.show = true;
        for (let prop in param) {
            if (param.hasOwnProperty(prop)) {
                this[prop] = param[prop];
            }
        }
    }

    voidCallback($event) {
        if ($event.toState == 'void') {
            this.show = false;
            this.hiding = false;
            this.tip = '提示内容';
            this.otherTip = '';
            this.promptService.removeComponent(this.viewRef);
        }
    }

    close() {
        this.state = 'void';
        this.hiding = true;
    }

    fnHandle(method: any) {
        // debugger
        let result = this[method]();
        
        this.promptService.result$.next(result);

        this.close();
    }
}