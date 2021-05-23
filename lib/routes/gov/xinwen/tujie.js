const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    zlhd: {
        link: '/tujie/zlhd.htm',
        title: '总理活动图解',
    },
    mzyh: {
        link: '/manhua/mzyh.htm',
        title: '每周一画',
    },
    qtmh: {
        link: '/manhua/qita.htm',
        title: '其他漫画',
    },
    zhengce: {
        link: '/tujie/zhengce.htm',
        title: '图解政策',
    },
    qttj: {
        link: '/tujie/qita.htm',
        title: '其他图解',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#zhong-guo-zheng-fu-tu-jie">docs</a>');
    }

    const rootUrl = 'http://www.gov.cn/xinwen';
    const currentUrl = rootUrl + cfg.link;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.Video_pane div.tplgd')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a').eq(1);
            return {
                title: a.text(),
                link: `http://www.gov.cn${a.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('div.pages_content').html();
                    item.pubDate = new Date(content('div.pages-date').text().split('来源：')[0] + ' GMT+8').toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${cfg.title} - 中国政府网`,
        link: currentUrl,
        item: items,
    };
};
