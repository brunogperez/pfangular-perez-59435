import { Component, model } from '@angular/core';

export interface Tile {
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  tiles: Tile[] = [
    { text: 'One', cols: 3, rows: 1 },
    { text: 'Two', cols: 1, rows: 2 },
    { text: 'Three', cols: 1, rows: 1 },
    { text: 'Four', cols: 2, rows: 2 },
  ];

  selected = model<Date | null>(null);
}
