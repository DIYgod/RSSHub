import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const url = 'https://immi.homeaffairs.gov.au/_layouts/15/api/Data.aspx/GetNews';

const reqBodyByYear = (year) => ({
    siteUrl: 'https://www.homeaffairs.gov.au',
    webUrl: '/News-subsite',
    filter: {
        Categories: [],
        PageNumber: 1,
        RowLimit: 20,
        ShowCurrentSiteOnly: false,
        CurrentSite: 'Immi',
        Year: year + '',
    },
});

const getItemUrl = (id) => `https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=${id}`;

export const route: Route = {
    path: '/immiau/news',
    categories: ['government'],
    example: '/gov/immiau/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Immigration and Citizenship - News',
    maintainers: ['liu233w'],
    handler,
};

async function handler() {
    const { data: res } = await got({
        method: 'post',
        url,
        json: reqBodyByYear(new Date().getFullYear()),
    });

    const list = res.d.data.map((item) => ({
        title: item.Title,
        author: item.Source,
        category: item.Category,
        description: item.Content,
        pubDate: parseDate(item.Date),
        link: getItemUrl(item.Id),
    }));

    return {
        title: 'News - Immigration and Citizenship',
        link: 'https://immi.homeaffairs.gov.au/news-media/archive',
        description: 'Australia Government, Department of Home Affairs',
        item: list,
    };
}
