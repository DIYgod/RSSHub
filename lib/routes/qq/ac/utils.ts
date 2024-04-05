import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

const rootUrl = 'https://ac.qq.com';
const mobileRootUrl = 'https://m.ac.qq.com';
const ProcessItems = async (ctx, currentUrl, time, title) => {
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $(`${time ? `.${time}-month-data ` : ''}.text-overflow`)
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                guid: `${rootUrl}${item.attr('href')}`,
                link: `${mobileRootUrl}${item.attr('href').replace(/Comic\/ComicInfo/, 'comic/index')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.link = item.guid;
                item.author = content('.author-wr')
                    .toArray()
                    .map((a) => $(a).text().trim())
                    .join(', ');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('.head-cover')?.attr('src') ?? '',
                    description: content('.head-info-desc')?.text() ?? '',
                    chapters: content('.reverse .bottom-chapter-item .chapter-link')
                        .toArray()
                        .map((chapter) => ({
                            link: content(chapter).attr('href'),
                            title: content(chapter).find('.comic-title')?.text() ?? '',
                            image: content(chapter).find('.cover-image')?.attr('src') ?? '',
                        })),
                });

                return item;
            })
        )
    );

    return {
        title: `${title} - 腾讯动漫`,
        link: currentUrl,
        item: items,
    };
};

export { rootUrl, mobileRootUrl, ProcessItems };
