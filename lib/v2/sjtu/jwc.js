const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const urlRoot = 'https://jwc.sjtu.edu.cn/xwtg';

async function getFullArticle(link) {
    const response = await got(link);
    const $ = cheerio.load(response.body);
    const content = $('.content-con');
    if (content.length === 0) {
        return null;
    }
    // resolve links of <img> and <a>
    content.find('img').each((_, e) => {
        const relativeLink = $(e).attr('src');
        const absLink = new URL(relativeLink, urlRoot).href;
        $(e).attr('src', absLink);
    });
    content.find('a').each((_, e) => {
        const relativeLink = $(e).attr('href');
        const absLink = new URL(relativeLink, urlRoot).href;
        $(e).attr('href', absLink);
    });
    return content.html() + ($('.Newslist2').length ? $('.Newslist2').html() : '');
}

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'notice';
    const config = {
        all: {
            section: '通知通告',
            link: '/tztg.htm',
        },
        news: {
            link: '/xwzx.htm',
            section: '新闻中心',
        },
        notice: {
            link: '/tztg.htm',
            section: '通知通告',
        },
        operation: {
            link: '/jxyx.htm',
            section: '教学运行',
        },
        affairs: {
            link: '/zcxw.htm',
            section: '注册学务',
        },
        yjb: {
            link: '/yjb.htm',
            section: '研究办',
        },
        jgb: {
            link: '/jgb.htm',
            section: '教改办',
        },
        zhb: {
            link: '/zhb.htm',
            section: '综合办',
        },
        language: {
            link: '/yywz.htm',
            section: '语言文字',
        },
        party: {
            link: '/ghyzb.htm',
            section: '工会与支部',
        },
        ge: {
            link: '/tsjy.htm',
            section: '通识教育',
        },
    };

    const sectionLink = urlRoot + config[type].link;

    const response = await got({
        method: 'get',
        url: sectionLink,
    });

    const $ = cheerio.load(response.body);

    const out = await Promise.all(
        $('body > div.list-box > div.container > div > div.ny_right > div > div.ny_right_con > div > ul')
            .find('li')
            .toArray()
            .map((e) => {
                const info = $(e).find('.wz');
                const relativeLink = info.find('a').attr('href');
                const link = new URL(relativeLink, sectionLink).href;
                const title = info.find('a > h2').text();
                const timeElement = $(e).find('.sj');
                const day = timeElement.find('h2').text();
                const yearAndMonth = timeElement.find('p').text();
                const pubDate = parseDate(`${yearAndMonth}.${day}`, 'YYYY.MM.DD');
                return ctx.cache.tryGet(link, async () => {
                    const description = await getFullArticle(link);
                    return {
                        title,
                        link,
                        pubDate,
                        description,
                    };
                });
            })
    );

    ctx.state.data = {
        title: '上海交通大学教务处 ' + config[type].section,
        link: sectionLink,
        item: out,
    };
};
