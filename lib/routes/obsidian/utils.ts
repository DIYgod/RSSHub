import type { Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type CommunityEntryType = 'plugin' | 'theme';

type CommunitySearchConfig = {
    apiKey: string;
    url: string;
};

type CommunitySearchHit = {
    document: {
        authors?: string[];
        github_created_at?: string;
        github_updated_at?: string;
        id: string;
        latest_release_at?: string;
        name: string;
        short_desc?: string;
        slug: string;
        tags?: string[];
        type: CommunityEntryType;
    };
};

type CommunitySearchResponse = {
    hits?: CommunitySearchHit[];
};

const hitsPerPage = 54;
const searchPageBaseUrl = 'https://community.obsidian.md/search';
const titleRegex = /([^/]+)\.md$/;

export async function buildCommunityFeed(type: CommunityEntryType): Promise<Data> {
    const pageUrl = getSearchPageUrl(type);
    const searchConfig = await getSearchConfig(pageUrl);
    const data = await ofetch<CommunitySearchResponse>(`${searchConfig.url}/collections/entries/documents/search`, {
        headers: {
            'X-TYPESENSE-API-KEY': searchConfig.apiKey,
        },
        query: {
            filter_by: `type:=${type}`,
            per_page: hitsPerPage,
            q: '*',
            query_by: 'name,authors,short_desc',
            sort_by: 'github_created_at:desc',
        },
    });

    return {
        title: `Obsidian ${type === 'plugin' ? 'Plugins' : 'Themes'}`,
        link: pageUrl,
        item: data.hits?.map(({ document }) => buildItem(document)) ?? [],
    };
}

export function getTitle(path: string): string {
    const match = path.match(titleRegex);
    return match ? match[1] : '';
}

function getSearchPageUrl(type: CommunityEntryType) {
    const url = new URL(searchPageBaseUrl);
    url.searchParams.set('type', type);
    url.searchParams.set('sort', 'created');

    return url.toString();
}

async function getSearchConfig(pageUrl: string): Promise<CommunitySearchConfig> {
    const html = await ofetch<string>(pageUrl);
    const match = html.match(/apiKey\\":\\"([^"\\]+)\\"[\s\S]*?url\\":\\"([^"\\]+)\\"/) ?? html.match(/"apiKey":"([^"]+)"[\s\S]*?"url":"([^"]+)"/);

    if (!match) {
        throw new Error('Unable to locate Obsidian community search API config');
    }

    return {
        apiKey: match[1],
        url: match[2].replaceAll(String.raw`\/`, '/'),
    };
}

function buildItem(document: CommunitySearchHit['document']): DataItem {
    return {
        title: document.name,
        description: document.short_desc,
        link: `https://community.obsidian.md/${document.type}s/${document.slug}`,
        guid: `${document.type}:${document.id}`,
        pubDate: document.github_created_at ? parseDate(document.github_created_at) : undefined,
        updated: document.latest_release_at ? parseDate(document.latest_release_at) : document.github_updated_at ? parseDate(document.github_updated_at) : undefined,
        author: document.authors?.join(', '),
        category: document.tags,
    };
}
