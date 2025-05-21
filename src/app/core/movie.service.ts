import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  description: string;
  stream_url: string;
  poster_url: string;
  duration: number;          // Sekunden
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private api = environment.apiUrl.replace(/\/$/, '');
  private videos   = `${this.api}/videos/`;    // ← stimmt mit Django überein
  private progress = `${this.api}/progress/`;

  constructor(private http: HttpClient) {}

  /* ---------- CRUD ---------- */
  getMovies():  Observable<Movie[]>       { return this.http.get<Movie[]>(this.videos); }
  getMovie(id: number): Observable<Movie> { return this.http.get<Movie>(`${this.videos}${id}/`); }
  createMovie(data: Partial<Movie>)  { return this.http.post<Movie>(this.videos, data); }
  updateMovie(id: number, data: Partial<Movie>) { return this.http.put<Movie>(`${this.videos}${id}/`, data); }
  deleteMovie(id: number) { return this.http.delete<void>(`${this.videos}${id}/`); }

  /* ---------- Fortschritt speichern (optional) ---------- */
  setProgress(movieId: number, seconds: number) {
    return this.http.post(`${this.progress}`, { movie: movieId, seconds });
  }
}
