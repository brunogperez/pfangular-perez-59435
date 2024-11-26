import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private APIWeather = 'https://api.open-meteo.com/v1/forecast';
  private hourlyParams = 'rain';

  constructor(private http: HttpClient) {}

  getWeather(
    latitude: number = -32.8908,
    longitude: number = -68.8272
  ): Observable<any> {
    const url = `${this.APIWeather}?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=${this.hourlyParams}`;
    return this.http.get(url);
  }
}
