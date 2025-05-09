




import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  // weitere Felder nach Bedarf (description, genre, etc.)
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  /** Basis-URL für alle Movie-Endpunkte */
  private base = `${environment.apiUrl}/movies/`;

  constructor(private http: HttpClient) {}

  /* --------------------------------------------------------------
   * Helper: baut Authorization‑Header, falls Access‑Token vorhanden
   * -------------------------------------------------------------- */
  private get authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /* ---------- CRUD ---------- */
  /** Liste aller Filme */
  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.base, { headers: this.authHeaders });
  }

  /** Ein Film im Detail */
  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.base}${id}/`, { headers: this.authHeaders });
  }

  /** Neuen Film anlegen */
  createMovie(data: Partial<Movie>): Observable<Movie> {
    return this.http.post<Movie>(this.base, data, { headers: this.authHeaders });
  }

  /** Film aktualisieren */
  updateMovie(id: number, data: Partial<Movie>): Observable<Movie> {
    return this.http.put<Movie>(`${this.base}${id}/`, data, { headers: this.authHeaders });
  }

  /** Film löschen */
  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}${id}/`, { headers: this.authHeaders });
  }
}
