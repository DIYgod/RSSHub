import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { evaluateScriptData } from '@/utils/evaluate-script';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.hotukdeals.com';

const typePaths = {
    Deal: 'deals',
    Voucher: 'vouchers',
    Discussion: 'discussions',
};

interface Thread {
    threadId: string;
    titleSlug: string;
    title: string;
    type: keyof typeof typePaths;
    publishedAt: number;
    merchant?: { merchantName: string };
    mainImage?: { path: string; name: string };
    user?: { username: string };
}

interface ThreadDetail {
    threadDetails?: { preparedHtmlDescription?: string };
    groups?: Array<{ threadGroupName: string }>;
}

export const route: Route = {
    path: '/tag/:tag/:sort?',
    categories: ['shopping'],
    example: '/hotukdeals/tag/flight',
    parameters: {
        tag: 'Tag, can be found in URL, e.g. `flight` for `https://www.hotukdeals.com/tag/flight`',
        sort: {
            description: 'Sort order',
            default: 'new',
            options: [
                { value: 'new', label: 'Most recent' },
                { value: 'temp', label: 'Hottest' },
                { value: 'highest_price', label: 'Highest price' },
                { value: 'lowest_price', label: 'Lowest price' },
                { value: 'discussion', label: 'Recently commented' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.hotukdeals.com/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Tag',
    maintainers: ['zhgqthomas'],
    handler,
    url: 'www.hotukdeals.com',
};

const getImage = (mainImage: Thread['mainImage']) => (mainImage ? `https://images.hotukdeals.com/${mainImage.path}/${mainImage.name}/re/768x768/qt/60/${mainImage.name}.jpg` : undefined);

const getThreadDetail = async (link: string) => {
    const response = await ofetch(link);
    const $ = load(response);
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((source) => source.includes('__INITIAL_STATE__'));
    const { threadDetail } = await evaluateScriptData<{ threadDetail: ThreadDetail }>(script ?? '', '__INITIAL_STATE__');
    return threadDetail;
};

async function handler(ctx) {
    const { tag, sort = 'new' } = ctx.req.param();
    const link = `${rootUrl}/tag/${tag}`;

    const response = await ofetch.raw<string>(`${link}?sortBy=${sort}`);
    if (new URL(response.url).pathname !== `/tag/${tag}`) {
        throw new Error(`Tag "${tag}" does not exist on hotukdeals`);
    }
    const $ = load(response._data ?? '');

    const threads = $('[data-vue3]')
        .toArray()
        .map((element) => JSON.parse($(element).attr('data-vue3') ?? '{}'))
        .filter((data) => data.name === 'ThreadMainListItemNormalizer')
        .map((data) => data.props.thread as Thread);

    const items = await Promise.all(
        threads.map((thread) => {
            const itemLink = `${rootUrl}/${typePaths[thread.type] ?? 'deals'}/${thread.titleSlug}-${thread.threadId}`;
            const image = getImage(thread.mainImage);

            return cache.tryGet(itemLink, async () => {
                const threadDetail = await getThreadDetail(itemLink);
                const category = (threadDetail.groups ?? []).map((group) => group.threadGroupName);
                if (thread.merchant?.merchantName) {
                    category.push(thread.merchant.merchantName);
                }

                return {
                    title: thread.title,
                    link: itemLink,
                    description: (image ? `<img src="${image}"><br>` : '') + (threadDetail.threadDetails?.preparedHtmlDescription ?? ''),
                    pubDate: parseDate(thread.publishedAt, 'X'),
                    author: thread.user?.username,
                    category,
                    image,
                } as DataItem;
            });
        })
    );

    return {
        title: `hotukdeals - ${tag}`,
        link,
        item: items as DataItem[],
    };
}
