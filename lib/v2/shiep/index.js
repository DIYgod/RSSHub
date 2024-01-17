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
        throw new Error(`Invalid type: ${type}`);
    }

    const { listSelector = '.list_item', pubDateSelector = '.Article_PublishDate', descriptionSelector = '.wp_articlecontent', title } = config[type];

    if (!title) {
        throw new Error(`Invalid type: ${type}`);
    }

    const host = `https://${type}.shiep.edu.cn`;
    const id = ctx.params.id || config[type].id;
    const link = type === 'career' ? `${host}/news/index/tag/${id}` : `${host}/${id}/list.htm`;

    const response = await got(link);
    const $ = cheerio.load(response.data);

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            item = $(item);
            const pubDateText = item.find(pubDateSelector).text().trim();
            const match = pubDateText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
            return {
                title: item.find('a').attr('title') || item.find('h3').text() || item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: match ? parseDate(match[0], 'YYYY-MM-DD') : null,
            };
        })
        .filter((item) => {
            const date = dayjs(item.pubDate);
            return date.isValid();
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    item.description =
                        $(descriptionSelector).length > 0
                            ? art(path.resolve(__dirname, 'templates/description.art'), {
                                  description: $(descriptionSelector).html(),
                              })
                            : '请进行统一身份认证后查看内容';
                } catch {
                    item.description = '请在校内或通过校园VPN查看内容';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `上海电力大学-${title}`,
        link,
        item: items,
    };
};
