export interface Filters {
    sentiment: string | null;
    category: string | null;
    minIsoDate: Date | null;
    maxIsoDate: Date | null;
    blogContent: boolean | null;
}