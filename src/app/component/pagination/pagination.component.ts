import { Component, OnInit, OnChanges, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

class Pagination {
    pageSize: number;               //单页条数
    currentPage: number;            //当前页
    pageCount: number;         //总页数
    recordCount: number;             //总条数
    blinkPage: number;              //跳转页数

    constructor() {
        this.pageSize = 20;
        this.currentPage = 1;
        this.pageCount = 1;
        this.recordCount = 0;
        this.blinkPage = 1;
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'pagination',
    templateUrl: 'pagination.component.html'
})
export class PaginationComponent implements OnInit, OnChanges {
    @Input() pageInfo: any;
    @Output() changePage = new EventEmitter();
    @Output() changePageSize = new EventEmitter();

    pagi: Pagination = new Pagination();
    pagesizeCfg: any = {
        reverseDirection: true,
        width: '60px',
        sm: true
    }
    pagesizes: any[] = [
        { name: 10 },
        { name: 20 },
        { name: 50 },
        { name: 100 }
    ]

    constructor() { }

    ngOnInit() {
        this.initProperty();
    }

    ngOnChanges(changes: any) {
        this.initProperty();
    }

    initProperty() {
        if (!this.pageInfo) return;

        this.pagi = this.extend(this.pagi, this.pageInfo);
    }
    private extend(o1: any, o2: any) {
        for (let name in o2) {
            o1[name] = o2[name];
        }
        return o1;
    }
    //改变pagesize
    onChangePageSize(size: any) {
        this.pagi.pageSize = size.name;
        this.pagi.currentPage = 1;
        this.changePageSize.emit(this.pagi.pageSize);
    }
    firstPage() {
        this.pagi.currentPage = 1;
        this.changePage.emit(this.pagi.currentPage);
    }
    lastPage() {
        this.pagi.currentPage = this.pagi.pageCount;
        this.changePage.emit(this.pagi.currentPage);
    }
    prePage() {
        this.pagi.currentPage--;
        this.changePage.emit(this.pagi.currentPage);
    }
    nextPage() {
        this.pagi.currentPage++;
        this.changePage.emit(this.pagi.currentPage);
    }
    specificPage(currentPage?: number) {
        let _currentPage = currentPage ? currentPage : this.pagi.blinkPage;
        if (_currentPage < 1) {
            if (!currentPage)
                this.pagi.blinkPage = 1;
            this.pagi.currentPage = 1;
        } else if (_currentPage > this.pagi.pageCount) {
            if (!currentPage)
                this.pagi.blinkPage = this.pagi.pageCount;
            this.pagi.currentPage = this.pagi.pageCount;
        } else {
            this.pagi.currentPage = _currentPage;
        }

        this.changePage.emit(this.pagi.currentPage);
    }
}
