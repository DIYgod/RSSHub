import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const titles = {
    recommend: '精选',
    books: '观书堂',
    courses: '在线课',
    huodongs: '观学院',
};

export const route: Route = {
    path: '/member/:category?',
    categories: ['new-media'],
    example: '/guancha/member/recommend',
    parameters: { category: '分类，见下表' },
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
            source: ['guancha.cn/'],
            target: '/:category?',
        },
    ],
    name: '观学院',
    maintainers: ['nczitzk'],
    handler,
    url: 'guancha.cn/',
    description: `| 精选      | 观书堂 | 在线课  | 观学院   |
  | --------- | ------ | ------- | -------- |
  | recommend | books  | courses | huodongs |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'recommend';

    const rootUrl = 'https://member.guancha.cn';
    const apiUrl = `${rootUrl}/zaixianke/home`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items;

    switch (category) {
        case 'books':
            items = response.data.data.books.map((item) => ({
                title: item.title,
                link: `${rootUrl}/guanshutang/summary.html?id=${item.id}&page=0`,
                description: `<img src="${item.cover}"><p>[${item.audio_time}] ${item.desc_short}</p>`,
                pubDate: new Date(Number.parseInt(item.cover.split('/').pop().slice(0, 10)) * 1000).toUTCString(),
            }));
            break;

        case 'courses':
            items = response.data.data.courses.data.map((item) => {
                let description = '',
                    pubDate = new Date(0);

                for (const i of item.items) {
                    const newPubDate = new Date(i.publish_time);
                    pubDate = pubDate > newPubDate ? pubDate : newPubDate;
                    description += `<a href="${rootUrl}/zaixianke/content.html?id=${i.id}">${i.title}</a><br>`;
                }

                return {
                    title: item.name,
                    link: `${rootUrl}/zaixianke/summary.html?id=${item.id}`,
                    author: item.author_name,
                    description: `<img src="${item.cover}"><p>${item.desc_short}</p><br>${description}`,
                    pubDate: pubDate.toUTCString(),
                };
            });
            break;

        default:
            items = response.data.data[category].map((item) => {
                let timeArray = item.media_time && item.media_time.trim().split(/\D+/, 3);
                timeArray = timeArray && timeArray.filter((item) => item !== '');
                let itunes_duration;
                if (timeArray) {
                    itunes_duration = 0;
                    itunes_duration += timeArray.length >= 1 ? Number.parseInt(timeArray.slice(-1)) : 0;
                    itunes_duration += timeArray.length >= 2 ? Number.parseInt(timeArray.slice(-2)) * 60 : 0;
                    itunes_duration += timeArray.length >= 3 ? Number.parseInt(timeArray.slice(-3)) * 60 * 60 : 0;
                }
                return {
                    title: item.title,
                    link: item.jump_url,
                    author: item.author_name,
                    description: `<img src="${item.big_pic}"><p>${item.summary}</p>`,
                    enclosure_url: item.media_url,
                    enclosure_length: item.media_size,
                    itunes_duration,
                    enclosure_type: 'audio/mpeg',
                    pubDate: isNaN(+item.created_at) ? timezone(parseDate(item.created_at), +8) : parseDate(item.created_at * 1000),
                };
            });
    }

    return {
        title: `观学院 - ${titles[category]}`,
        link: `${rootUrl}/index.html`,
        item: items,
    };
}
