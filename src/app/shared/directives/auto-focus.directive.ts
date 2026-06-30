import { Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appAutoFocus]', standalone: true })
export class AutoFocusDirective {
  constructor() {
    const el = inject(ElementRef);
    setTimeout(() => (el.nativeElement as HTMLElement).focus(), 0);
  }
}
