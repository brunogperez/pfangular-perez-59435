import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../../../core/services/students.service';
import { Student } from '../models';
import { InscriptionService } from '../../../../core/services/inscriptions.service';
import { Inscription } from '../../inscriptions/models';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent implements OnInit {
  idStudent?: string;
  student?: Student;
  inscriptions?: Inscription[];
  isLoading = false;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private studentsService: StudentsService,
    private inscriptionService: InscriptionService
  ) {}
  ngOnInit(): void {
    this.isLoading = true;
    this.studentsService
      .getStudentById(this.activatedRoute.snapshot.params['id'])
      .subscribe({
        next: (student) => {
          this.student = student;
          this.isLoading = false;
          console.log(student)
        },
      });
    this.inscriptionService
      .getInscriptionsById(this.activatedRoute.snapshot.params['id'])
      .subscribe({
        next: (inscription) => {
          console.log(inscription);
          this.inscriptions = inscription;
          this.isLoading = false;
        },
      });
  }
}
