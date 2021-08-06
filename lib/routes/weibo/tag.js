const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const tagId = ctx.params.tagId;
    const cookie = config.weibo.cookies;
    // 微博 cookie 无需和账号关联，任意账号登录成功均可使用 /weibo/tag 路由。
    const getTime = function (timestr) {
        const now = new Date();
        if (timestr.indexOf('今天') !== -1) {
            timestr = timestr.replace('今天', `${now.getMonth() + 1}月${now.getDate()}日`);
        }
        const ret = /(\d)月(\d)日\s+(\d+):(\d+)/.exec(timestr);
        now.setMonth(Number(ret[1]) - 1);
        now.setDate(Number(ret[2]));
        now.setHours(Number(ret[3]));
        now.setMinutes(Number(ret[4]));
        return now;
    };
    const response = await got({
        method: 'get',
        url: `https://weibo.com/a/hot/${encodeURIComponent(tagId)}.html`,
        headers: {
            Referer: `https://weibo.com/a/hot/${encodeURIComponent(tagId)}.html`,
            'MWeibo-Pwa': 1,
            'X-Requested-With': 'XMLHttpRequest',
            cookie: cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const paegTitle = $('title').text().replace('_微博', '');
    const columns = $('.UG_content_row');
    let list = {};
    for (let i = 0; i < columns.length; i++) {
        if ($(columns[i]).text().indexOf('精选内容') !== -1 || $(columns[i]).text().indexOf('全部微博') !== -1) {
            list = $(columns[i]).find('.UG_list_a,.UG_list_v2,.UG_list_b');
        }
    }
    ctx.state.data = {
        title: `${paegTitle}的微博新鲜事`,
        link: `http://s.weibo.com/weibo/${encodeURIComponent(tagId)}&b=1&nodup=1`,
        description: `${paegTitle}的微博新鲜事`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    const title = item.find('.list_title_s').text().replace(/#.+?#/g, '');
                    const images = item.find('img');
                    let image = '';
                    for (let i = 0; i < images.length; i++) {
                        const imgURL = images[i].attribs.src;
                        if (imgURL.indexOf('/expression/') === -1 && imgURL.indexOf('//tvax') === -1) {
                            image += `<img src="${imgURL}">`;
                        }
                    }
                    let link = item[0].attribs.href;
                    link = !link ? item.find('.list_des')[0].attribs.href : link;

                    return {
                        title: `${title.substr(0, 30)}`,
                        description: `${title}<br>${image}`,
                        link: link,
                        author: item.find('a > .subinfo')[0].firstChild.data,
                        pubDate: getTime($(item.find('.subinfo_box > .subinfo')).text()),
                    };
                })
                .get(),
    };
};
