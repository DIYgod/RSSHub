import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id?',
    categories: ['blog'],
    example: '/wangwusiwj',
    parameters: { id: 'RSS 抓取地址：https://wangwusiwj.blogspot.com/:id?，默认为当前年份' },
    name: '文章',
    maintainers: ['prnake'],
    handler,
};

function parsePublicationMetadata(text: string) {
    const label = /作者\s*[:：]( *)/.exec(text);
    if (!label) {
        return;
    }
    const remainder = text.slice(label.index + label[0].length);
    const date = / (\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?/.exec(remainder);
    if (date) {
        return [text.slice(label.index, label.index + label[0].length + date.index + date[0].length), remainder.slice(0, date.index), date[1], date[2], date[3]];
    }
    const immediateDate = label[1] && /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?/.exec(remainder);
    if (immediateDate) {
        return [text.slice(label.index, label.index + label[0].length + immediateDate[0].length), '', immediateDate[1], immediateDate[2], immediateDate[3]];
    }
}

async function handler(ctx: Context) {
    const { id = String(new Date().getFullYear()) } = ctx.req.param();
    const url = `https://wangwusiwj.blogspot.com/${id}`;
    const [response, sitemap] = await Promise.all([ofetch(url), ofetch('https://wangwusiwj.blogspot.com/sitemap.xml', { responseType: 'text' })]);

    const $ = load(response);
    const $sitemap = load(sitemap, { xml: true });
    const lastModifiedDates = new Map(
        $sitemap('url')
            .toArray()
            .map((e) => [$sitemap(e).find('loc').text(), $sitemap(e).find('lastmod').text()])
    );

    const list = $('div.post')
        .toArray()
        .map((e) => {
            const link = $(e).find('h3 > a').attr('href');
            const body = $(e).find('.post-body');
            const metadataElement = body
                .children('p')
                .filter((_, element) => /^\s*作者\s*[:：]/.test($(element).text()))
                .first();
            const metadata = parsePublicationMetadata(metadataElement.text().replaceAll(/\s+/g, ' '));
            const publicationDate = metadata ? timezone(parseDate(`${metadata[2]}-${metadata[3].padStart(2, '0')}-${metadata[4].padStart(2, '0')}`, 'YYYY-MM-DD', true), 8) : undefined;
            const lastModified = link ? lastModifiedDates.get(link) : undefined;
            const updated = lastModified ? parseDate(lastModified) : undefined;
            if (metadata) {
                metadataElement.remove();
            }
            return {
                title: $(e).find('h3 > a').text(),
                description: body.html(),
                link,
                author: metadata?.[1],
                pubDate: publicationDate && !Number.isNaN(publicationDate.getTime()) ? publicationDate : undefined,
                updated: updated && !Number.isNaN(updated.getTime()) ? updated : undefined,
            };
        });

    return {
        title: '王五四文集',
        link: url,
        item: list,
    };
}
