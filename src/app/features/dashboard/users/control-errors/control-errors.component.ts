import { Component, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-control-errors',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule],
  templateUrl: './control-errors.component.html',
  styleUrl: './control-errors.component.scss',
})
export class ControlErrorsComponent {
  @Input()
  validationErrors: ValidationErrors | null | undefined = null;
  
}
