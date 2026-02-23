import { Component, model, OnInit } from '@angular/core';
import { WeatherService } from '../../../core/services/weather.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

export interface Tile {
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  weatherData = { current: { temperature: 0, winddirection: 0 }, rain: 0 };

  tiles: Tile[] = [
    { text: 'One', cols: 3, rows: 1 },
    { text: 'Two', cols: 1, rows: 2 },
    { text: 'Three', cols: 1, rows: 1 },
    { text: 'Four', cols: 2, rows: 2 },
  ];

  selected = model<Date | null>(null);

  constructor(private weatherService: WeatherService) {}
  ngOnInit(): void {
    this.fetchWeather();
  }

  fetchWeather(): void {
    this.weatherService.getWeather().subscribe({
      next: (data) => {
        if (data) {
          this.weatherData = {
            current: data.current_weather,
            rain: data.hourly?.rain[0] ?? 0,
          };
        }
      },
      error: () => {
        this.weatherData = { current: { temperature: 0, winddirection: 0 }, rain: 0 };
      },
    });
  }
}
