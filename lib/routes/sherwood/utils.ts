import { load } from 'cheerio';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';

export const SITE_ORIGIN = 'https://sherwood.news';
export const SNACKS_URL = `${SITE_ORIGIN}/snacks`;
export const DETAIL_CONCURRENCY = 2;

const SAFE_IMAGE_PROTOCOLS = new Set(['http:', 'https:']);
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const NEWSLETTER_PATH_PREFIX = '/snacks/newsletters/';

export interface RichTextMark {
    type?: string;
}

interface ImgixImageFields {
    src?: string;
}

export interface MediaFields {
    altText?: string;
    caption?: string;
    credit?: string;
    imgixImage?: ImgixImageFields;
    image?: {
        fields?: MediaFields;
    };
}

interface StockTickerFields {
    title?: string;
    name?: string;
    shortCode?: string;
}

interface RichTextTarget {
    sys?: {
        type?: string;
        contentType?: {
            sys?: {
                id?: string;
            };
        };
    };
    fields?: MediaFields & StockTickerFields;
}

interface RichTextData {
    uri?: string;
    target?: RichTextTarget;
}

export interface RichTextNode {
    nodeType?: string;
    value?: string;
    marks?: RichTextMark[];
    data?: RichTextData;
    content?: RichTextNode[];
}

interface NewsletterSectionFields {
    title?: string;
    body?: RichTextNode;
    fact?: RichTextNode;
    url?: string;
    monday?: RichTextNode;
    tuesday?: RichTextNode;
    wednesday?: RichTextNode;
    thursday?: RichTextNode;
    friday?: RichTextNode;
}

export interface NewsletterSection {
    sys?: {
        id?: string;
        contentType?: {
            sys?: {
                id?: string;
            };
        };
    };
    fields?: NewsletterSectionFields;
}

interface ContentfulSys {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    contentType?: {
        sys?: {
            id?: string;
        };
    };
}

interface TagLink {
    sys?: {
        id?: string;
    };
}

export interface NewsletterEntry {
    metadata?: {
        tags?: TagLink[];
    };
    sys?: ContentfulSys;
    fields?: {
        title?: string;
        slug?: string;
        publishedAt?: string;
        openingAssetMedia?: {
            fields?: MediaFields;
        };
        openingWordsRichText?: RichTextNode;
        sections?: NewsletterSection[];
    };
}

interface AuthorEntry {
    fields?: {
        name?: string;
    };
}

interface CategoryEntry {
    fields?: {
        title?: string;
        slug?: string;
    };
}

export interface PostEntry {
    metadata?: {
        tags?: TagLink[];
    };
    sys?: ContentfulSys;
    fields?: {
        hed?: string;
        dek?: string;
        slug?: string;
        displayDate?: string;
        authors?: AuthorEntry[];
        primaryCategory?: CategoryEntry;
        vertical?: CategoryEntry;
        bodyContent?: RichTextNode;
        article?: {
            fields?: {
                image?: {
                    fields?: MediaFields;
                };
                assetMedia?: {
                    fields?: MediaFields;
                };
                bodyContentAboveTheFold?: RichTextNode;
                bodyContent?: RichTextNode;
                bodyContentBelowTheFold?: RichTextNode;
            };
        };
    };
}

export interface FeedItemWrapper {
    entry?: PostEntry;
}

interface SherwoodPageProps {
    newsletters?: NewsletterEntry[];
    newsletter?: NewsletterEntry;
    mostRecent?: PostEntry[];
    feedResponse?: {
        feedItems?: Array<FeedItemWrapper | PostEntry>;
    };
    post?: PostEntry;
}

interface SherwoodNextData {
    buildId?: string;
    props?: {
        pageProps?: SherwoodPageProps;
    };
}

interface SherwoodNextDataPayload {
    pageProps?: SherwoodPageProps;
}

interface SherwoodPageResult {
    buildId?: string;
    pageProps: SherwoodPageProps;
}

