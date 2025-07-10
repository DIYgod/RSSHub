const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://ksria.com/simpread/changelog.html';
    const response = await got.get(url);
    const data = response.data;
    const $ = cheerio.load(data);
    ctx.state.data = {
        title: 'SimpRead 更新日志',
        link: 'https://simpread.pro/changelog.html',
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
                if (version_type.includes('chrome')) {
                    version_type = 'Chrome';
                }
                if (version_type.includes('apple')) {
                    version_type = 'Safari';
                }
                if (version_type.includes('code')) {
                    version_type = 'UserScript';
                }
                if (version_type.includes('firefox')) {
                    version_type = 'Firefox';
                }

                // detail
                const text_color = {
                    important: '#9c27b0',
                    add: '#4caf50',
                    change: '#ffc107',
                    fix: '#f44336',
                    complete: '#03a9f4',
                };
                $(detail)
                    .find('li')
                    .map((index, item) => {
                        let span_class = $(item).find('span').attr('class');
                        const text = $(item).find('span').html();
                        $(item).find('span').remove();
                        if (span_class !== undefined) {
                            span_class = span_class.split(' ');
                            if (span_class[1] === 'empty') {
                                $(item).wrap('<ul></ul>');
                            } else {
                                $(item).prepend(`<b style='color:${text_color[span_class[1]]}'>${text}: </b>`);
                            }
                        }
                        return {};
                    });

                return {
                    description: $(detail).html(),
                    link: 'https://simpread.pro/changelog.html',
                    pubDate: `${year}-${month_day.replace('.', '-')} 00:00:00 GMT`,
                    title: `${version_type}${version}`,
                    author: 'SimpRead',
                };
            })
            .get(),
    };
};
