import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tooltipIfTruncated' })
export class TooltipIfTruncatedPipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength: number): string {
    return value && value.length > maxLength ? value : '';
  }
}
