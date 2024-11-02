import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../../../core/services/students.service';
import { Student } from '../models';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent implements OnInit {
  idStudent?: string;
  student?: Student;
  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private studentsService: StudentsService
  ) {}
  ngOnInit(): void {
    this.isLoading = true;
    this.studentsService
      .getStudentById(this.activatedRoute.snapshot.params['id'])
      .subscribe({
        next: (student) => {
          this.student = student;
          this.isLoading = false;
        },
      });
  }
}
