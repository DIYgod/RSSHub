import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['popular'],
    view: ViewType.Notifications,
    example: '/easynomad',
    radar: [
        {
            source: ['easynomad.cn'],
        },
    ],
    name: '轻松游牧-远程工作聚集地',
    maintainers: ['oldj'],
    handler,

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler() {
    const host = `https://easynomad.cn`;
    const url = 'https://easynomad.cn/api/posts/list?limit=80&page=1&jobCategory=&contractType=';
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data.data;

    const items = data.map((item) => ({
        title: item.jobTitle,
        description: item.descContent ? md.render(item.descContent) : 'No description',
        pubDate: parseDate(item.jobPublishTime),
        link: item.url,
    }));

    return {
        title: `轻松游牧-远程工作聚合列表`,
        description: `支持国内远程的招聘列表，远程全职，远程兼职`,
        link: host,
        item: items,
    };
}
