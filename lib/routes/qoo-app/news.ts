import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { fixImg, newsUrl, siteIcon } from './utils';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['anime'],
    example: '/qoo-app/news/en',
    parameters: { lang: 'Language, see the table below, empty means `中文`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    description: `| 中文 | English |
| ---- | ------- |
|      | en      |`,
};

async function handler(ctx) {
    const { lang = '' } = ctx.req.param();
    const apiUrl = `${newsUrl}${lang ? `/${lang}` : ''}/wp-json/wp/v2/posts`;

    const { data } = await got(apiUrl, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
        },
    });

    const items = data.map((item) => {
        const $ = load(item.content.rendered, null, false);

        fixImg($);

        return {
            title: item.title.rendered,
            link: item.link.slice(0, item.link.lastIndexOf('/')),
            description: $.html(),
            pubDate: parseDate(item.date_gmt),
        };
    });

    return {
        title: 'QooApp : Anime Game Platform',
        description:
            lang === 'en'
                ? 'QooApp is a professional platform specialising in Anime, Comics and Games (ACG) culture. We aim to unite ACG fans around the globe and help them as thoroughly as we can.'
                : 'QooApp 是專注二次元的專業平台，旨在聚集世界各地熱愛ACG的用戶，為他們創造有價值的服務和產品。從遊戲商店、新聞資訊、玩家社群，到線下聚會、漫畫閱讀、遊戲發行——QooApp不斷進化中，拓展突破次元的遊玩體驗。',
        image: siteIcon,
        link: `${newsUrl}${lang ? `/${lang}` : ''}`,
        language: lang === 'en' ? 'en' : 'zh',
        item: items,
    };
}
