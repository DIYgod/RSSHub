const got = require('@/utils/got');
const cheerio = require('cheerio');

const get_url = (caty) => `https://${caty}.ithome.com/`;

const config = {
    it: {
        title: 'IT 资讯',
    },
    soft: {
        title: '软件之家',
    },
    win10: {
        title: 'win10 之家',
    },
    win11: {
        title: 'win11 之家',
    },
    iphone: {
        title: 'iphone 之家',
    },
    ipad: {
        title: 'ipad 之家',
    },
    android: {
        title: 'android 之家',
    },
    digi: {
        title: '数码之家',
    },
    next: {
        title: '智能时代',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/new-media.html#it-zhi-jia">https://docs.rsshub.app/new-media.html#it-zhi-jia</a>');
    }

    const current_url = get_url(ctx.params.caty);
    const response = await got({
        method: 'get',
        url: current_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('#list > div.fl > ul > li > div > h2 > a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);
                const post = content('#paragraph');
                post.find('img[data-original]').each((_, ele) => {
                    ele = $(ele);
                    ele.attr('src', ele.attr('data-original'));
                    ele.removeAttr('class');
                    ele.removeAttr('data-original');
                });
                item.description = post.html();
                item.pubDate = new Date(content('#pubtime_baidu').text() + ' GMT+8').toUTCString();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'IT 之家 - ' + cfg.title,
        link: current_url,
        image: 'https://img.ithome.com/m/images/logo.png',
        item: items,
    };
};
