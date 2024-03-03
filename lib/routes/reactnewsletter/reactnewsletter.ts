// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const currentURL = 'https://reactnewsletter.com/issues';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const resp = await got(currentURL);
    const $ = load(resp.data);
    const text = $('script#__NEXT_DATA__').text();
    const json = JSON.parse(text);

    const items = json.props.pageProps.issues.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.date),
        description: item.summary,
        link: `/issues/${item.slug}`,
    }));

    ctx.set('data', {
        title: 'reactnewsletter.dev',
        description: 'Stay up to date on the latest React news, tutorials, resources, and more. Delivered every Tuesday, for free.',
        link: currentURL,
        item: items,
    });
};
