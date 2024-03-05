// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const link = `https://www.nowcoder.com/recommand/activity?token=&type=3&_=${Date.now()}`;
    const responseBody = (await got.get(link)).data;
    if (responseBody.code !== 0) {
        throw new Error(`接口错误，错误代码:${responseBody.code},错误原因:${responseBody.msg}`);
    }
    const data = responseBody.data.activitys;
    ctx.set('data', {
        title: '牛客网-推荐',
        link: 'https://www.nowcoder.com/recommend',
        description: '牛客网-推荐',
        item: data.map((item) => ({
            title: item.name,
            description: `<img src="${item.img}">`,
            link: `https://www.nowcoder.com${item.url}`,
        })),
    });
};
