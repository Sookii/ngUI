import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';

    startTime = '2018-05-16';
    endTime = '1526882104381'

    /**
     * 时间组件限制参数
     */
    minStartDate: number = 1525449600000;
    maxStartDate: number;
    minEndDate: number;
    maxEndDate: number = 1528128000000;

    optionOne: any = {
        editable: true,
        timestamp: false,
        exact: true
    }
    optionTwo: any = {
        exact: true
    }
}
