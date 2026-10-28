import { type CheerioAPI, load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const rootUrl = 'https://ac.qq.com';
const mobileRootUrl = 'https://m.ac.qq.com';
export const parseComicPage = ($: CheerioAPI) => {
    const desktop = $('.chapter-page-all a').length > 0;
    const chapterLinks = desktop ? $('.chapter-page-all a') : $('.reverse .bottom-chapter-item .chapter-link');
    const chapters = chapterLinks.toArray().flatMap((chapter) => {
        const $chapter = $(chapter);
        const href = $chapter.attr('href');
        if (!href) {
            return [];
        }
        return {
            link: new URL(href.replace(/chapter/, 'ComicView'), rootUrl).href,
            title: desktop ? $chapter.text() : $chapter.find('.comic-title').text() || $chapter.text(),
            image: $chapter.find('.cover-image').attr('src'),
        };
    });
    return {
        author: $('.works-author-name, .author-wr')
            .toArray()
            .map((a) => $(a).text().trim())
            .join(', '),
        image: $('.works-cover img, .head-cover').first().attr('src'),
        description: $('.works-intro-short, .head-info-desc').first().text(),
        chapters: desktop ? chapters.toReversed() : chapters,
    };
};
const ProcessItems = async (ctx, currentUrl, time, title) => {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 30;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $(`${time ? `.${time}-month-data ` : ''}.text-overflow`)
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { guid: string } => {
            const $item = $(item);

            return {
                title: $item.text(),
                guid: `${rootUrl}${$item.attr('href')}`,
                link: `${mobileRootUrl}${$item.attr('href')!.replace(/Comic\/ComicInfo/, 'comic/index')}`,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.link = item.guid;
                const info = parseComicPage(content);
                item.author = info.author;
                item.description = renderToString(<QqAcDescription {...info} />);

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `${title} - 腾讯动漫`,
        link: currentUrl,
        item: items,
    };
};

export { mobileRootUrl, ProcessItems, rootUrl };

const QqAcDescription = ({ image, description, chapters }: { image?: string; description: string; chapters: Array<{ link?: string; title?: string; image?: string }> }) => (
    <>
        {image ? <img src={image} /> : null}
        {description === '' ? null : <p>{description}</p>}
        {chapters.map((chapter) => (
            <div>
                {chapter.image ? <img src={chapter.image} /> : null}
                <a href={chapter.link}>{chapter.title}</a>
            </div>
        ))}
    </>
);
