import cache from '@/utils/cache';
// common.js
import { load } from 'cheerio';
import got from '@/utils/got';
import categoryTitle from './category-title';
import newsContent from './news-content';
import indexPage from './index-page';

async function getContent(ctx, { baseHost, baseCategory, baseType, baseTitle, baseDescription = '', baseDeparment = '', baseClass = 'div.article_list ul li:has(a)' }) {
    const { category = baseCategory, type = baseType, page = '1' } = ctx.req.param();

    const title = `${baseTitle} - ${categoryTitle(category)}`;
    const description = baseDescription ? `${baseDescription} - ${categoryTitle(category)}` : title;

    const typeURL = type ? `/${type}` : '';
    const baseURl = `${baseHost}${typeURL}/${category}`;
    const url = `${baseURl}/${indexPage(page)}`;

    const { data: response } = await got(url);
    const $ = load(response);

    const list = $(baseClass)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');
            const href = a.attr('href');
            const title = a.text();
            const link = href.startsWith('./') && !href.endsWith('.pdf') ? `${baseURl}${href.replace('./', '/')}` : href;

            return {
                title,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const content = await newsContent(item.link, baseDeparment);

                item.pubDate = content.pubDate;
                item.description = content.description;

                return item;
            })
        )
    );

    return {
        // 源标题
        title,
        description,
        // 源链接
        link: url,
        // 源文章
        item: items,
    };
}

export default getContent;
