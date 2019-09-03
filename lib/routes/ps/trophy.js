const got = require('@/utils/got');
const logger = require('@/utils/logger');
const wait = require('@/utils/wait');
const cheerio = require('cheerio');
const toughCookie = require('tough-cookie');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    // get cookies and token
    const cookieJar = new toughCookie.CookieJar();
    const tokenResponse = await got({
        method: 'get',
        url: 'https://psnprofiles.com/',
        cookieJar: cookieJar,
    });
    const token = cheerio
        .load(tokenResponse.data)('meta[name="csrf-token"]')
        .attr('content');

    // update profile
    const updateResponse = await got({
        method: 'post',
        url: 'https://psnprofiles.com/xhr/update',
        headers: {
            Referer: `https://psnprofiles.com/`,
            'x-csrf-token': token,
            'x-requested-with': 'XMLHttpRequest',
        },
        form: true,
        data: {
            psnId: id,
            'g-recaptcha-response': '',
        },
        cookieJar: cookieJar,
    });
    if (updateResponse.data.match('In Queue')) {
        for (let i = 0; i < 10; i++) {
            // eslint-disable-next-line no-await-in-loop
            const checkResponse = await got({
                method: 'get',
                url: `https://psnprofiles.com/xhr/update/status?user=${id}`,
                headers: {
                    Referer: `https://psnprofiles.com/`,
                },
            });
            if (checkResponse.data.status.match('updated')) {
                logger.info(`${id}'s PSN profile has been updated`);
                break;
            }
            // eslint-disable-next-line no-await-in-loop
            await wait(200);
        }
    }

    const response = await got({
        method: 'get',
        url: `https://psnprofiles.com/${id}?order=last-trophy`,
    });

    const $ = cheerio.load(response.data);
    const list = $('.zebra tr')
        .filter(function() {
            return (
                $(this)
                    .find('.progress-bar span')
                    .text() !== '0%'
            );
        })
        .map((i, e) =>
            $(e)
                .find('.title')
                .attr('href')
        )
        .get()
        .slice(0, 3);

    const items = await Promise.all(
        list.map(async (item) => {
            const link = 'https://psnprofiles.com' + item + '?order=date&trophies=earned&lang=zh-cn';

            const response = await got({
                method: 'get',
                url: link,
            });

            const $ = cheerio.load(response.data);

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
                        title:
                            item.find('.title').text() +
                            ' - ' +
                            $('.page h3')
                                .eq(0)
                                .text()
                                .trim(),
                        description: `<img src="${
                            item
                                .find('.trophy source')
                                .attr('srcset')
                                .split(' ')[1]
                        }"><br>${item
                            .find('.title')
                            .parent()
                            .contents()
                            .filter(function() {
                                return this.nodeType === 3;
                            })
                            .text()
                            .trim()}<br>等级：${
                            classMap[
                                item
                                    .find('td')
                                    .eq(5)
                                    .find('img')
                                    .attr('title')
                            ]
                        }<br>珍贵度：${item.find('.hover-show .typo-top').text()}`,
                        link: 'https://psnprofiles.com' + item.find('.title').attr('href'),
                        pubDate: new Date(
                            +new Date(
                                item
                                    .find('.typo-top-date nobr')
                                    .contents()
                                    .filter(function() {
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

            return Promise.resolve(items);
        })
    );
    let result = [];
    items.forEach((item) => {
        result = result.concat(item);
    });

    ctx.state.data = {
        title: `${id} 的 PSN 奖杯`,
        link: `https://psnprofiles.com/${id}/log`,
        item: result,
    };
};
