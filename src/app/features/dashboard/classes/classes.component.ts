import { Component } from '@angular/core';
import { ClassesService } from '../../../core/services/classes.service';
import { Observable } from 'rxjs';
import { Class } from './models';
import { CoursesService } from '../../../core/services/courses.service';
import { Course } from '../courses/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss',
})
export class ClassesComponent {
  classes$: Observable<Class[]>;
  courses$: Observable<Course[]>;

  classForm: FormGroup;

  constructor(
    private classesService: ClassesService,
    private coursesService: CoursesService,
    private formBuilder: FormBuilder
  ) {
    this.classes$ = this.classesService.getClasses();
    this.courses$ = this.coursesService.getCourses();

    this.classForm = this.formBuilder.group({
      name: [null, Validators.required],
      categoryId: [null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
    } else {
      this.classes$ = this.classesService.createClass(this.classForm.value);
      console.log(this.classForm.value);
    }
  }
}
