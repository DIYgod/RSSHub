const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const { config } = require('./config');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    if (!Object.keys(config).includes(type)) {
        throw Error('Invalid type');
    }

    const host = `https://${type}.shiep.edu.cn`;
    const id = ctx.params.id || config[type].id;
    const pubDateClass = type === 'dxxy' ? 'div[class="article-publishdate"]' : 'span[class="Article_PublishDate"]'; // 适配电子与信息工程学院网站改版

    const response = await got(`${host}/${id}/list.htm`);

    const $ = cheerio.load(response.data);

    const items = $('.list_item')
        .toArray()
        .filter((item) => {
            const date = dayjs($(item).find(pubDateClass).text().trim());
            return date.isValid();
        })
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title') || item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: parseDate(item.find(pubDateClass).text().trim(), 'YYYY-MM-DD'),
            };
        });

    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    if ($('.wp_articlecontent').length > 0) {
                        item.description = art(path.resolve(__dirname, 'templates/description.art'), {
                            description: $('.wp_articlecontent').html(),
                        });
                    } else {
                        item.description = '请进行统一身份认证后查看内容';
                    }
                } catch (e) {
                    item.description = '请在校内或通过校园VPN查看内容';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '上海电力大学-' + config[type].title,
        link: `${host}/${id}/list.htm`,
        description: '上海电力大学-' + config[type].title,
        item: items,
    };
};
