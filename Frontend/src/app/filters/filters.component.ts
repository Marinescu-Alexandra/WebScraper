import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Filters } from '../models/filters.model';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent {
    filters: Filters = {
        sentiment: null,
        category: null,
        minIsoDate: null,
        maxIsoDate: null,
        blogContent: null
    };

    constructor(
        public dialogRef: MatDialogRef<FiltersComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Filters
    ) {
        this.filters = data;
    }


    applyFilters() {
        this.dialogRef.close(this.filters);
    }
}
