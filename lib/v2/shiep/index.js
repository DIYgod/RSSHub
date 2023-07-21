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
    const link = type === 'career' ? `${host}/news/index/tag/${id}` : `${host}/${id}/list.htm`;

    const response = await got(link);
    const $ = cheerio.load(response.data);

    const listSelector = config[type].listSelector || '.list_item';
    const pubDateSelector = config[type].pubDateSelector || 'span[class="Article_PublishDate"]';
    const descriptionSelector = config[type].descriptionSelector || '.wp_articlecontent';

    const items = $(listSelector)
        .toArray()
        .filter((item) => {
            const date = dayjs($(item).find(pubDateSelector).text().trim());
            return date.isValid();
        })
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title') || item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: parseDate(item.find(pubDateSelector).text().trim(), 'YYYY-MM-DD'),
            };
        });

    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    if ($(descriptionSelector).length > 0) {
                        item.description = art(path.resolve(__dirname, 'templates/description.art'), {
                            description: $(descriptionSelector).html(),
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
        link,
        description: '上海电力大学-' + config[type].title,
        item: items,
    };
};
