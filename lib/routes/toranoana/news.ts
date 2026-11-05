import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:category?',
    categories: ['anime'],
    example: '/toranoana/news/toragen',
    parameters: { category: 'category' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['Tsuyumi25'],
    handler,
    radar: [
        {
            title: '総合新着記事',
            source: ['news.toranoana.jp'],
            target: '/news',
        },
        {
            title: '女性向け',
            source: ['news.toranoana.jp/joshi'],
            target: '/news/joshi',
        },
        {
            title: 'イラスト展',
            source: ['news.toranoana.jp/exhibitions'],
            target: '/news/exhibition',
        },
        {
            source: ['news.toranoana.jp/category/:category'],
            target: '/news/:category',
        },
    ],
    description: `::: warning TIP
[総合新着記事](https://news.toranoana.jp)→\`/toranoana/news\`\\
[女性向け](https://news.toranoana.jp/joshi)→\`/toranoana/news/joshi\`\\
[イラスト展](https://news.toranoana.jp/exhibitions)→\`/toranoana/news/exhibition\`\\
[\`https://news.toranoana.jp/category/media\`](https://news.toranoana.jp/category/media)→\`/toranoana/news/media\`
:::`,
};
function parsePubDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(/z|[+-]\d{2}:?\d{2}$/i.test(value) ? value : `${value}Z`);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
function getCategories(content: string) {
    const $ = load(content);
    return mapElements(
        $('h2')
            .filter((_, heading) => ['この記事のカテゴリー', 'この記事のタグ'].includes($(heading).text()))
            .next('div')
            .find('a'),
        (_, link) => $(link).text()
    );
}
async function handler(ctx): Promise<Data> {
    const { category = '' } = ctx.req.param();
    let apiUrl = 'https://news.toranoana.jp/wp-json/wp/v2/posts';
    if (category) {
        const categoryResponse = await ofetch(`https://news.toranoana.jp/wp-json/wp/v2/categories?slug=${category}`);
        if (categoryResponse && categoryResponse.length > 0) {
            apiUrl += `?categories=${categoryResponse[0].id}`;
        }
    } else {
        // exclude category-joshi to get result of general
        apiUrl += '?categories_exclude=1598';
    }
    const posts = await ofetch<
        Array<{
            title: {
                rendered: string;
            };
            content: {
                rendered: string;
            };
            link: string;
            date_gmt?: string;
            _embedded?: {
                author?: Array<{
                    name: string;
                }>;
            };
        }>
    >(apiUrl, {
        query: {
            per_page: 20,
            _embed: 'wp:featuredmedia,author',
        },
    });
    if (!posts || !posts.length) {
        throw new Error('No posts found');
    }
    const items = await pMap(
        posts,
        async (post) => ({
            title: post.title.rendered,
            link: post.link,
            description: await cache.tryGet(`toranoana:body:${post.link}`, async () => {
                const response = await ofetch(post.link, { responseType: 'text' });
                const $ = load(response);
                const content = $('.post-contents').first();
                if (!content.length) {
                    throw new Error(`Article content not found: ${post.link}`);
                }
                content.prepend(copyContent($('.post-main-img img').first(), $));
                content.find('img[data-src]').each((_, image) => {
                    const element = $(image);
                    element.attr('src', element.attr('data-src')!);
                });
                return $.html(content);
            }),
            pubDate: parsePubDate(post.date_gmt),
            category: getCategories(post.content.rendered),
            guid: post.link,
            author: post._embedded?.author?.map((author) => author.name).join(', ') || undefined,
        }),
        { concurrency: 3 }
    );
    return {
        title: category ? `とらのあな総合インフォメーション - ${category}` : 'とらのあな総合インフォメーション',
        link: category ? `https://news.toranoana.jp/category/${category}` : 'https://news.toranoana.jp/',
        description: 'とらのあなの最新情報をお届け！同人誌、書籍、コミック、店舗フェア、イラスト展、とらのあな限定版、キャンペーンなど…スペシャルでお得な情報をいち早くチェック！',
        item: items.filter(Boolean),
        language: 'ja',
    };
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
