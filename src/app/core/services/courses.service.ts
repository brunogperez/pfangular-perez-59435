import { Injectable } from '@angular/core';
import { delay, map, Observable, of} from 'rxjs';
import { Course } from '../../features/dashboard/courses/models/index';


let COURSES_DB: Course[] = [
  {
    id: 'OEO66Dp0',
    name: 'Web Development',
    duration: '5 months',
    level: 'Beginner',
    description:
      'Learn to build websites from scratch, mastering HTML, CSS, and JavaScript to create interactive and responsive pages.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Web Development',
        date: new Date('2024-01-01'),
      },
      {
        id: 2,
        name: 'HTML Basics',
        date: new Date('2024-01-03'),
      },
      {
        id: 3,
        name: 'CSS Fundamentals',
        date: new Date('2024-01-05'),
      },
      {
        id: 4,
        name: 'JavaScript for Beginners',
        date: new Date('2024-01-07'),
      },
    ],
  },
  {
    id: 'wCNLG2Gk',
    name: 'JavaScript',
    duration: '2 months',
    level: 'Intermediate',
    description:
      'Master JavaScript to add interactivity to your web projects and build client-side dynamic applications.',
    classes: [
      {
        id: 1,
        name: 'Introduction to JavaScript',
        date: new Date('2024-02-01'),
      },
      {
        id: 2,
        name: 'Variables and Functions',
        date: new Date('2024-02-03'),
      },
      {
        id: 3,
        name: 'DOM Manipulation',
        date: new Date('2024-02-05'),
      },
      {
        id: 4,
        name: 'Advanced JavaScript',
        date: new Date('2024-02-07'),
      },
    ],
  },
  {
    id: '8jcFtqja',
    name: 'ReactJS',
    duration: '2 months',
    level: 'Intermediate',
    description:
      'Learn the fundamentals of ReactJS to build modern and efficient user interfaces with reusable components.',
    classes: [
      {
        id: 1,
        name: 'React Basics',
        date: new Date('2024-03-01'),
      },
      {
        id: 2,
        name: 'Components and Props',
        date: new Date('2024-03-03'),
      },
      {
        id: 3,
        name: 'State and Lifecycle',
        date: new Date('2024-03-05'),
      },
      {
        id: 4,
        name: 'Hooks in React',
        date: new Date('2024-03-07'),
      },
    ],
  },
  {
    id: '9oEVVcA5',
    name: 'Backend with Node.js',
    duration: '4 months',
    level: 'Advanced',
    description:
      'Develop robust servers and APIs using Node.js and Express to create scalable and efficient backend applications.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Node.js',
        date: new Date('2024-04-01'),
      },
      {
        id: 2,
        name: 'Express.js Setup',
        date: new Date('2024-04-03'),
      },
      {
        id: 3,
        name: 'Building APIs',
        date: new Date('2024-04-05'),
      },
      {
        id: 4,
        name: 'Database Integration',
        date: new Date('2024-04-07'),
      },
    ],
  },

  {
    id: 'F6kHCiNg',
    name: 'Python',
    duration: '2 months',
    level: 'Beginner',
    description:
      'Discover the versatility of Python, a powerful language for automation, data analysis, and software development.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Python',
        date: new Date('2024-05-01'),
      },
      {
        id: 2,
        name: 'Data Types and Variables',
        date: new Date('2024-05-03'),
      },
      {
        id: 3,
        name: 'Control Structures',
        date: new Date('2024-05-05'),
      },
      {
        id: 4,
        name: 'Functions in Python',
        date: new Date('2024-05-07'),
      },
    ],
  },
  {
    id: 'TFRFwyR0',
    name: 'Data Analytics',
    duration: '5 months',
    level: 'Beginner',
    description:
      'Learn how to analyze and visualize data to make informed decisions using tools like Excel, SQL, and Tableau.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Data Analytics',
        date: new Date('2024-06-01'),
      },
      {
        id: 2,
        name: 'Data Cleaning and Preparation',
        date: new Date('2024-06-03'),
      },
      {
        id: 3,
        name: 'Data Visualization',
        date: new Date('2024-06-05'),
      },
      {
        id: 4,
        name: 'Using Tableau',
        date: new Date('2024-06-07'),
      },
    ],
  },

  {
    id: 'E9bb4jy3',
    name: 'UX/UI Design',
    duration: '5 months',
    level: 'Beginner',
    description:
      'Gain the basics of user-centered design, learning to create intuitive interfaces and effective digital experiences.',
    classes: [
      {
        id: 1,
        name: 'Introduction to UX/UI',
        date: new Date('2024-07-01'),
      },
      {
        id: 2,
        name: 'User Research',
        date: new Date('2024-07-03'),
      },
      {
        id: 3,
        name: 'Wireframing',
        date: new Date('2024-07-05'),
      },
      {
        id: 4,
        name: 'Prototyping',
        date: new Date('2024-07-07'),
      },
    ],
  },
  {
    id: 'ScWZzdpi',
    name: 'Machine Learning',
    duration: '3 months',
    level: 'Advanced',
    description:
      'Discover key concepts of Machine Learning and how to implement predictive models to solve real-world problems.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Machine Learning',
        date: new Date('2024-08-01'),
      },
      {
        id: 2,
        name: 'Supervised Learning',
        date: new Date('2024-08-03'),
      },
      {
        id: 3,
        name: 'Unsupervised Learning',
        date: new Date('2024-08-05'),
      },
      {
        id: 4,
        name: 'Neural Networks',
        date: new Date('2024-08-07'),
      },
    ],
  },

  {
    id: 'BHbGCCkX',
    name: 'Cybersecurity',
    duration: '4 months',
    level: 'Advanced',
    description:
      'Learn to protect digital systems by mastering security protocols, risk management, and identifying vulnerabilities.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Cybersecurity',
        date: new Date('2024-09-01'),
      },
      {
        id: 2,
        name: 'Network Security',
        date: new Date('2024-09-03'),
      },
      {
        id: 3,
        name: 'Penetration Testing',
        date: new Date('2024-09-05'),
      },
      {
        id: 4,
        name: 'Risk Management',
        date: new Date('2024-09-07'),
      },
    ],
  },
  {
    id: 'GC3fQFUj',
    name: 'UX/UI Design with Figma',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Enhance your design skills by learning how to create interactive prototypes and user interfaces using Figma.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Figma',
        date: new Date('2024-10-01'),
      },
      {
        id: 2,
        name: 'Designing with Figma',
        date: new Date('2024-10-03'),
      },
      {
        id: 3,
        name: 'Prototyping with Figma',
        date: new Date('2024-10-05'),
      },
      {
        id: 4,
        name: 'Advanced Figma Techniques',
        date: new Date('2024-10-07'),
      },
    ],
  },
  {
    id: 'KJH1aU98',
    name: 'UX Writing',
    duration: '2 months',
    level: 'Intermediate',
    description:
      'Learn how to create user-centered content that enhances digital experiences by focusing on tone, clarity, and usability.',
    classes: [
      {
        id: 1,
        name: 'Introduction to UX Writing',
        date: new Date('2024-11-01'),
      },
      {
        id: 2,
        name: 'Tone and Voice',
        date: new Date('2024-11-03'),
      },
      {
        id: 3,
        name: 'Writing for Interfaces',
        date: new Date('2024-11-05'),
      },
      {
        id: 4,
        name: 'Advanced UX Writing',
        date: new Date('2024-11-07'),
      },
    ],
  },

  {
    id: 'LJU12kP3',
    name: 'Digital Marketing',
    duration: '3 months',
    level: 'Beginner',
    description:
      'Get introduced to marketing strategies, SEO, social media, and more, to promote products and services effectively online.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Digital Marketing',
        date: new Date('2024-12-01'),
      },
      {
        id: 2,
        name: 'SEO Fundamentals',
        date: new Date('2024-12-03'),
      },
      {
        id: 3,
        name: 'Social Media Marketing',
        date: new Date('2024-12-05'),
      },
      {
        id: 4,
        name: 'Email Marketing Strategies',
        date: new Date('2024-12-07'),
      },
    ],
  },
  {
    id: 'YHY76Tr9',
    name: 'Crypto & Blockchain',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Dive into the world of cryptocurrency and blockchain technology, exploring their potential applications and impact.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Crypto',
        date: new Date('2024-12-01'),
      },
      {
        id: 2,
        name: 'Blockchain Technology',
        date: new Date('2024-12-03'),
      },
      {
        id: 3,
        name: 'Smart Contracts',
        date: new Date('2024-12-05'),
      },
      {
        id: 4,
        name: 'Future of Blockchain',
        date: new Date('2024-12-07'),
      },
    ],
  },
  {
    id: 'ERT74Qh4',
    name: 'Product Management',
    duration: '4 months',
    level: 'Advanced',
    description:
      'Master the art of managing the lifecycle of a product, from concept to launch, with a focus on agile methodologies.',
    classes: [
      {
        id: 1,
        name: 'Introduction to Product Management',
        date: new Date('2024-01-01'),
      },
      {
        id: 2,
        name: 'Agile Methodologies',
        date: new Date('2024-01-03'),
      },
      {
        id: 3,
        name: 'Product Roadmaps',
        date: new Date('2024-01-05'),
      },
      {
        id: 4,
        name: 'Product Launch',
        date: new Date('2024-01-07'),
      },
    ],
  },
  {
    id: 'PIO43Vm1',
    name: 'QA Testing (Manual)',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Gain practical skills in manual quality assurance testing to ensure software functionality and performance meet the required standards.',
    classes: [
      {
        id: 1,
        name: 'Introduction to QA',
        date: new Date('2024-02-01'),
      },
      {
        id: 2,
        name: 'Testing Strategies',
        date: new Date('2024-02-03'),
      },
      {
        id: 3,
        name: 'Writing Test Cases',
        date: new Date('2024-02-05'),
      },
      {
        id: 4,
        name: 'Manual Testing Tools',
        date: new Date('2024-02-07'),
      },
    ],
  },
  {
    id: 'FGH89Dj3',
    name: 'Angular',
    duration: '3 months',
    level: 'Intermediate',
    description:
      'Learn to build powerful and scalable web applications using Angular, one of the most popular front-end frameworks.',
    classes: [
      {
        id: 1,
        name: 'Introducción y configuración de herramientas',
        date: new Date('2024-09-09'),
      },
      {
        id: 2,
        name: 'Componentes y Elementos de un proyecto Angular',
        date: new Date('2024-09-11'),
      },
      {
        id: 3,
        name: 'Typescript',
        date: new Date('2024-09-16'),
      },
      {
        id: 4,
        name: 'Interpolación y Directivas',
        date: new Date('2024-09-18'),
      },
      {
        id: 5,
        name: 'Comunicación entre componentes',
        date: new Date('2024-09-23'),
      },
      {
        id: 6,
        name: 'Formularios en Angular / Reactive Forms',
        date: new Date('2024-09-25'),
      },
      {
        id: 7,
        name: 'Angular Material',
        date: new Date('2024-09-30'),
      },
      {
        id: 8,
        name: 'Pipes y Directivas Personalizadas',
        date: new Date('2024-10-02'),
      },
      {
        id: 9,
        name: 'Servicios y RxJS',
        date: new Date('2024-10-07'),
      },
      {
        id: 10,
        name: 'Introducción a la programación reactiva con RxJS',
        date: new Date('2024-10-09'),
      },
      {
        id: 11,
        name: 'Router',
        date: new Date('2024-10-14'),
      },
      {
        id: 12,
        name: 'Módulos',
        date: new Date('2024-10-16'),
      },
      {
        id: 13,
        name: 'Lazy Loading de módulos y Guards',
        date: new Date('2024-10-21'),
      },
      {
        id: 14,
        name: 'Llamadas API REST',
        date: new Date('2024-10-23'),
      },
      {
        id: 15,
        name: 'Tests unitarios en Angular',
        date: new Date('2024-10-28'),
      },
      {
        id: 16,
        name: 'Patrón de diseño Redux con NgRx',
        date: new Date('2024-10-30'),
      },
      {
        id: 17,
        name: 'Feature Store en NgRx',
        date: new Date('2024-11-04'),
      },
      {
        id: 18,
        name: 'Effects en NgRx',
        date: new Date('2024-11-06'),
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class CoursesService {
  getCourses(): Observable<Course[]> {
    return of(COURSES_DB).pipe(delay(500));
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return this.getCourses().pipe(map((course) => course.find((u) => u.id === id)));
  }

  removeCourseById(id: string): Observable<Course[]> {
    COURSES_DB = COURSES_DB.filter((course) => course.id != id);
    return of(COURSES_DB).pipe(delay(500));
  }

  updateCourseById(id: string, update: Partial<Course>) {
    COURSES_DB = COURSES_DB.map((course) =>
      course.id === id ? { ...course, ...update } : course
    );
    return new Observable<Course[]>((observer) => {
      setInterval(() => {
        observer.next(COURSES_DB);
        observer.complete();
      }, 500);
    });
  }
}
