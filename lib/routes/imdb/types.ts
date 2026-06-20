interface SearchFacet {
    filterId: string;
    text: string;
    total: number;
    __typename: string;
}

interface TitleGenres {
    genre: {
        text: string;
        __typename: string;
    };
    __typename: string;
}

interface Title {
    id: string;
    titleText: {
        text: string;
        __typename: string;
    };
    titleType: {
        id: string;
        text: string;
        canHaveEpisodes: boolean;
        displayableProperty: {
            value: {
                plainText: string;
                __typename: string;
            };
            __typename: string;
        };
        __typename: string;
    };
    originalTitleText: {
        text: string;
        __typename: string;
    };
    primaryImage: {
        id: string;
        width: number;
        height: number;
        url: string;
        caption: {
            plainText: string;
            __typename: string;
        };
        __typename: string;
    };
    releaseYear: {
        year: number;
        endYear: number | null;
        __typename: string;
    };
    ratingsSummary: {
        aggregateRating: number;
        voteCount: number;
        __typename: string;
    };
    runtime: {
        seconds: number;
        __typename: string;
    };
    certificate: {
        rating: string;
        __typename: string;
    } | null;
    canRate: {
        isRatable: boolean;
        __typename: string;
    };
    titleGenres: {
        genres: TitleGenres[];
        __typename: string;
    };
    canHaveEpisodes: boolean;
    plot: {
        plotText: {
            plainText: string;
            __typename: string;
        };
        __typename: string;
    };
    latestTrailer: {
        id: string;
        __typename: string;
    } | null;
    series: null;
    __typename: string;
}

interface ChartTitleEdge {
    currentRank: number;
    node: Title;
    __typename: string;
}

export interface ChartTitleSearchConnection {
    edges: ChartTitleEdge[];
    genres: SearchFacet[];
    keywords: SearchFacet[];
    __typename: string;
}
