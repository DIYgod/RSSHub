import { Route } from '@/types';
import got from '@/utils/got';
import { processImage } from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hotlist',
    categories: ['social-media'],
    example: '/zhihu/hotlist',
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
            source: ['www.zhihu.com/hot'],
        },
    ],
    name: '知乎热榜',
    maintainers: ['DIYgod'],
    handler,
    url: 'www.zhihu.com/hot',
};

async function handler() {
    const {
        data: { data },
    } = await got({
        method: 'get',
        url: 'https://www.zhihu.com/api/v3/explore/guest/feeds?limit=40',
    });

    return {
        title: '知乎热榜',
        link: 'https://www.zhihu.com/billboard',
        description: '知乎热榜',
        item: data.map((item) => {
            switch (item.target.type) {
                case 'answer':
                    return {
                        title: item.target.question.title,
                        description: `${item.target.author.name}的回答<br/><br/>${processImage(item.target.content)}`,
                        author: item.target.author.name,
                        pubDate: parseDate(item.target.updated_time * 1000),
                        guid: item.target.id.toString(),
                        link: `https://www.zhihu.com/question/${item.target.question.id}/answer/${item.target.id}`,
                    };
                case 'article':
                    return {
                        title: item.target.title,
                        description: `${item.target.author.name}的文章<br/><br/>${processImage(item.target.content)}`,
                        author: item.target.author.name,
                        pubDate: parseDate(item.updated * 1000),
                        guid: item.target.id.toString(),
                        link: `https://zhuanlan.zhihu.com/p/${item.target.id}`,
                    };
                default:
                    return {
                        title: '未知类型',
                        description: '请点击链接提交issue',
                        guid: item.target.type,
                        link: 'https://github.com/DIYgod/RSSHub/issues',
                    };
            }
        }),
    };
}
