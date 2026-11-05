import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface AuctionItem {
    auctionId: string;
    title: string;
    imageUrl: string;
    price: number;
    buyNowPrice: number | null;
    isFixedPrice: boolean;
    isFreeShipping: boolean;
    currentPriceShippingFee: number | null;
    bidCount: number;
    startTime: string;
    endTime: string;
    categoryPath: Array<{ id: number; name: string }>;
}

export const route: Route = {
    path: '/auctions/search/:query',
    categories: ['shopping'],
    example: '/yahoo/auctions/search/p=カメラ&aucmaxprice=10000',
    parameters: {
        query: 'Search conditions, the query string of a search result URL on auctions.yahoo.co.jp, e.g. `p=カメラ&auccat=23632&aucmaxprice=10000`. Every condition the site supports works, including those set in 条件指定. Newest listings come first unless `s1` is set',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Yahoo! Auctions Search',
    maintainers: ['pseudoyu'],
    url: 'auctions.yahoo.co.jp',
    handler,
    description: `Search conditions are passed to the site as is, so the easiest way to build a feed is to search on [Yahoo! Auctions](https://auctions.yahoo.co.jp), then copy everything after \`?\` in the result URL.

::: warning
Yahoo! JAPAN services are not available from the EEA and the UK.
:::`,
};

const formatPrice = (price: number) => `¥${price.toLocaleString('ja-JP')}`;

const renderDescription = (item: AuctionItem) =>
    renderToString(
        <>
            <img src={item.imageUrl} />
            <p>{item.isFixedPrice ? `即決 ${formatPrice(item.price)}` : `現在 ${formatPrice(item.price)}${item.buyNowPrice ? ` / 即決 ${formatPrice(item.buyNowPrice)}` : ''}`}</p>
            {item.isFreeShipping ? <p>送料無料</p> : item.currentPriceShippingFee ? <p>送料 {formatPrice(item.currentPriceShippingFee)}</p> : null}
            <p>入札 {item.bidCount}</p>
            {/* endTime is always JST, e.g. 2026-11-04T20:41:25+09:00 */}
            <p>終了 {item.endTime.slice(0, 16).replace('T', ' ')}</p>
        </>
    );

async function handler(ctx) {
    const searchParams = new URLSearchParams(ctx.req.param('query'));
    // Default to newest listings first, so the feed picks up new items
    if (!searchParams.has('s1')) {
        searchParams.set('s1', 'new');
        searchParams.set('o1', 'd');
    }
    const link = `https://auctions.yahoo.co.jp/search/search?${searchParams}`;

    // A search with no results answers 404 but still embeds an empty list
    const response = await ofetch(link, { ignoreResponseError: true });
    const $ = load(response);
    const nextData = $('script#__NEXT_DATA__').text();
    if (!nextData) {
        throw new Error('Yahoo! Auctions did not return search data (__NEXT_DATA__). Yahoo! JAPAN is not available from the EEA and the UK.');
    }
    const items: AuctionItem[] = JSON.parse(nextData).props.pageProps.initialState.search.items.listing.items;

    return {
        title: $('title').text(),
        link,
        language: 'ja' as const,
        item: items.map((item) => ({
            title: item.title,
            link: `https://auctions.yahoo.co.jp/jp/auction/${item.auctionId}`,
            description: renderDescription(item),
            pubDate: parseDate(item.startTime),
            category: item.categoryPath.slice(1).map((category) => category.name),
            image: item.imageUrl,
        })),
        allowEmpty: true,
    };
}
