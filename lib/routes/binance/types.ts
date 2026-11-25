export interface AnnouncementCatalog {
    articles: AnnouncementArticle[];
    catalogId: number;
    catalogName: string;
    catalogType: 1;
    catalogs: [];
    description: null;
    icon: string;
    parentCatalogId: null;
    total: number;
}

interface AnnouncementArticle {
    id: number;
    code: string;
    title: string;
    type: number;
    releaseDate: number;
}
