import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface SpaceCardData {
    emoji?: string;
    license?: string;
    sdk?: string;
    short_description?: string;
    title?: string;
}

interface SpaceRuntime {
    hardware?: {
        current?: string | null;
        requested?: string | null;
    };
    stage?: string;
}

interface SpaceItem {
    id: string;
    author?: string;
    cardData?: SpaceCardData;
    createdAt?: string;
    lastModified?: string;
    likes?: number;
    private?: boolean;
    runtime?: SpaceRuntime;
    sdk?: string;
    shortDescription?: string;
    tags?: string[];
}

const apiLimit = '100';
const sdkOptions = ['all', 'gradio', 'streamlit', 'docker', 'static'];
const hardwareOptions = ['all', 'cpu', 'gpu'];
const runningOptions = ['all', 'running'];
const sortOptions = ['createdAt', 'likes', 'trendingScore'];

export const route: Route = {
    path: '/spaces/:query/:sdk?/:hardware?/:running?/:sort?',
    categories: ['programming'],
    example: '/huggingface/spaces/Whisper/gradio',
    parameters: {
        query: 'Search keyword',
        sdk: {
            description: 'SDK filter',
            options: sdkOptions.map((value) => ({ value, label: value })),
            default: 'all',
        },
        hardware: {
            description: 'Hardware filter',
            options: hardwareOptions.map((value) => ({ value, label: value })),
            default: 'all',
        },
        running: {
            description: 'Runtime filter',
            options: runningOptions.map((value) => ({ value, label: value })),
            default: 'all',
        },
        sort: {
            description: 'Sort order',
            options: sortOptions.map((value) => ({ value, label: value })),
            default: 'createdAt',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huggingface.co/spaces'],
        },
    ],
    name: 'Spaces Search',
    maintainers: ['JaggerH'],
    handler,
    url: 'huggingface.co/spaces',
};

async function handler(ctx) {
    const { query, sdk = 'all', hardware = 'all', running = 'all', sort = 'createdAt' } = ctx.req.param();
    validateParameter('sdk', sdk, sdkOptions);
    validateParameter('hardware', hardware, hardwareOptions);
    validateParameter('running', running, runningOptions);
    validateParameter('sort', sort, sortOptions);

    const pageSearchParams = new URLSearchParams({ search: query });
    if (sdk !== 'all') {
        pageSearchParams.set('sdk', sdk);
    }
    if (hardware !== 'all') {
        pageSearchParams.set('hardware', hardware);
    }
    if (running === 'running') {
        pageSearchParams.set('includeNonRunning', 'false');
    }
    const link = `https://huggingface.co/spaces?${pageSearchParams.toString()}`;
    const searchParams = new URLSearchParams({
        search: query,
        sort,
        direction: '-1',
        limit: apiLimit,
        full: 'true',
    });

    const spaces = await ofetch<SpaceItem[]>(`https://huggingface.co/api/spaces?${searchParams.toString()}`);

    const items: DataItem[] = spaces
        .filter((space) => matchesFilters(space, sdk, hardware, running))
        .map((space) => {
            const itemLink = `https://huggingface.co/spaces/${space.id}`;
            const title = space.cardData?.title || space.id;
            const tags = space.tags ?? [];
            const sdk = space.cardData?.sdk || space.sdk;
            const runtimeHardware = getRuntimeHardware(space);
            const metadata = [
                space.cardData?.short_description || space.shortDescription,
                sdk ? `SDK: ${sdk}` : undefined,
                runtimeHardware ? `Hardware: ${runtimeHardware}` : undefined,
                space.runtime?.stage ? `Runtime: ${space.runtime.stage}` : undefined,
                typeof space.likes === 'number' ? `Likes: ${space.likes}` : undefined,
                space.cardData?.license ? `License: ${space.cardData.license}` : undefined,
            ].filter(Boolean);

            return {
                title: space.cardData?.emoji ? `${space.cardData.emoji} ${title}` : title,
                link: itemLink,
                description: metadata.join('<br>'),
                author: space.author,
                category: tags,
                pubDate: space.createdAt ? parseDate(space.createdAt) : undefined,
                updated: space.lastModified ? parseDate(space.lastModified) : undefined,
            };
        });

    return {
        title: `Huggingface Spaces Search: ${query}`,
        link,
        item: items,
    };
}

function validateParameter(name: string, value: string, options: string[]) {
    if (!options.includes(value)) {
        throw new InvalidParameterError(`Invalid ${name}: ${value}. Valid values are: ${options.join(', ')}`);
    }
}

function matchesFilters(space: SpaceItem, sdk: string, hardware: string, running: string) {
    return matchesSdk(space, sdk) && matchesHardware(space, hardware) && matchesRunning(space, running);
}

function matchesSdk(space: SpaceItem, sdk: string) {
    return sdk === 'all' || (space.cardData?.sdk || space.sdk) === sdk;
}

function matchesHardware(space: SpaceItem, hardware: string) {
    if (hardware === 'all') {
        return true;
    }

    const runtimeHardware = getRuntimeHardware(space);
    if (!runtimeHardware) {
        return false;
    }

    return hardware === 'cpu' ? runtimeHardware.startsWith('cpu') : !runtimeHardware.startsWith('cpu');
}

function matchesRunning(space: SpaceItem, running: string) {
    return running === 'all' || space.runtime?.stage === 'RUNNING';
}

function getRuntimeHardware(space: SpaceItem) {
    return space.runtime?.hardware?.current || space.runtime?.hardware?.requested;
}
