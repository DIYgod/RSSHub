import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const rootUrl = 'http://job.hrbeu.edu.cn';

export const route: Route = {
    path: '/job/calendar',
    categories: ['forecast'],
    example: '/hrbeu/job/calendar',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['job.hrbeu.edu.cn/*'],
    },
    name: '就业服务平台',
    maintainers: ['Derekmini'],
    handler,
};

async function handler() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let strmMonth;
    month < 10 ? (strmMonth = '0' + month) : (strmMonth = month);
    const day = date.getDate();

    const response = await got('http://job.hrbeu.edu.cn/HrbeuJY/Web/Employ/QueryCalendar', {
        searchParams: {
            yearMonth: year + '-' + strmMonth,
        },
    }).json();

    let link = '';
    for (let i = 0, l = response.length; i < l; i++) {
        // if (response[i].day === Number('10')) {
        if (response[i].day === Number(day)) {
            link = response[i].Items[0].link;
        }
    }

    const todayResponse = await got(`${rootUrl}${link}`);

    const $ = load(todayResponse.data);

    const list = $('li.clearfix')
        .map((_, item) => ({
            title: $(item).find('span.news_tit.news_tit_s').find('a').attr('title'),
            description: '点击标题，登录查看招聘详情',
            link: $(item).find('span.news_tit.news_tit_s').find('a').attr('href'),
        }))
        .get();

    return {
        title: '今日招聘会',
        link: 'http://job.hrbeu.edu.cn/HrbeuJY/web',
        item: list,
        allowEmpty: true,
    };
}
