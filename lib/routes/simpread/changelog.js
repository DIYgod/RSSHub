const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://simpread.pro/changelog.html';
    const response = await got.get(url);
    const data = response.data;
    const $ = cheerio.load(data);
    ctx.state.data = {
        title: 'SimpRead 更新日志',
        link: url,
        description: $('body > div.container.changelog > div.desc').html(),
        item: $('.version')
            .map((index, item) => {
                const year = $(item).find('.year').html();
                const month_day = $(item).find('.day').html();
                let version = '';
                let detail = '';
                // 版本名称处理
                version = $(item).find('.num > a').clone().children().remove().end().text();
                // detail处理
                detail = $(item).find('.details');
                if (version === '') {
                    version = $(item).find('.num').clone().children().remove().end().text();
                }
                let version_type = $(item).find('.num > a > i').attr('class');
                // 部分结构不一致处理
                if (version_type === undefined) {
                    version_type = $(item).find('.num > i').attr('class');
                }
                if (version_type.indexOf('chrome') !== -1) {
                    version_type = 'Chrome';
                }
                if (version_type.indexOf('apple') !== -1) {
                    version_type = 'Safari';
                }
                if (version_type.indexOf('code') !== -1) {
                    version_type = 'UserScript';
                }
                if (version_type.indexOf('firefox') !== -1) {
                    version_type = 'Firefox';
                }

                $(detail)
                    .find('li')
                    .map((index, item) => {
                        const level = $(item).find('span').attr('class');
                        if (level !== undefined) {
                            if (level.indexOf('empty') !== -1) {
                                $(item).wrap('<ul></ul>');
                            } else {
                                $(item).find('span').append('<br/>');
                            }
                        }
                        return {};
                    });

                return {
                    description: $(detail).html(),
                    link: url,
                    pubDate: `${year}-${month_day.replace('.', '-')} 00:00:00 GMT`,
                    title: `${version_type}${version}`,
                    author: 'SimpRead',
                };
            })
            .get(),
    };
};
