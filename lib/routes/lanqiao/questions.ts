// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const MarkdownIt = require('markdown-it');

export default async (ctx) => {
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
    ctx.set('data', {
        // 源标题
        title: `蓝桥云课技术社区【${topic_name}】`,
        // 源链接
        link: `https://www.lanqiao.cn/questions/topics/${id}/`,
        // 源说明
        description: `蓝桥云课技术社区【${topic_name}】`,
        // 遍历此前获取的数据
        item: items,
    });
};
