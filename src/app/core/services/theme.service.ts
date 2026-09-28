import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme';
const DARK_CLASS = 'dark-theme';

/**
 * Maneja el modo claro/oscuro. Persiste la preferencia en localStorage y
 * aplica la clase `dark-theme` al <body> (los overrides viven en styles.scss).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.readInitial());

  constructor() {
    this.apply(this.isDark());
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    this.apply(next);
  }

  private apply(dark: boolean): void {
    document.body.classList.toggle(DARK_CLASS, dark);
  }

  private readInitial(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === 'dark';
    // Respeta la preferencia del sistema en el primer arranque.
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
