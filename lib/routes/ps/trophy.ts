// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'get',
        url: `https://psnprofiles.com/${id}?order=last-trophy`,
    });

    const $ = load(response.data);
    const list = $('.zebra tr')
        .filter(function () {
            return $(this).find('.progress-bar span').text() !== '0%';
        })
        .map((i, e) => $(e).find('.title').attr('href'))
        .get()
        .slice(0, 3);

    const items = await Promise.all(
        list.map(async (item) => {
            const link = 'https://psnprofiles.com' + item + '?order=date&trophies=earned&lang=zh-cn';

            const response = await got({
                method: 'get',
                url: link,
            });

            const $ = load(response.data);

            const list = $('.zebra tr.completed');
            const items = list
                .map((i, item) => {
                    item = $(item);
                    const classMap = {
                        Platinum: '白金',
                        Gold: '金',
                        Silver: '银',
                        Bronze: '铜',
                    };
                    return {
                        title: item.find('.title').text() + ' - ' + $('.page h3').eq(0).text().trim().replace(' Trophies', ''),
                        description: `<img src="${item.find('.trophy source').attr('srcset').split(' ')[1]}"><br>${item
                            .find('.title')
                            .parent()
                            .contents()
                            .filter(function () {
                                return this.nodeType === 3;
                            })
                            .text()
                            .trim()}<br>等级：${classMap[item.find('td').eq(5).find('img').attr('title')]}<br>珍贵度：${item.find('.hover-show .typo-top').text()}`,
                        link: 'https://psnprofiles.com' + item.find('.title').attr('href'),
                        pubDate: new Date(
                            +new Date(
                                item
                                    .find('.typo-top-date nobr')
                                    .contents()
                                    .filter(function () {
                                        return this.nodeType === 3;
                                    })
                                    .text() +
                                    ' ' +
                                    item.find('.typo-bottom-date').text()
                            ) +
                                8 * 60 * 60 * 1000
                        ).toUTCString(),
                    };
                })
                .get();

            return items;
        })
    );
    let result = [];
    for (const item of items) {
        result = [...result, ...item];
    }
    result = result.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    ctx.set('data', {
        title: `${id} 的 PSN 奖杯`,
        link: `https://psnprofiles.com/${id}/log`,
        item: result,
    });
};
