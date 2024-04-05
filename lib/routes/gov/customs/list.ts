import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { host, puppeteerGet } from './utils';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/customs/list/:gchannel?',
    categories: ['government'],
    example: '/gov/customs/list/paimai',
    parameters: { gchannel: '支持 `paimai` 及 `fagui` 2个频道，默认为 `paimai`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.customs.gov.cn/'],
            target: '/customs/list',
        },
    ],
    name: '拍卖信息 / 海关法规',
    maintainers: ['Jeason0228', 'TonyRL', 'he1q'],
    handler,
    url: 'www.customs.gov.cn/',
    description: `:::warning
  由于区域限制，建议在国内 IP 的机器上自建
  :::`,
};

async function handler(ctx) {
    const { gchannel = 'paimai' } = ctx.req.param();
    let channelName = '';
    let link = '';

    switch (gchannel) {
        case 'paimai':
            channelName = '拍卖信息';
            link = `${host}/customs/302249/zfxxgk/2799825/2799883/index.html`;
            break;
        case 'fagui':
            channelName = '海关法规';
            link = `${host}/customs/302249/302266/index.html`;
            break;
        default:
            channelName = '拍卖信息';
            link = `${host}/customs/302249/zfxxgk/2799825/2799883/index.html`;
            break;
    }

    const browser = await puppeteer({ stealth: true });

    const list = await cache.tryGet(
        link,
        async () => {
            const response = await puppeteerGet(link, browser);
            const $ = load(response);
            const list = $('[class^="conList_ul"] li')
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        link: new URL(item.find('a').attr('href'), host).href,
                        date: parseDate(item.find('span').text()),
                    };
                });
            return list;
        },
        config.cache.routeExpire,
        false
    );

    const out = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await puppeteerGet(info.link, browser);
                const $ = load(response);
                let date;

                $('.easysite-news-operation').remove();
                if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test($('.easysite-news-describe').text())) {
                    date = timezone(parseDate($('.easysite-news-describe').text(), 'YYYY-MM-DD HH:mm'), 8);
                }
                const description = $('.easysite-news-peruse').html();

                return {
                    title: info.title,
                    link: info.link,
                    description,
                    pubDate: date || info.date,
                };
            })
        )
    );

    browser.close();

    return {
        title: `中国海关-${channelName}`,
        link,
        item: out,
    };
}
