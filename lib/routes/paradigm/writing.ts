// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.paradigm.xyz';

export default async (ctx) => {
    const url = `${baseUrl}/writing`;

    const response = await got(url);
    const $ = load(response.data);

    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const buildId = nextData.buildId;
    const list = nextData.props.pageProps.posts.map((item) => ({
        title: item.title,
        link: `${baseUrl}${item.slug}`,
        api: `${baseUrl}/_next/data/${buildId}${item.slug}.json`,
        author: item.authors.map((author) => author.name).join(', '),
        pubDate: parseDate(item.originalDate),
        category: item.tags,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.api);
                const $ = load(response.data.pageProps.content, null, false);

                // Remove the TOC
                $('.toc').remove();
                item.description = $.html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Paradigm - Writing',
        link: url,
        item: items,
    });
};
