import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';

export const route: Route = {
    path: '/questions/:id',
    categories: ['programming'],
    example: '/lanqiao/questions/2',
    parameters: { id: 'topic_id 主题 `id` 可在社区板块 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lanqiao.cn/questions/', 'lanqiao.cn/questions/topics/:id'],
        },
    ],
    name: '技术社区',
    maintainers: ['huhuhang'],
    handler,
    url: 'lanqiao.cn/questions/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://www.lanqiao.cn/api/v2/questions/?sort=created_time&topic_id=${id}`,
        headers: {
            Referer: `https://www.lanqiao.cn/questions/topic_id=${id}`,
        },
    });

    const data = response.data.results; // response.data 为 HTTP GET 请求返回的数据对象
    const topic_name = data[0].topic.name; // 获取话题名称
    function filterToped(arr) {
        // 过滤置顶的帖子
        return arr.is_toped === false;
    }
    // 将 markdown 转换为 HTML
    const md = new MarkdownIt();
    const items = await Promise.all(
        data
            .filter((element) => filterToped(element))
            .map((item) =>
                cache.tryGet(`https://www.lanqiao.cn/api/v2/questions/${item.id}/`, async () => {
                    const questionResponse = await got({
                        method: 'get',
                        url: `https://www.lanqiao.cn/api/v2/questions/${item.id}/`,
                    });
                    const question = questionResponse.data;

                    item.title = question.title;
                    item.description = md.render(question.content);
                    item.author = question.author.name;
                    item.pubDate = parseDate(question.created_at);
                    item.link = `https://www.lanqiao.cn/questions/${question.id}/`;
                    return item;
                })
            )
    );
    return {
        // 源标题
        title: `蓝桥云课技术社区【${topic_name}】`,
        // 源链接
        link: `https://www.lanqiao.cn/questions/topics/${id}/`,
        // 源说明
        description: `蓝桥云课技术社区【${topic_name}】`,
        // 遍历此前获取的数据
        item: items,
    };
}
