// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { type = 'all' } = ctx.req.param();
    const baseUrl = 'https://www.hpoi.net';
    const reqUrl = `${baseUrl}/user/home/ajax`;
    const response = await got.post(reqUrl, {
        form: {
            page: 1,
            type: 'info',
            catType: type,
        },
    });
    const $ = load(response.data);

    const items = $('.home-info')
        .map((_, ele) => {
            const $item = load(ele);
            const leftNode = $item('.overlay-container');
            const relativeLink = leftNode.find('a').first().attr('href');
            const typeName = leftNode.find('.type-name').first().text();
            const imgUrl = leftNode.find('img').first().attr('src');
            const rightNode = $item('.home-info-content');
            const infoType = rightNode.find('.user-name').contents()[0].data;
            const infoTitle = rightNode.find('.user-content').text();
            const infoTime = rightNode.find('.type-time').text();
            return {
                title: infoTitle,
                pubDate: parseRelativeDate(infoTime),
                link: `${baseUrl}/${relativeLink}`,
                category: infoType,
                description: [`类型:${typeName}`, infoTitle, `更新内容: ${infoType}`, `<img src="${imgUrl}"/>`].join('<br/>'),
            };
        })
        .get();

    const typeToLabel = {
        all: '全部',
        hobby: '手办',
        model: '模型',
    };
    const title = `手办维基 - 情报 - ${typeToLabel[type]}`;
    ctx.set('data', {
        title,
        link: `${baseUrl}/user/home?type=info&catType=${type}`,
        description: title,
        item: items,
    });
};
