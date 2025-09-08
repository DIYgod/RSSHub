interface Links {
    self?: string;
    next?: string;
    bibtex: string;
    'latex-eu': string;
    'latex-us': string;
    json: string;
    cv: string;
    citations: string;
}

interface Metadata {
    number_of_authors: number;
    date: string;
    publication_info: {
        year: number;
        artid?: string;
        journal_volume?: string;
        journal_title?: string;
        journal_issue?: string;
    }[];
    citation_count: number;
    is_collection_hidden: boolean;
    authors: {
        uuid: string;
        record: {
            $ref: string;
        };
        full_name: string;
        first_name: string;
        ids: {
            schema: string;
            value: string;
        }[];
        last_name: string;
        recid: number;
        affiliations: {
            value: string;
            record: {
                $ref: string;
            };
            curated_relation?: boolean;
        }[];
        raw_affiliations: {
            value: string;
        }[];
        curated_relation?: boolean;
    }[];
    citation_count_without_self_citations: number;
    titles: {
        title: string;
        source: string;
    }[];
    texkeys: string[];
    imprints: {
        date: string;
        publisher?: string;
    }[];
    abstracts: {
        value: string;
        source: string;
    }[];
    document_type: string[];
    control_number: number;
    inspire_categories: {
        term: string;
        source?: string;
    }[];
    number_of_pages?: number;
    keywords?: {
        value: string;
        source?: string;
        schema?: string;
    }[];
    thesis_info?: {
        institutions: {
            name: string;
            record: {
                $ref: string;
            };
            curated_relation?: boolean;
        }[];
        degree_type: string;
        date: string;
    };
    license?: {
        url: string;
        license: string;
        imposing?: string;
    }[];
    persistent_identifiers?: {
        value: string;
        schema: string;
        source: string;
    }[];
    supervisors?: {
        uuid: string;
        record: {
            $ref: string;
        };
        full_name: string;
        inspire_roles: string[];
    }[];
    isbns?: {
        value: string;
        medium?: string;
    }[];
    urls?: {
        value: string;
        description?: string;
    }[];
    dois?: {
        value: string;
    }[];
    number_of_references?: number;
    external_system_identifiers?: {
        url_name: string;
        url_link: string;
    }[];
    report_numbers?: {
        value: string;
    }[];
    accelerator_experiments?: {
        name: string;
        record: {
            $ref: string;
        };
    }[];
    documents?: {
        source: string;
        key: string;
        url: string;
        fulltext: boolean;
        hidden: boolean;
        filename: string;
    }[];
    citation_pdf_urls?: string[];
    fulltext_links?: {
        description: string;
        value: string;
    }[];
}

interface Literature {
    created: string;
    metadata: Metadata;
    links: Links;
    updated: string;
    id: string;
}

export interface AuthorResponse {
    id: string;
    uuid: string;
    revision_id: number;
    updated: string;
    links: {
        json: string;
    };
    metadata: {
        can_edit: boolean;
        orcid: string;
        bai: string;
        facet_author_name: string;
        should_display_positions: boolean;
        positions: {
            institution: string;
            current: boolean;
            display_date: string;
            record: {
                $ref: string;
            };
        }[];
        project_membership: {
            name: string;
            record: {
                $ref: string;
            };
            current: boolean;
            curated_relation: boolean;
        }[];
        ids: {
            value: string;
            schema: string;
        }[];
        name: {
            value: string;
            preferred_name: string;
        };
        stub: boolean;
        status: string;
        deleted: boolean;
        control_number: number;
        legacy_version: string;
        legacy_creation_date: string;
    };
    created: string;
}

export interface LiteratureResponse {
    hits: {
        hits: Literature[];
        total: number;
    };
    links: Links;
    sort_options: {
        value: string;
        title: string;
    }[];
}
