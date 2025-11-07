import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { DataItem } from '@/types';

const rootUrl = 'https://projectjav.com';
const processItems = async (currentUrl: string, tryGet) => {
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
                title: item.find('div.name span').text() || '',
                link: link?.startsWith('http') ? link : `${rootUrl}${link}`,
            };
        })
        .filter((item) => item.link && /\/movie\/.*/.test(item.link));

    items = await Promise.all(
        items.map((item) =>
            tryGet(item.link!, async () => {
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
                const h1Title = mainContent.find('h1').text().trim();
                if (h1Title) {
                    item.title = h1Title;
                }

                // Extract categories
                const categories = mainContent
                    .find('div.badge a')
                    .toArray()
                    .map((v) => content(v).text().trim())
                    .filter(Boolean);
                if (categories.length > 0) {
                    item.category = categories;
                }

                // Extract author/actress (support multiple actresses)
                const actresses = mainContent
                    .find('div.actress-item a')
                    .toArray()
                    .map((v) => content(v).text().trim())
                    .filter(Boolean);
                if (actresses.length > 0) {
                    item.author = actresses.join(', ');
                }

                // Extract date
                let dateText: string | null = null;
                mainContent
                    .find('div.second-main~div.row>div.col-3')
                    .toArray()
                    .some((el) => {
                        if (content(el).text().includes('Date added')) {
                            dateText = content(el).next().text().trim();
                            return true;
                        }
                        return false;
                    });
                if (dateText) {
                    // ProjectJAV uses DD/MM/YYYY format
                    item.pubDate = parseDate(dateText, 'DD/MM/YYYY');
                }

                // Get description
                item.description = mainContent.html() || '';

                return item;
            })
        )
    );

    return {
        title: $('title').text() || 'ProjectJAV',
        link: currentUrl,
        item: items,
    };
};

export { processItems, rootUrl };
