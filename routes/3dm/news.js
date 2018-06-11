const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const type = ctx.params.type;
    const url = `http://www.3dmgame.com/games/${name}/${type}`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.dowlnewslist a');
    const items = [];

    for (let i = 0; i < list.length; i++) {
        let item = $(list[i]);
        const url = item.attr('href');

        let content = '';
        const urlBase = url.replace(/.html/, '');
        let total = 1;

        const value = await ctx.cache.get(url);
        if (value) {
            item = value;
        } else {
            // 抓取分页
            for (let j = 1; ; j++) {
                let response;

                const u = j === 1 ? url : urlBase + '_' + j + '.html';

                try {
                    response = await axios({
                        method: 'get',
                        url: u,
                        headers: {
                            'User-Agent': config.ua,
                        },
                    });
                } catch (e) {
                    break;
                }

                const page = cheerio.load(response.data, {
                    decodeEntities: false,
                });

                if (type === 'download') {
                    content = page('.jieshao').html();
                } else {
                    // 提取页数
                    if (j === 1) {
                        if (page('.pagelistbox').length === 0) {
                            total = 1;
                        } else {
                            total = parseInt(
                                page('.pagelistbox')
                                    .find('span')
                                    .html()
                                    .match(/共 (\S*) 页/)[1]
                            );
                        }
                    }

                    // 去除不需要的元素
                    page('.page_fenye').remove(); // 翻页
                    page('.con p')
                        .last()
                        .remove(); // 专题跳转
                    if (total > 1) {
                        page('.con p')
                            .last()
                            .remove(); // 快速翻页提示
                    }

                    content += page('.con div')
                        .next()
                        .html();
                }

                if (j >= total) {
                    break;
                }
            }

            item = {
                title: item.find('p').text(),
                description: content,
                pubDate: item.find('span').text(),
                link: url,
                guid: url,
            };

            ctx.cache.set(url, item, 24 * 60 * 60);
        }

        items.push(item);
    }

    ctx.state.data = {
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        description: $('.game-pc>p').text(),
        item: items,
    };
};
