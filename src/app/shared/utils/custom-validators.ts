import { Validators } from '@angular/forms';

export const nameValidator = Validators.compose([
  Validators.required,
  Validators.minLength(4),
  Validators.pattern(/^[a-zA-Z]+$/),
]);
