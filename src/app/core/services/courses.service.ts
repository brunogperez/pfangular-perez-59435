import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { Course } from '../../features/dashboard/courses/models/index';

let COURSES_DB: Course[] = [
  {
    id: 'OEO66Dp0',
    name: 'Web Development',
    duration: '5 months',
    level: 'Beginner',
    description:
      'Learn to build websites from scratch, mastering HTML, CSS, and JavaScript to create interactive and responsive pages.',
  },
  {
    id: 'wCNLG2Gk',
    name: 'JavaScript',
    duration: '2 months',
    level: 'Intermediate',
    description:
      'Master JavaScript to add interactivity to your web projects and build client-side dynamic applications.',
  },
  {
    id: '8jcFtqja',
    name: 'ReactJS',
    duration: '2 months',
    level: 'Intermediate',
    description:
      'Learn the fundamentals of ReactJS to build modern and efficient user interfaces with reusable components.',
  },
  {
    id: '9oEVVcA5',
    name: 'Backend with Node.js',
    duration: '4 months',
    level: 'Advanced',
    description:
      'Develop robust servers and APIs using Node.js and Express to create scalable and efficient backend applications.',
  },
  {
    id: 'F6kHCiNg',
    name: 'Python',
    duration: '2 months',
    level: 'Beginner',
    description:
      'Discover the versatility of Python, a powerful language for automation, data analysis, and software development.',
  },
  {
    id: 'TFRFwyR0',
    name: 'Data Analytics',
    duration: '5 months',
    level: 'Beginner',
    description:
      'Learn how to analyze and visualize data to make informed decisions using tools like Excel, SQL, and Tableau.',
  },
  {
    id: 'E9bb4jy3',
    name: 'UX/UI Design',
    duration: '5 months',
    level: 'Beginner',
    description:
      'Gain the basics of user-centered design, learning to create intuitive interfaces and effective digital experiences.',
  },
  {
    id: 'ScWZzdpi',
    name: 'Machine Learning',
    duration: '3 months',
    level: 'Advanced',
    description:
      'Discover key concepts of Machine Learning and how to implement predictive models to solve real-world problems.',
  },
  {
    id: 'BHbGCCkX',
    name: 'Cybersecurity',
    duration: '4 months',
    level: 'Advanced',
    description:
      'Learn to protect digital systems by mastering security protocols, risk management, and identifying vulnerabilities.',
  },
  {
    id: 'GC3fQFUj',
    name: 'UX/UI Design with Figma',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Enhance your design skills by learning how to create interactive prototypes and user interfaces using Figma.',
  },
  {
    id: 'KJH1aU98',
    name: 'UX Writing',
    duration: '2 months',
    level: 'Intermediate',
    description:
      'Learn how to create user-centered content that enhances digital experiences by focusing on tone, clarity, and usability.',
  },
  {
    id: 'LJU12kP3',
    name: 'Digital Marketing',
    duration: '3 months',
    level: 'Beginner',
    description:
      'Get introduced to marketing strategies, SEO, social media, and more, to promote products and services effectively online.',
  },
  {
    id: 'YHY76Tr9',
    name: 'Crypto & Blockchain',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Dive into the world of cryptocurrency and blockchain technology, exploring their potential applications and impact.',
  },
  {
    id: 'ERT74Qh4',
    name: 'Product Management',
    duration: '4 months',
    level: 'Advanced',
    description:
      'Master the art of managing the lifecycle of a product, from concept to launch, with a focus on agile methodologies.',
  },
  {
    id: 'PIO43Vm1',
    name: 'QA Testing (Manual)',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Gain practical skills in manual quality assurance testing to ensure software functionality and performance meet the required standards.',
  },
  {
    id: 'FGH89Dj3',
    name: 'Angular',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Learn to build powerful and scalable web applications using Angular, one of the most popular front-end frameworks.',
  },
];


@Injectable({ providedIn: 'root' })
export class CoursesServices {
  getCourses(): Observable<Course[]> {
    return of(COURSES_DB).pipe(delay(500));
  }

  getUserById(id: string): Observable<Course | undefined> {
    return this.getCourses().pipe(map((user) => user.find((u) => u.id === id)));
  }

  removeCourseById(id: string): Observable<Course[]> {
    COURSES_DB = COURSES_DB.filter((course) => course.id != id);
    return of(COURSES_DB).pipe(delay(500));
  }

  updateCourseById(id: string, update: Partial<Course>) {
    COURSES_DB = COURSES_DB.map((course) =>
      course.id === id ? { ...course, ...update } : course
    );
    return of(COURSES_DB).pipe(delay(500));

    /* return new Observable<Course[]>((observer) => {
      setInterval(() => {
        observer.next(COURSES_DB);
        observer.complete();
      }, 500);
    }); */
  }
}
