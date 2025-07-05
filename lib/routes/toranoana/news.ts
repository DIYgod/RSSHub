import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

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
    description: `
::: warning TIP
[総合新着記事](https://news.toranoana.jp)→\`/toranoana/news\`  
[女性向け](https://news.toranoana.jp/joshi)→\`/toranoana/news/joshi\`  
[イラスト展](https://news.toranoana.jp/exhibitions)→\`/toranoana/news/exhibition\`  
[\`https://news.toranoana.jp/category/media\`](https://news.toranoana.jp/category/media)→\`/toranoana/news/media\`
:::`,
};

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
        apiUrl += `?categories_exclude=1598`;
    }

    const posts = await ofetch(apiUrl, {
        query: {
            per_page: 20,
            _embed: 'wp:featuredmedia',
        },
    });

    if (!posts || !posts.length) {
        throw new Error('No posts found');
    }

    const items = posts.map((post) => {
        const $ = load(post.content.rendered);

        // remove unnecessary title
        $('h1').first().remove();
        $('h2').first().remove();

        let thumbnail = '';
        if (post._embedded && post._embedded['wp:featuredmedia'][0].source_url) {
            thumbnail = post._embedded['wp:featuredmedia'][0].source_url;
        }

        if (thumbnail) {
            $('body').prepend(`<img src="${thumbnail}" alt="${post.title.rendered}" />`);
        }

        return {
            title: post.title.rendered,
            link: post.link,
            description: $.html(),
            pubDate: parseDate(post.date_gmt),
            guid: post.link,
            author: 'とらのあな',
        };
    });

    return {
        title: category ? `とらのあな総合インフォメーション - ${category}` : 'とらのあな総合インフォメーション',
        link: category ? `https://news.toranoana.jp/category/${category}` : 'https://news.toranoana.jp/',
        description: 'とらのあなの最新情報をお届け！同人誌、書籍、コミック、店舗フェア、イラスト展、とらのあな限定版、キャンペーンなど…スペシャルでお得な情報をいち早くチェック！',
        item: items.filter(Boolean) as DataItem[],
        language: 'ja',
    };
}
