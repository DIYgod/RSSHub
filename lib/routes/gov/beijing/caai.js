const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'http://www.caai.cn';

const config = {

    // 关于CAAI
    40: { title: '条例与法规' },
    41: { title: '主要领导' },
    43: { title: '分支机构' },
    90: { title: '学会党建' },
    77: { title: '文档下载' },

    // 学会动态
    46: { title: '学会新闻' },
    47: { title: '通知公告' },
    49: { title: '活动预告' },
    71: { title: '对外合作' },
    63: { title: '培训动态' },

    // 党建强会
    79: { title: '党建强会' },
    115: { title: '党史学习' },

    // 奖励与推荐
    65: { title: '吴文俊奖' },
    86: { title: '青托计划' },
    67: { title: '院士推荐' },
    91: { title: '成果鉴定' },

    // CAAI资源
    52: { title: '学会期刊' },
    53: { title: '学科皮书系列' },
    54: { title: '年鉴及发展报告' },

    // 会员专区
    69: { title: '学会会员' },
    135: { title: '高级会员' },
    83: { title: '会员荣誉' },
    74: { title: '单位会员' },
};

module.exports = async (ctx) => {
    const caty = ctx.params.caty;
    const cfg = config[caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#zhong-guo-ren-gong-zhi-neng-xue-hui">docs</a>');
    }

    const current_url = url.resolve(root_url, `/index.php?s=/home/article/index/id/${caty}.html`);
    const response = await got({
        method: 'get',
        url: current_url,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.article-list li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('h3 a[href]');
            const h4 = item.find('h4');
            const href = a.attr('href');
            return {
                title: a.text(),
                link: url.resolve(current_url, href),
                pubDate: h4.text(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    let description = '';
                    try {
                        const res = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(res.data);
                        description = content('div.articleContent').html();
                    } catch (error) {
                        description = '页面找不到';
                    }
                    item.description = description;
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '中国人工智能学会 - ' + cfg.title,
        link: root_url,
        item: items,
    };
};
