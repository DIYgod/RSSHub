interface TitleGenre {
    genre: {
        text: string;
    };
}

interface Title {
    id: string;
    titleText: {
        text: string;
    };
    originalTitleText: {
        text: string;
    };
    titleType: {
        text: string;
    };
    releaseYear: {
        year: number;
        endYear: number | null;
    } | null;
    primaryImage: {
        url: string;
        caption: {
            plainText: string;
        } | null;
    } | null;
    ratingsSummary: {
        aggregateRating: number | null;
        voteCount: number | null;
    } | null;
    certificate: {
        rating: string;
    } | null;
    plot: {
        plotText: {
            plainText: string;
        } | null;
    } | null;
    titleGenres: {
        genres: TitleGenre[];
    } | null;
}

interface ChartTitleEdge {
    currentRank: number;
    node: Title;
}

export interface ChartTitleSearchConnection {
    edges: ChartTitleEdge[];
}
