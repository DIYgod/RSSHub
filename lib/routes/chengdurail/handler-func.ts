import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export async function handler(ctx) {
    const { category = 'all' } = ctx.req.param();
    const MAIN_RULES = {
        news: [21, 23, 103],
        notice: [9, 26, 101],
        all: [9, 21, 23, 26, 101, 103],
        notification: [9],
        party: [21],
        talent: [24],
        job: [26],
        calender: [101],
        campus: [103],
    };
    const LIST_API = 'https://edua.chengdurail.com:60001/api/collegeIntroduce/commonIntroduceList';
    const DETAIL_API = 'https://edua.chengdurail.com:60001/api/indexShow/indexShowDetail';
    const defaultHeaders = {
        accept: 'application/json',
        Origin: 'https://edua.chengdurail.com',
    };
    const articalsInfoRaw = await Promise.all(
        MAIN_RULES[category].flatMap(async (typeNum: number) => {
            const data = await ofetch(LIST_API, {
                method: 'POST',
                body: {
                    pageNum: 1,
                    pageSize: 10,
                    type: typeNum,
                },
                headers: defaultHeaders,
            });
            return data.data.list;
        })
    );
    const articalsInfo = articalsInfoRaw.flat();
    const items = await Promise.all(
        articalsInfo.map((item) =>
            cache.tryGet(`cdirt:${item.id}`, async () => {
                const details = await ofetch(DETAIL_API, {
                    method: 'POST',
                    body: {
                        titleId: item.id,
                    },
                    headers: defaultHeaders,
                });
                return {
                    title: details.data.title,
                    link: `https://edua.chengdurail.com/static/html/newsDetail.html?type=1&id=${item.id}`,
                    description: details.data.content,
                    pubDate: parseDate(details.data.publishDate),
                    author: details.data.author,
                };
            })
        )
    );
    return {
        title: '成都轨道交通职业学院 - 新闻与通知',
        link: 'https://edua.chengdurail.com',
        image: 'https://edua.chengdurail.com:60001/apiImg/cdgdjtxy//imageXy/news664418e0e5740cca20684c1f.png',
        item: items,
    };
}
