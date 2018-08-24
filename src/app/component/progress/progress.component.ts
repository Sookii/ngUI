import { Component, OnInit, Input, Output } from '@angular/core';
@Component({
    selector: 'ip-progress, [ipProgress]',
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
    private _progressType: string = 'circle';         // line | circle
    private _percent: number = 0;
    private _strokeWidth: number = 6;

    /* 进度条类型 */
    @Input()
    set progressType(value) {
        this._progressType = value;
        if (this._progressType == 'circle') {
            this.calcPathString();
        }
    }
    get progressType() {
        return this._progressType;
    }
    /* 当前值 */
    @Input()
    set percent(value) {
        this._percent = value;
        if (this._percent >= 100) {
            this.status = 'success';
        }
        this.calcPathString();
    }
    get percent() {
        return this._percent;
    }
    /**
     * 进度条宽度
     */
    @Input()
    set strokeWidth(value) {
        if (value) {
            this._strokeWidth = value;
            if (this.progressType == 'circle') {
                /* 圆形进度条模式下为了避免出现非整数半径的问题对于宽度做部分转换 */
                if (this._strokeWidth % 2 != 0) {
                    this._strokeWidth = Math.ceil(this._strokeWidth / 2) * 2;
                }
                this.calcPathString();
            }
        }
    }
    get strokeWidth() {
        return this._strokeWidth;
    }
    /* 当前状态 */
    @Input() status: string = 'active';     // active | exception | success

    /* circle 类型进度条宽度 默认 120px */
    @Input() cpWidth = 120;

    /*  */
    statusColorMap: any = {
        'active': '#108EE9',
        'exception': '#F04134',
        'success': '#3DBD7D'
    };

    /* circle d attribute */
    pathString: string = '';
    trailPathStyle: any = {};
    strokePathStyle: any = {};

    constructor() { }

    ngOnInit() {
        this.calcPathString();
    }

    /* 计算圆形 path */
    calcPathString() {
        let radius = 50 - (this.strokeWidth / 2);
        let len = Math.PI * 2 * radius; //路径长度
        let beginPositionX = 0;
        let beginPositionY = -radius;
        let endPositionX = 0;
        let endPositionY = radius * -2;

        this.pathString = `M 50,50 m ${beginPositionX},${beginPositionY}
            a ${radius},${radius} 0 1 1 ${endPositionX},${-endPositionY}
            a ${radius},${radius} 0 1 1 ${-endPositionX},${endPositionY}`;

        this.trailPathStyle = {
            strokeDasharray: `${len}px ${len}px`,
            transition: 'stroke-dasharray .3s ease 0s, stroke .3s'
        };
        this.strokePathStyle = {
            strokeDasharray: `${(this.percent / 100) * len}px ${len}px`,
            transition: 'stroke-dasharray .3s ease 0s, stroke .3s'
        };
    }
}
