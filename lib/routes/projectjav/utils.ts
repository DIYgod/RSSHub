import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://projectjav.com';
const processItems = async (currentUrl: string): Promise<Data> => {
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items: DataItem[] = $('div.video-item')
        .toArray()
        .map((element) => {
            const item = $(element);
            const link = item.find('a').attr('href');
            return {
                title: item.find('div.name span').text(),
                link: link?.startsWith('http') ? link : `${rootUrl}${link}`,
            };
        })
        .filter((item) => item.link && /\/movie\/.*/.test(item.link));

    items = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`projectjav:article:v2:${item.link}`, async () => {
                const detail: Partial<DataItem> = {};
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                // Remove ads
                content('div.top-banner-ads, div.bottom-content-ads').remove();

                // Get main content
                const mainContent = content('main');

                // Extract title
                const h1Title = mainContent.find('h1').text();
                if (h1Title) {
                    detail.title = h1Title;
                }

                // Extract categories
                const categories = mainContent
                    .find('div.badge a')
                    .toArray()
                    .map((v) => content(v).text().trim())
                    .filter(Boolean);
                if (categories.length > 0) {
                    detail.category = categories;
                }

                // Extract author/actress (support multiple actresses)
                const actresses = mainContent
                    .find('div.actress-item a')
                    .toArray()
                    .map((v) => content(v).text().trim())
                    .filter(Boolean);
                if (actresses.length > 0) {
                    detail.author = actresses.join(', ');
                }

                // Extract date
                const dateEl = mainContent
                    .find('div.second-main~div.row>div.col-3')
                    .toArray()
                    .find((el) => content(el).text().includes('Date added'));
                const dateText = dateEl ? content(dateEl).next().text().trim() : null;
                if (dateText) {
                    // ProjectJAV uses DD/MM/YYYY format
                    detail.pubDate = parseDate(dateText, 'DD/MM/YYYY');
                }

                // Metadata belongs in the item fields rather than the article body.
                mainContent.find('h1, div.badge, div.actress-item').remove();
                if (dateEl) {
                    content(dateEl).next().remove();
                    content(dateEl).remove();
                }

                // Get description
                detail.description = mainContent.html();

                return detail;
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text() || 'ProjectJAV',
        link: currentUrl,
        language: 'en',
        item: items,
    };
};

export { processItems, rootUrl };
