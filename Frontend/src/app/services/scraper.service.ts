import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filters } from '../models/filters.model';

@Injectable({
    providedIn: 'root',
})
export class ScraperService {
    private baseUrl: string = 'http://localhost:3000/scrape';

    constructor(private http: HttpClient) { }

    public scrapeUrl(url: string, currentFilters: Filters): Observable<any> {
        let params = new HttpParams().set('url', url);

        if (currentFilters.sentiment) {
            params = params.set('sentiment', currentFilters.sentiment);
        }
        if (currentFilters.category) {
            params = params.set('category', currentFilters.category);
        }
        if (currentFilters.minIsoDate !== null) {
            params = params.set('minIsoDate', currentFilters.minIsoDate.toISOString());
        }
        if (currentFilters.maxIsoDate !== null) {
            params = params.set('maxIsoDate', currentFilters.maxIsoDate.toISOString());
        }
        if (currentFilters.blogContent !== null) {
            params = params.set('blogContent', currentFilters.blogContent.toString());
        }

        const options = { params };
        return this.http.get(`${this.baseUrl}/`, options);
    }
}
