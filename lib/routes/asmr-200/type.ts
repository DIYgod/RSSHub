export interface Result {
    pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
    };
    works: Work[];
}

export interface Work {
    age_category_string: string;
    circle: {
        id: number;
        name: string;
        source_id: string;
        source_type: string;
    };
    circle_id: number;
    create_date: string;
    dl_count: number;
    duration: number;
    has_subtitle: boolean;
    id: number;
    language_editions: Array<{
        display_order: number;
        edition_id: number;
        edition_type: string;
        label: string;
        lang: string;
        workno: string;
    }>;
    mainCoverUrl: string;
    name: string;
    nsfw: boolean;
    original_workno: null | string;
    other_language_editions_in_db: Array<{
        id: number;
        is_original: boolean;
        lang: string;
        source_id: string;
        source_type: string;
        title: string;
    }>;
    playlistStatus: any;
    price: number;
    rank: Array<{
        category: string;
        rank: number;
        rank_date: string;
        term: string;
    }> | null;
    rate_average_2dp: number | number;
    rate_count: number;
    rate_count_detail: Array<{
        count: number;
        ratio: number;
        review_point: number;
    }>;
    release: string;
    review_count: number;
    samCoverUrl: string;
    source_id: string;
    source_type: string;
    source_url: string;
    tags: Array<{
        i18n: any;
        id: number;
        name: string;
    }>;
    category: string;
    thumbnailCoverUrl: string;
    title: string;
    translation_info: {
        child_worknos: string[];
        is_child: boolean;
        is_original: boolean;
        is_parent: boolean;
        is_translation_agree: boolean;
        is_translation_bonus_child: boolean;
        is_volunteer: boolean;
        lang: null | string;
        original_workno: null | string;
        parent_workno: null | string;
        production_trade_price_rate: number;
        translation_bonus_langs: string[];
    };
    userRating: null;
    vas: Array<{
        id: string;
        name: string;
    }>;
    cv: string;
    work_attributes: string;
}
