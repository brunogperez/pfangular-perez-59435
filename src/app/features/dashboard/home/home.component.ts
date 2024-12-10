import { Component, model, OnInit } from '@angular/core';
import { WeatherService } from '../../../core/services/weather.service';

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
      error: (err) => {
        console.error(err);
      },
    });
  }
}
