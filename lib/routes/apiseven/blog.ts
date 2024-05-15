import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import MarkdownIt from 'markdown-it';

const md = MarkdownIt({
    html: true,
});

async function getArticles() {
    const url = 'https://www.apiseven.com/blog';
    const { data: res } = await got(url);
    const $ = load(res);
    const json = JSON.parse($('#__NEXT_DATA__').text());
    return json.props.pageProps.list.map((item) => ({
        title: item.title,
        link: 'https://www.apiseven.com' + item.slug,
        pubDate: timezone(parseDate(item.published_at), +8),
        category: item.tags,
    }));
}

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/apiseven/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '博客',
    maintainers: ['aneasystone'],
    handler,
};

async function handler() {
    const articles = await getArticles();
    const items = await Promise.all(
        articles.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: res } = await got(item.link);
                const $ = load(res);
                const json = JSON.parse($('#__NEXT_DATA__').text());
                return {
                    title: item.title,
                    description: md.render(json.props.pageProps.post.content),
                    link: item.link,
                    pubDate: item.pubDate,
                    author: json.props.pageProps.post.author_name,
                };
            })
        )
    );

    return {
        title: '博客 | 支流科技',
        link: 'https://www.apiseven.com/blog',
        item: items,
    };
}
