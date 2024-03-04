// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const md = require('markdown-it')({
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

export default async (ctx) => {
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

    ctx.set('data', {
        title: '博客 | 支流科技',
        link: 'https://www.apiseven.com/blog',
        item: items,
    });
};
