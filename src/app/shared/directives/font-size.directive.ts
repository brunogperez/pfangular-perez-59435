import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appFontSize]',
})
export class FontSizeDirective implements OnInit {

  @Input()
  fontSize='30px';

  constructor(private el: ElementRef<HTMLElement>) {
  
  }
 /* ngOnInit: se implementa este método del ciclo de vida de Angular 
    para establecer el tamaño de fuente una vez que el componente se ha inicializado. */  
  ngOnInit() {
    this.el.nativeElement.style.fontSize = this.fontSize;
  }
}
  