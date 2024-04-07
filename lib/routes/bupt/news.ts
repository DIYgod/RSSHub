import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/bupt/news',
    parameters: {},
    features: {
        requireConfig: [
            {
                name: 'BUPT_WX_COOKIE',
                description: '北京邮电大学企业微信 -> 校内新闻 -> cookie',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['my.bupt.edu.cn/list.jsp'],
        },
    ],
    name: '北京邮电大学校内新闻',
    maintainers: ['YouXam'],
    handler: async () => {
        if (!config.bupt.wx_cookie) {
            throw new ConfigNotFoundError('Missing BUPT_WX_COOKIE');
        }
        const data = await ofetch('https://wx.bupt.edu.cn/portal-article-page/article-list/news?limit=10&offset=0', {
            headers: {
                cookie: config.bupt.wx_cookie,
                accept: 'application/json',
            },
        });

        const items = data.map((item) => ({
            title: item.title,
            link: 'https://wx.bupt.edu.cn/portal-article-page/article/news/' + item.id,
            description: item.content,
            pubDate: timezone(parseDate(item.createtime, 'YYYY/MM/DD HH:mm:ss'), +8),
            author: item.author,
        }));
        const image_url = 'https://www.bupt.edu.cn/__local/1/F4/62/05815E603799A29D53DDB1E0FAF_557A7220_102AD.png';
        return {
            title: '北京邮电大学校内新闻',
            link: 'https://www.bupt.edu.cn/',
            item: items,
            image: image_url,
            icon: image_url,
            logo: image_url,
        };
    },
    url: 'my.bupt.edu.cn/',
};
