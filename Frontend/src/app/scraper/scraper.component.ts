import { Component } from '@angular/core';
import { ScraperService } from '../services/scraper.service';
import { finalize } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { FiltersComponent } from '../filters/filters.component';
import { Filters } from '../models/filters.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'scraper',
    templateUrl: './scraper.component.html',
    styleUrls: ['./scraper.component.scss'],
})
export class ScraperComponent {
    searchQuery: string = '';
    isLoading: boolean = false;
    searchResult: string = '';
    isError: boolean = false;
    defaultUrl: string = "https://wsa-test.vercel.app/";

    constructor(private scraperService: ScraperService, private clipboard: Clipboard, private dialog: MatDialog) { }

    performSearch() {
        if (this.isLoading) {
            return;
        }
        const targetUrl: string = this.searchQuery || this.defaultUrl;
        this.searchResult = '';
        this.isLoading = true;
        this.scraperService
            .scrapeUrl(targetUrl, this.currentFilters)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (v) => {
                    this.searchResult = v;
                    this.isError = false;
                },
                error: (e) => {
                    this.searchResult = e.error;
                    this.isError = true;
                },
            });
    }
    copyToClipboard(): void {
        this.clipboard.copy(JSON.stringify(this.searchResult));
    }

    private currentFilters: Filters = {
        sentiment: null,
        category: null,
        minIsoDate: null,
        maxIsoDate: null,
        blogContent: null
    };

    openFilterDialog(): void {
        const dialogRef = this.dialog.open(FiltersComponent, {
            width: '450px',
            data: this.currentFilters
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.currentFilters = result;
            }
        });
    }
}
