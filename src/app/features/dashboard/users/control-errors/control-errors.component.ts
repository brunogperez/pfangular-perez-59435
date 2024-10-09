import { Component, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-control-errors',
  templateUrl: './control-errors.component.html',
  styleUrl: './control-errors.component.scss',
})
export class ControlErrorsComponent {
  @Input()
  validationErrors: ValidationErrors | null | undefined = null;
  
}
