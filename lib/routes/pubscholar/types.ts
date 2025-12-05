interface Link {
    is_open_access: boolean;
    name: string;
    url: string;
}

interface Content {
    date: string;
    attachments: any[];
    keywords: string[];
    year: number;
    source: string;
    title: string;
    type: string;
    abstracts_abbreviation: string;
    major: string;
    school: any[];
    first_page: string;
    local_links: any[];
    links: Link[];
    id: string;
    graduation_institution: any[];
    cn_type: string;
    article_type: string;
    issue: string;
    abstracts: string;
    author: string[];
    last_page: string;
    degree: string;
    tutor: any[];
    semantic_entities: object;
    volume: string;
    source_list: string[];
    is_free: boolean;
}

export interface Resource {
    total: number;
    is_last: boolean;
    content: Content[];
}
