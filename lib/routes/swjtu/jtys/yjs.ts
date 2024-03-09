import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://ctt.swjtu.edu.cn';
const url_addr = `${rootURL}/yethan/WebIndexAction?setAction=newsList&bigTypeId=0E4BF4D36E232918`;

const getItem = (item, cache) => {
    const news_info = item.find('div[class="news-title newsInfo"]');
    const news_month = item.find('.month').text();
    const news_day = item.find('.day').text();

    const info_id = news_info.attr('newsid');
    const info_title = news_info.text();
    const link = `${rootURL}/yethan/WebIndexAction?setAction=newsInfo&newsId=${info_id}`;
    return cache.tryGet(link, async () => {
        const resp = await got({
            method: 'get',
            url: link,
        });
        const $$ = load(resp.data);
        const info_text = $$('.news-left').html();

        return {
            title: info_title,
            pubDate: parseDate(`${news_month}.${news_day}`),
            link,
            description: info_text,
        };
    });
};

export const route: Route = {
    path: '/jtys/yjs',
    categories: ['university'],
    example: '/swjtu/jtys/yjs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '交通运输与物流学院',
    maintainers: ['qizidog'],
    handler,
    description: `#### 研究生通知 {#xi-nan-jiao-tong-da-xue-jiao-tong-yun-shu-yu-wu-liu-xue-yuan-yan-jiu-sheng-tong-zhi}`,
};

async function handler() {
    const resp = await got({
        method: 'get',
        url: url_addr,
    });

    const $ = load(resp.data);
    const list = $("[class='news-list flex']");

    const items = await Promise.all(
        list.toArray().map((i) => {
            const item = $(i);
            return getItem(item, cache);
        })
    );

    return {
        title: '西南交大交运学院-研究生通知',
        link: url_addr,
        item: items,
        allowEmpty: true,
    };
}
