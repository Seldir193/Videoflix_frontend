import { Injectable }      from '@angular/core';
import { HttpClient }      from '@angular/common/http';
import { Observable }      from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface Movie { id:number; title:string; /* … */ }

@Injectable({ providedIn: 'root' })
export class MovieService {
  private base = environment.apiUrl;           // http://localhost:8000/api/

  constructor(private http: HttpClient) {}

  /** GET /movies/ */
  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.base}movies/`);
  }

  /** Beispiel für Detail-Request */
  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.base}movies/${id}/`);
  }
}
