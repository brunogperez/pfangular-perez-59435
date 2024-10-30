import { Validators } from '@angular/forms';

export const nameValidator = Validators.compose([
  Validators.required,
  Validators.minLength(3),
  Validators.pattern(/^[a-zA-Z]+$/),
]);


