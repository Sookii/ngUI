import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { PromptService } from '../prompt/prompt.service';

@Component({
    selector: 'add-hospital',
    templateUrl: './add-hospital.component.html',
    styleUrls: ['./add-hospital.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ backgroundColor: 'rgba(0, 0, 0, 0)' }),
                animate(100, style({ backgroundColor: 'rgba(0, 0, 0, .3)' }))
            ]),
            transition(':leave', [
                animate(100, style({ backgroundColor: 'rgba(0, 0, 0, 0)' }))
            ])
        ])
    ]
})
export class AddHospitalComponent implements OnInit {
    @Input()
    set visible(value) {
        this._visible = value;
        if (this._visible) {
            this.hospitalInfo = {};
            delete this.duplicate;
        }
    }
    get visible() {
        return this._visible;
    }
    @Output() visibleChange: EventEmitter<any> = new EventEmitter();

    @Input()
    set filterList(value) {
        if (value) {
            this._filterList = value;
        }
    }
    get filterList() {
        return this._filterList;
    }

    _visible: boolean = false;
    _filterList: any[];
    duplicate: boolean;             //当前所选医院是否 filterList 中的医院重复

    hospitalId: string;             //用户 id
    hospitalInfo: any = {};
    hospitalInfoBackup: any;
    /**
     * 下拉列表组件统一配置
     */
    ezSelectCfg: any = {
        ez: true
    }
    /**
     * 可选空值的下拉列表组件配置
     */
    ezClearableCfg: any = {
        ez: true,
        clear: true
    }
    /* 是否为分院 */
    branchStateSelectCfg: any = { width: '80px' };
    isBranchState: any[] = [{ id: true, name: '是' }, { id: false, name: '否' }];
    /* 从属总院 */
    branchsSelectCfg: any = {
        searchInline: true
    }
    branchs: any[] = [];
    /* 医院类型 */
    hospitalTypes: any[] = ['医院', '药店', '卫生院'];
    /* 医院性质 */
    hospitalNatures: any[] = ['营利性医院', '非营利性医院'];
    /* 医院类别 */
    hospitalCategorys: any[] = ['综合医院', '中医医院', '专科医院', '中西医结合医院', '民族医院'];
    /* 医院级别 */
    hospitalLevels: any[] = ['三级甲等', '三级乙等', '三级丙等', '二级甲等', '二级乙等', '二级丙等', '一级甲等', '一级乙等', '一级丙等'];
    /* 行政级别 */
    addadminLevelList: any[] = ['部直属', '省直属', '市直属', '区直属', '其他'];
    /* HIS 厂商 */
    HISVendorList: any[] = [];
    /**
     * 地区三级联动组件
     */
    regionOpt: any = {
        checkedKey: 'code',
        key: 'dictValue'
    }
    cascaderList: any[] = [];
    cascaderChildren: any[];

    @Output() outputHospital: EventEmitter<any> = new EventEmitter();

    constructor(private http: HttpClient, private prompt: PromptService) { }

    ngOnInit() {
        this.getRegionTree();
        this.getHISVendorList();
    }

    ngOnDestroy() {

    }

    /**
     * 获取区域树数据
     */
    getRegionTree(item?: any) {
        let code = item ? item.code : '';
        this.http.get(`/api/v1/dictionary-data?categoryCode=sys_region${code ? '&pcode=' + code : ''}`).pipe()
            .subscribe(res => {
                if (res['code'] == '200' && res['data']) {
                    if (!item) {
                        this.cascaderList = res['data'];
                    } else {
                        this.cascaderChildren = res['data'];
                    }
                }
            })
    }
    /**
     * 获取 regionCode
     * @param $event
     */
    getAreaRegion($event: any) {
        this.hospitalInfo.regionCode = $event[$event.length - 1] ? $event[$event.length - 1].code : '';
    }

    /**
     * 获取医院信息
     */
    getHospitalInfo(hospitalId: string) {
        this.http.get(`/api/v1/hospital/${hospitalId}`)
            .subscribe(res => {
                if (res['code'] == '200' && res['data']) {
                    this.hospitalInfo = res['data'];
                }
            })
    }

    /**
     * 获取医院列表
     */
    getHospitalList(keyword: any, branch?: boolean) {
        this.http.get(`/api/v1/hospital?name=${keyword}${branch ? '&branch=false' : ''}`)
            .subscribe(res => {
                if (res['code'] == '200' && res['data']) {
                    this.branchs = res['data'].content;
                }
            })
    }

