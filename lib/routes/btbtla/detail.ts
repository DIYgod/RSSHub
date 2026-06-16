import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库

export const route: Route = {
    path: '/detail/:name/:lazy?',
    categories: ['multimedia'],
    example: '/btbtla/detail/雍正王朝',
    parameters: {
        name: '电影 | 电视剧名称',
        lazy: 'Pass `lazy` to skip up-front magnet resolution (fast; no BT enclosure)',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'BTBTLA | 指定剧名',
    maintainers: ['Hermes1030'],
    handler,
    description: `By default every torrent row is resolved to its magnet, so the feed carries real BT enclosures. Add \`/lazy\` (e.g. \`/btbtla/detail/雍正王朝/lazy\`) for a fast response that skips up-front resolution: rows are returned with their \`/tdown/\` page as the link and no enclosure — useful for clients that resolve a single magnet on demand.`,
};

const ROOT_URL = 'https://www.btbtla.com';
// A search can match many seasons/variants (海绵宝宝 → seasons + movies + spinoffs).
// Cap how many detail pages we open.
const MAX_ENTRIES = 24;
// Bound concurrent requests so a popular show doesn't burst hundreds of requests
// at btbtla and get the instance IP throttled/banned.
const CONCURRENCY = 5;

interface Row {
    title: string;
    downPage: string; // full URL to the row's /tdown/ page (where the magnet lives)
    quality: string;
    seasonTitle: string; // the season's detail-page title, e.g. "上载新生 第三季"
    seasonUrl: string; // the season's detail-page URL
}

// Season info is attached as extra fields for structured consumers reading the
// raw object; they are invisible to the rendered RSS/Atom/JSON (which only emit
// the standard DataItem fields).
type FeedItem = DataItem & { seasonTitle: string; seasonUrl: string };

async function handler(ctx) {
    const name = ctx.req.param('name');
    // /lazy → skip up-front magnet resolution; return the /tdown/ page links and
    // let the consumer resolve a single magnet on demand (much faster, but the feed
    // carries no BT enclosure). A path param (not a query) so it keys the route
    // cache distinctly — RSSHub's cache key is the path, query strings are ignored.
    const lazy = ctx.req.param('lazy') === 'lazy';

    // A title spans multiple seasons (上载新生 第一季…第四季), each its OWN detail
    // page. Fetch ALL matching entries (bounded) so every season is covered.
    const entries = await getEntries(name);
    if (entries.length === 0) {
        return null;
    }

    // Stage 1: open each season's detail page (bounded concurrency) and collect
    // every download row, tagged with its quality tab + season.
    const rows = (await pMap(entries.slice(0, MAX_ENTRIES), (entry) => parseDetail(entry), { concurrency: CONCURRENCY })).flat();

    // Stage 2: build items. Eager (default) resolves each /tdown/ row's magnet
    // (cache + bounded concurrency — magnets are immutable, so a warm cache makes
    // refreshes nearly free) and drops stale rows whose page 404'd. Lazy mode
    // returns the rows untouched.
    let items: FeedItem[];
    if (lazy) {
        items = rows.map((row) => buildItem(row, ''));
    } else {
        items = [];
        await pMap(
            rows,
            async (row) => {
                const isMagnetRow = row.downPage.includes('/tdown/');
                const { magnet } = isMagnetRow ? await cache.tryGet(`btbtla:magnet:${row.downPage}`, async () => ({ magnet: await getMagnet(row.downPage) })) : { magnet: '' };
                // Drop stale /tdown/ rows whose page 404'd (no magnet) — btbtla keeps
                // dead entries in its listing. Non-BT rows (e.g. /pdown/ netdisk) stay.
                if (isMagnetRow && !magnet) {
                    return;
                }
                items.push(buildItem(row, magnet));
            },
            { concurrency: CONCURRENCY }
        );
    }

    return {
        title: 'BTBTLA | ' + name,
        link: `${ROOT_URL}/search/${name}`,
        description: name,
        item: items,
    };
}

/** Build a feed item. `category` carries the native quality tab; the magnet (when
 *  resolved) goes into the standard BT enclosure. */
function buildItem(row: Row, magnet: string): FeedItem {
    return {
        title: row.quality ? `${row.title} [${row.quality}]` : row.title,
        link: row.downPage,
        guid: row.downPage,
        category: row.quality ? [row.quality] : undefined,
        enclosure_url: magnet || undefined,
        enclosure_type: magnet ? 'application/x-bittorrent' : undefined,
        seasonTitle: row.seasonTitle,
        seasonUrl: row.seasonUrl,
    };
}

/** Parse one season's detail page → all quality tabs × rows, each tagged with
 *  quality (native tab) + the season page title/url. No magnet fetch here — just
 *  collect the /tdown/ link; magnets are resolved later (eager mode), with caching. */
async function parseDetail(entry: { href: string; title: string }): Promise<Row[]> {
    const seasonUrl = ROOT_URL + entry.href;
    const $ = load(await ofetch(seasonUrl));
    const qualities = $('.module-tab-content .module-tab-item')
        .toArray()
        .map((el) => $(el).find('span[data-dropdown-value]').attr('data-dropdown-value')?.trim() || $(el).text().trim());
    const seasonTitle = $('.page-title').text().trim() || entry.title;

    const rows: Row[] = [];
    $('div[name=download-list] .module-downlist').each((i, dl) => {
        const quality = qualities[i] || '';
        $(dl)
            .find('.module-row-one .module-row-info')
            .each((_, info) => {
                const a = $(info).find('a.module-row-text');
                const href = a.attr('href');
                if (!href) {
                    return;
                }
                const title = $(info).find('.module-row-title h4').text().trim() || a.attr('title') || '';
                rows.push({ title, downPage: ROOT_URL + href, quality, seasonTitle, seasonUrl });
            });
    });
    return rows;
}

/** All distinct search results whose title contains the query (each is a season /
 *  variant with its own detail page). btbtla lists shows with a season suffix
 *  (e.g. "上载新生 第三季"), so an exact-title match finds nothing — match by
 *  contains, deduped by href. */
async function getEntries(name: string): Promise<{ href: string; title: string }[]> {
    const $ = load(await ofetch(`${ROOT_URL}/search/${name}`));
    const seen = new Set<string>();
    const out: { href: string; title: string }[] = [];
    $('.module-items .module-item-titlebox a[href^="/detail/"]').each((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).attr('title') ?? '';
        if (!href || seen.has(href) || !title.includes(name)) {
            return;
        }
        seen.add(href);
        out.push({ href, title });
    });
    return out;
}

/** Resolve a row's /tdown/ page → its magnet link. Returns '' on miss/failure so
 *  the value is cacheable AND one stale row (btbtla leaves dead /tdown/ pages that
 *  404) can't take down the whole feed. */
async function getMagnet(downPage: string): Promise<string> {
    try {
        const $ = load(await ofetch(downPage));
        return $('.btn-important').attr('href') ?? '';
    } catch {
        return '';
    }
}
