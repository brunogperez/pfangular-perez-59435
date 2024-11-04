import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../../../core/services/courses.service';
import { Course, ClassItem } from '../models';
import { Inscription } from '../../inscriptions/models/index';



@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  idCourse?: string;
  course?: Course;
  isLoading = false;
  classList: ClassItem[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private courseService: CoursesService
  ) {}

  ngOnInit(): void {
    console.log(this.course?.classes);
    this.isLoading = true;
    this.courseService
      .getCourseById(this.activatedRoute.snapshot.params['id'])
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isLoading = false;
          this.classList = course?.classes || [];
          console.log(course)
        },
      });
  }

  trackCourse(index: number, classItem: any): number {
    return classItem.id; // Asegúrate de que este ID sea único
  }
}
