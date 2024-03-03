// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://github.com';

export default async (ctx) => {
    const { user, repo, page } = ctx.req.param();

    const url = `${baseUrl}/${user}/${repo}/wiki${page ? `/${page}` : ''}/_history`;

    const { data } = await got(url);
    const $ = load(data);

    const items = $('.js-wiki-history-revision')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.h5').text(),
                author: item.find('.mt-1 a').text(),
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                link: `${baseUrl}${item.find('.text-mono a').attr('href')}`,
            };
        });

    ctx.set('data', {
        title: `${$('.gh-header-title').text()} - ${user}/${repo}`,
        link: url,
        item: items,
    });
};
