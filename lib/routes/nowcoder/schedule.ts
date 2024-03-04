// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const propertyId = ctx.req.param('propertyId') ?? 0;
    const typeId = ctx.req.param('typeId') ?? 0;

    const link = `https://www.nowcoder.com/school/schedule/data?token=&query=&typeId=${typeId}&propertyId=${propertyId}&onlyFollow=false&_=${Date.now()}`;
    const responseBody = (await got(link)).data;
    if (responseBody.code !== 0) {
        throw new Error(`接口错误，错误代码:${responseBody.code},错误原因:${responseBody.msg}`);
    }
    const data = responseBody.data.companyList;

    ctx.set('data', {
        title: '名企校招日程',
        link: 'https://www.nowcoder.com/school/schedule',
        description: '名企校招日程',
        item: data.map((item) => {
            let desc = `<tr><td><img src="${item.logo}" referrerpolicy="no-referrer""></td></tr>`;
            for (const each of item.schedules) {
                desc += `<tr><td>${each.content}</td><td>${each.time}</td></tr>`;
            }
            return {
                title: item.name,
                description: `<table>${desc}</table>`,
                pubDate: parseDate(item.createTime),
                link: `https://www.nowcoder.com/school/schedule/${item.id}`,
            };
        }),
    });
};
