// @ts-nocheck
// 导入所需模组
import got from '@/utils/got'; // 自订的 got
// import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    // 在此处编写您的逻辑
    const field = ctx.req.param('field');

    // 发送 HTTP GET 请求到 API 并解构返回的数据对象
    const {
        result: {
            hits: { hit: data },
        },
    } = await got({
        method: 'get',
        url: 'https://dblp.org/search/publ/api',
        searchParams: {
            q: field,
            format: 'json',
            h: 10,
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
    }).json();

    // console.log(data);

    // 从 API 响应中提取相关数据
    const list = data.map((item) => {
        const { info } = item;
        // console.log(info);
        const {
            authors: { author },
            title,
            venue,
            year,
            type,
            doi,
            ee,
        } = info;

        const authorName = Array.isArray(author) ? author[0].text : author.text;

        return {
            title,
            link: ee,
            author: `${authorName} et al.`,
            doi,
            description: `Year: ${year ?? 'unknown'}, Venue: ${venue}, Type: ${type}, Doi: ${doi}`,
        };
    });

    ctx.set('data', {
        // 在此处输出您的 RSS
        // 源标题
        title: `【dblp】${field}`,
        // 源链接
        link: `https://dblp.org/search?q=${field}`,
        // 源描述
        description: `DBLP ${field} RSS`,
        // 处理后的数据，即文章列表
        item: list,
    });
};
