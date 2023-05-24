const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://graduate.pumc.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');
    const pageUrl = `${host}/zsw/${type}.htm`;
    const response = await got(pageUrl, { https: { rejectUnauthorized: false } });
    const $ = cheerio.load(response.data);
    const typeName = $('.nav-b a').last().text() || '研究生招生网';

    const firstPostDom = $('.list-clear .list-sm-tt a');
    const firstPostHtml = `
        <li>    
            <div class="list-news-tt txt-elise"><a href="${firstPostDom.attr('href')}" >${firstPostDom.attr('title') || firstPostDom.text()}</a></div>
        </li>`;
    const firstPost = $(firstPostHtml);
    const $list = $('.list-news li ');
    const list = Array.from($list);
    list.unshift(firstPost);
    const items = await Promise.all(
        list.map((item) => {
            item = $(item);
            const aTag = item.find('.list-news-tt a');
            const itemTitle = aTag.attr('title') || aTag.text();
            const itemPath = aTag.attr('href');
            let itemUrl = '';
            if (itemPath.startsWith('http')) {
                itemUrl = itemPath;
            } else {
                itemUrl = new URL(itemPath, pageUrl).href;
            }
            return ctx.cache.tryGet(itemUrl, async () => {
                let description = itemTitle;
                let itemDate = null;
                try {
                    const result = await got(itemUrl, { https: { rejectUnauthorized: false } });
                    const $ = cheerio.load(result.data);
                    if ($('.article-sm')) {
                        itemDate = $('.article-sm').find('span').first().text().slice(3, 14);
                    }
                    if ($('#vsb_content .v_news_content').length > 0) {
                        description = $('#vsb_content .v_news_content').html().trim();
                    }
                } catch (e) {
                    description = itemTitle;
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: `北京协和医学院研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `北京协和医学院研究生招生网 - ${typeName}`,
        item: items,
    };
};