export const toSafeUrl = (raw: string | undefined, allowMailto = false): string | undefined => {
    if (!raw) {
        return undefined;
    }
    const candidate = raw.trim();
    if (!candidate) {
        return undefined;
    }
    try {
        const parsed = new URL(candidate, SITE_ORIGIN);
        const allowed = allowMailto ? SAFE_LINK_PROTOCOLS : SAFE_IMAGE_PROTOCOLS;
        return allowed.has(parsed.protocol) ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

export const extractMediaImage = (media: { fields?: MediaFields } | undefined): { src: string; alt: string; caption?: string } | undefined => {
    const fields = media?.fields?.imgixImage ? media.fields : media?.fields?.image?.fields;
    const src = toSafeUrl(fields?.imgixImage?.src);
    if (!src) {
        return undefined;
    }
    const alt = fields?.altText?.trim() || '';
    const caption = fields?.caption?.trim() || fields?.credit?.trim();
    if (caption) {
        return { src, alt, caption };
    }
    return { src, alt };
};

export const fetchSherwoodPageData = async (url: string): Promise<SherwoodPageResult> => {
    const html = await ofetch(url, {
        headers: {
            'user-agent': config.trueUA,
        },
        publicOnly: true,
        retry: 2,
        retryDelay: 800,
    });
    const $ = load(html);
    const jsonText = $('script#__NEXT_DATA__').text();
    if (!jsonText) {
        return { pageProps: {} };
    }
    const parsed = JSON.parse(jsonText) as SherwoodNextData;
    return {
        buildId: parsed.buildId,
        pageProps: parsed.props?.pageProps ?? {},
    };
};

export const fetchSherwoodNextData = async (pageUrl: string, buildId?: string): Promise<SherwoodPageProps> => {
    if (!buildId) {
        const result = await fetchSherwoodPageData(pageUrl);
        return result.pageProps;
    }
    const parsed = new URL(pageUrl, SITE_ORIGIN);
    if (parsed.origin !== SITE_ORIGIN) {
        throw new Error(`Unexpected Sherwood origin: ${parsed.origin}`);
    }
    const stripped = parsed.pathname.endsWith('/') ? parsed.pathname.slice(0, -1) : parsed.pathname;
    const dataPath = stripped || '/index';
    const dataUrl = `${SITE_ORIGIN}/_next/data/${encodeURIComponent(buildId)}${dataPath}.json`;
    const payload = await ofetch<SherwoodNextDataPayload>(dataUrl, {
        headers: {
            'user-agent': config.trueUA,
        },
        publicOnly: true,
        retry: 2,
        retryDelay: 800,
    });
    return payload.pageProps ?? {};
};

export const hasUnresolvedLinks = (node: RichTextNode | undefined): boolean => {
    if (!node) {
        return false;
    }
    if ((node.nodeType === 'embedded-entry-block' || node.nodeType === 'embedded-entry-inline') && !node.data?.target?.fields) {
        return true;
    }
    return node.content?.some((child) => hasUnresolvedLinks(child)) ?? false;
};

const hasUnresolvedSectionLinks = (section: NewsletterSection): boolean => {
    const fields = section.fields;
    if (!fields) {
        return false;
    }
    const richTexts = [fields.body, fields.fact, fields.monday, fields.tuesday, fields.wednesday, fields.thursday, fields.friday];
    return richTexts.some((node) => hasUnresolvedLinks(node));
};

export const hasUnresolvedNewsletterLinks = (entry: NewsletterEntry): boolean => hasUnresolvedLinks(entry.fields?.openingWordsRichText) || (entry.fields?.sections ?? []).some((section) => hasUnresolvedSectionLinks(section));

export const buildNewsletterUrl = (slug: string): string => `${SITE_ORIGIN}${NEWSLETTER_PATH_PREFIX}${encodeURIComponent(slug)}/`;

export const buildPostUrl = (entry: PostEntry): string | undefined => {
    const slug = entry.fields?.slug?.trim();
    if (!slug) {
        return undefined;
    }
    const category = entry.fields?.primaryCategory?.fields?.slug?.trim() || entry.fields?.vertical?.fields?.slug?.trim();
    return category ? `${SITE_ORIGIN}/${encodeURIComponent(category)}/${encodeURIComponent(slug)}/` : `${SITE_ORIGIN}/markets/${encodeURIComponent(slug)}/`;
};