    /**
     * 获取 HIS 厂商
     */
    getHISVendorList() {
        return this.http.get('/api/v1/his-vendor')
            .subscribe(res => {
                if (res['code'] == '200' && res['data']) {
                    this.resolveHISVendorList(res['data']);
                }
            })
    }

    /**
     * 组装 HIS 厂商列表
     */
    resolveHISVendorList(list: any[]) {
        let initial: string;
        let resolvedList: any[] = [];
        for (let i = 0; i < list.length; i++) {
            if (initial != list[i].py.substr(0, 1)) {
                initial = list[i].py.substr(0, 1);
                /* 插入一个只读的字母标记 */
                resolvedList.push({ name: initial, readonly: true });
            }
            resolvedList.push(list[i]);
        }

        this.HISVendorList = resolvedList;
    }

    /** =====================================================
     * 表单操作
     */

    /* 选择已有的医院 */
    selectHospital(hospital: any) {
        this.hospitalInfo = hospital;
        /* 判断是否跟列表数据中重复 */
        if (this.filterList && this.filterList.length >= 0) {
            delete this.duplicate;
            for (let item of this.filterList) {
                if (item.id == this.hospitalInfo.id) {
                    this.duplicate = true;
                }
            }
        }

        this.hospitalInfoBackup = JSON.stringify(this.hospitalInfo);
    }

    checkHospitalChange($event: any) {
        if (this.hospitalInfo.id && $event == '') {
            this.hospitalInfo = {};
            delete this.duplicate;
            delete this.hospitalInfoBackup;
        }
        this.hospitalInfo.name = $event;
    }

    /**
     * 无效关联数据清除 （从属总院，医院配置）
     */
    dataFilter() {
        if (!this.hospitalInfo.branch) {
            delete this.hospitalInfo.parent;
        }

        if (this.hospitalInfo.genre != '医院') {
            delete this.hospitalInfo.nature;
            delete this.hospitalInfo.category;
            delete this.hospitalInfo.level;
            delete this.hospitalInfo.type;
            delete this.hospitalInfo.hisManufacturer;
        }
    }
    /**
     * 数据验证
     */
    validateData(): boolean {
        if (!this.hospitalInfo.name) {
            this.error('医院名称不能为空！');
            return false;
        }

        if (this.hospitalInfo.branch) {
            if (!this.hospitalInfo.parent) {
                this.error('从属总院不能为空！');
                return false;
            }
        }

        if (!this.hospitalInfo.regionCode) {
            this.error('所属地区不能为空！');
            return false;
        }
        /* 对于老数据不做 code 最后一级判断 */
        if (!this.hospitalInfo.id && this.hospitalInfo.regionCode && /0+$/.test(this.hospitalInfo.regionCode)) {
            this.error('所属地区必须选择到区县一级！');
            return false;
        }

        if (!this.hospitalInfo.genre) {
            this.error('医院类型不能为空！');
            return false;
        }

        if (this.hospitalInfo.genre == '医院') {

            if (!this.hospitalInfo.nature) {
                this.error('医院性质不能为空！');
                return false;
            }

            if (!this.hospitalInfo.level) {
                this.error('医院级别不能为空！');
                return false;
            }

            if (!this.hospitalInfo.type) {
                this.error('行政级别不能为空！');
                return false;
            }

            if (!this.hospitalInfo.hisManufacturer) {
                this.error('HIS厂商不能为空！');
                return false;
            }

        }

        return true;
    }
    error(msg: string) {
        this.prompt.excute('alert', msg);
    }

    submit() {
        if (this.hospitalInfoBackup && this.hospitalInfoBackup == JSON.stringify(this.hospitalInfo)) {
            delete this.duplicate;
            this.outputHospital.emit(this.hospitalInfo);
            this.close();
            return;
        }
        //无效关联数据清除 （从属总院，医院配置）
        this.dataFilter()

        //数据验证
        if (!this.validateData()) {
            return;
        }

        if (this.hospitalInfo.id) {
            this.http.put('/api/v1/hospital/' + this.hospitalInfo.id, this.hospitalInfo).pipe()
                .subscribe(res => {
                    if (res['code'] == '200' && res['data']) {
                        delete this.duplicate;
                        this.outputHospital.emit(res['data']);
                        this.close();
                    }
                })
        } else {
            this.http.post('/api/v1/hospital', this.hospitalInfo).pipe()
                .subscribe(res => {
                    if (res['code'] == '200' && res['data']) {
                        delete this.duplicate;
                        this.outputHospital.emit(res['data']);
                        this.close();
                    }
                })
        }
    }

    close() {
        this._visible = false;
        this.visibleChange.emit(this._visible);
    }
}