// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { data } = await got('https://sec-in.com/api/v1/Common/getArticleList?tabs=newest');
    const items = data.result.data.map((item) => ({
        title: item.article_title,
        link: `https://sec-in.com/article/${item.id}`,
        description: item.summary,
        pubDate: parseDate(item.passed_time),
        author: item.member_info.nickname,
        category: item.article_tag,
    }));
    ctx.set('data', {
        title: 'SecIN信息安全技术社区',
        link: 'https://sec-in.com/',
        item: items,
    });
};
