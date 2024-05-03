import { Route } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';
const host = 'https://www.digitalcameraworld.com';
export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/digitalcameraworld/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['digitalcameraworld.com/'],
        },
    ],
    name: 'News',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler() {
    const rssUrl = `${host}/feeds.xml`;
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.link);
                const $ = load(data);
                const description = $('#main');
                description.find('.slice-container-affiliateDisclaimer').remove();
                description.find('.slice-container-trending').remove();
                description.find('.slice-container-newsletterForm').remove();
                description.find('.slice-container-authorBio').remove();
                description.find('.slice-container-popularBox').remove();
                description.find('.breadcrumb').remove();
                description.find('.ad-unit').remove();
                description.find('.media-list').remove();
                description.find('p.vanilla-image-block').removeAttr('style');
                description.find('h1').remove();
                description.find('.byline-social').remove();
                description.find('.socialite-widget').remove();
                description.find('.fancy-box').remove();
                description.find('.sticky-nav__scroll-wrapper').remove();
                description.find('h4.separator-heading:contains("Related articles")').remove();
                description.find('[class*="kiosq"]').remove();
                description.find('[class*="hawk"]').remove();
                return {
                    title: item.title,
                    pubDate: item.pubDate,
                    link: item.link,
                    category: item.categories,
                    description: description.html(),
                };
            })
        )
    );

    return {
        title: 'Digital Camera World',
        link: host,
        description: 'Camera news, reviews and features',
        item: items,
    };
}
