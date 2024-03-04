// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const response = await got(`https://m.qidian.com/book/${id}.html`);
    const $ = load(response.data);

    const name = $('meta[property="og:title"]').attr('content');
    const coverUrl = `https:${$('.detail__header-cover__img').attr('src')}`;

    const { data: catalog } = await got(`https://m.qidian.com/book/${id}/catalog/`);
    const $c = load(catalog);
    const { pageContext } = JSON.parse($c('#vite-plugin-ssr_pageContext').text());

    const chapterItem = pageContext.pageProps.pageData.vs
        .flatMap((v) => v.cs)
        .map((c) => ({
            title: c.cN,
            pubDate: parseDate(c.uT),
            link: `https://vipreader.qidian.com/chapter/${id}/${c.id}`,
        }));

    ctx.set('data', {
        title: `起点 ${name}`,
        link: `https://book.qidian.com/info/${id}`,
        description: $('#bookSummary content').text(),
        image: coverUrl,
        item: chapterItem,
    });
};
