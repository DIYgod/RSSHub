const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const root_url = 'http://www.hbsia.org/';

const config = {
    zxzx: { title: '最新资讯' },
    hdtz: { title: '活动通知' },
    hdbd: { title: '活动报道' },
    gsgg: { title: '公示公告' },

    xyjj: { title: '行业聚焦' },
    cszc: { title: '财税政策' },
    cyzc: { title: '产业政策' },
    cyyj: { title: '产业研究' },
    sjxx: { title: '数据信息' },
    zjgd: { title: '专家观点' },

    jrxh: { title: '加入协会' },
    tsfw: { title: '特色服务' },
    hyhd: { title: '会员活动' },
    hyfc: { title: '会员风采' },
    hyqyzp: { title: '会员企业招聘' },
    mqmp: { title: '名企/名品推荐' },

    srgg: { title: '双软公告' },
    srdt: { title: '双软动态' },
    qypg: { title: '企业评估' },
    cppg: { title: '产品评估' },
    tgxc: { title: '推广宣传' },
    xgxz2: { title: '双软相关下载' },

    rjzzq: { title: '软件著作权' },
    flfg: { title: '法律法规' },

    tzgg: { title: 'ITSS通知公告' },
    ITSSdt: { title: 'ITSS动态' },
    ITSSjs: { title: 'ITSS介绍' },
    ITSSbz: { title: 'ITSS标准' },
    ITSSyb: { title: 'ITSS月报' },
    yyal: { title: '应用案例' },
    xgxzi: { title: 'ITSS相关下载' },

    xydjpj: { title: '信用等级评价' },
    kjcgpj: { title: '科技成果评价' },
    dbpc: { title: '等保评测' },
    rjzj: { title: '软件造价' },
    txrz: { title: '体系认证' },
    zxjsfw: { title: '专项技术服务' },

    shzzdj: { title: '社会组织党建' },
    xyzl: { title: '行业自律' },
    xhkw: { title: '协会刊物' },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/government#hu-bei-ruan-jian-hang-ye-xie-hui">docs</a>');
    }

    const current_url = url.resolve(root_url, `/${ctx.params.caty}/index.jhtml`);
    const response = await got({
        method: 'get',
        url: current_url,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.i_content li')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[href]');
            const span = item.find('span');
            return {
                title: a.text(),
                link: url.resolve(current_url, a.attr('href')),
                pubDate: parseDate(span.text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);

                item.description = content('div.article').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '湖北软协 - ' + cfg.title,
        link: root_url,
        item: items,
    };
};
