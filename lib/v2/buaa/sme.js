const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const BASE_URL = 'http://www.sme.buaa.edu.cn';

module.exports = async (ctx) => {
    const { type = 'tzgg' } = ctx.params;
    const { name, path } = getType(type);
    const list = await getList(`${BASE_URL}/${path}.htm`);
    ctx.state.data = {
        // 源标题
        title: `${name} - 集成电路学院`,
        // 源链接
        link: `http://www.sme.buaa.edu.cn/tzgg.htm`,
        // 源文章
        item: await getItems(ctx, list),
    };
};

async function getList(url) {
    const { data } = await got(url);
    const $ = cheerio.load(data);
    const list = $("div[class='Newslist'] > ul > li")
        .map((_, item) => {
            item = $(item);
            const $a = item.find('a');
            const link = $a.attr('href');
            return {
                title: item.find('a').text(),
                link: link.startsWith('http') ? link : `${BASE_URL}/${link}`, // 有些链接是相对路径
                pubDate: timezone(parseDate(item.find('span').text()), +8),
            };
        })
        .get();
    return list;
}

function getItems(ctx, list) {
    return Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: descrptionResponse } = await got(item.link);
                const $descrption = cheerio.load(descrptionResponse);
                item.description = $descrption('div[class="v_news_content"]').html();
                return item;
            })
        )
    );
}

function getType(type) {
    const res = {
        name: type,
        path: type,
    };
    switch (type) {
        // 首页
        case 'xyyw':
            res.name = '学院要闻';
            break;
        case 'tzgg':
            res.name = '通知公告';
            break;
        case 'cggs':
            res.name = '采购公示';
            break;
        case 'xsbg':
            res.name = '学术报告';
            break;
        case 'jxxx':
            res.name = '教学信息';
            break;
        // 学院概况
        case 'xkjs':
            res.name = '学科建设';
            res.path = 'xygk/xkjs';
            break;
        case 'xxgk':
            res.name = '信息公开';
            res.path = 'xygk/xxgk';
            break;
        // 科学研究
        case 'kyld':
            res.name = '科研亮点';
            res.path = 'kxyj/kyld';
            break;
        case 'xshy':
            res.name = '学术会议';
            res.path = 'kxyj/xshy';
            break;
        case 'jzxx':
            res.name = '讲座信息';
            res.path = 'kxyj/jzxx';
            break;
        // 人才培养
        case 'yzkc':
            res.name = '优质课程';
            res.path = 'rcpy/yzkc';
            break;
        case 'cxsj':
            res.name = '创新实践';
            res.path = 'rcpy/cxsj';
            break;
        case 'bks':
            res.name = '本科生';
            res.path = 'rcpy/bks';
            break;
        case 'sss':
            res.name = '硕士生';
            res.path = 'rcpy/sss';
            break;
        case 'bss':
            res.name = '博士生';
            res.path = 'rcpy/bss';
            break;
        // 招生就业
        case 'bkzs':
            res.name = '本科招生';
            res.path = 'zsjy/bkzs';
            break;
        case 'yjszs':
            res.name = '研究生招生';
            res.path = 'zsjy/yjszs';
            break;
        case 'jyxx':
            res.name = '就业信息';
            res.path = 'zsjy/jyxx';
            break;
        // 学生工作
        case 'djgz':
            res.name = '学生工作 - 党建工作';
            res.path = 'xsgz/djgz';
            break;
        case 'ftwgz':
            res.name = '分团委工作';
            res.path = 'xsgz/ftwgz';
            break;
        case 'xgdt':
            res.name = '学工动态';
            res.path = 'xsgz/xgdt';
            break;
        // 党群工作
        case 'dsxxjy':
            res.name = '党史学习教育';
            res.path = 'dqgz/dsxxjy';
            break;
        case 'bwcxljsmztjy':
            res.name = '“不忘初心、牢记使命”主题教育';
            res.path = 'dqgz/bwcxljsmztjy';
            break;
        case 'djgz2':
            res.name = '党群工作 - 党建工作';
            res.path = 'dqgz/djgz';
            break;
        case 'ghgz':
            res.name = '工会工作';
            res.path = 'dqgz/ghgz';
            break;
        case 'xyh':
            res.name = '校友会';
            res.path = 'dqgz/xyh';
            break;
        // 国际合作
        case 'gjhzjd':
            res.name = '国际合作基地';
            res.path = 'gjhz/gjhzjd';
            break;
        case 'gjhy':
            res.name = '国际会议';
            res.path = 'gjhz/gjhy';
            break;
        case 'sxwxm':
            res.name = '双学位项目';
            res.path = 'gjhz/sxwxm';
            break;
        // 相关下载
        case 'xgxz':
            res.name = '相关下载';
            break;
    }
    return res;
}
