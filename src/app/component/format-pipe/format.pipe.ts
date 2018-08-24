import { Pipe, PipeTransform, Input } from '@angular/core';

@Pipe({ name: 'textformat' })
export class TextFormatPipe implements PipeTransform {
    transform(text: string): any {
        return text.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\s/g, '&nbsp;');
    }
}

@Pipe({ name: 'textfilter' })
export class TextFilterPipe implements PipeTransform {
    transform(text: string): any {
        return text.replace(/\w/g, '');
    }
}

@Pipe({ name: 'arrayLengthFilter' })
export class ArrayLengthFilter implements PipeTransform {
    transform(arr: any[], arg?: any): any {
        let filterLen = parseInt(arg) || 20;

        if (filterLen > arr.length) {
            return arr;
        } else {
            return arr.filter((el, idx) => {
                return idx < filterLen;
            });
        }
    }
}