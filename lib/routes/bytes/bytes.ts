// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const currentURL = 'https://bytes.dev/archives';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const resp = await got(currentURL);
    const $ = load(resp.data);
    const text = $('script#__NEXT_DATA__').text();
    const json = JSON.parse(text);
    const posts = [json.props.pageProps.featuredPost, ...json.props.pageProps.posts];
    const items = posts.map((item) => ({
        title: `Issue ${item.slug}`,
        pubDate: parseDate(item.date),
        description: item.title,
        link: `/archives/${item.slug}`,
    }));

    ctx.set('data', {
        title: 'bytes.dev',
        description: 'Your weekly dose of JS',
        link: currentURL,
        item: items,
    });
};
