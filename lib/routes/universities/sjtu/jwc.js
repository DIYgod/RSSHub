const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

const urlRoot = 'http://www.jwc.sjtu.edu.cn/web/sjtu/';

const transcode = (buffer) => {
    const data = iconv.decode(buffer, 'gb2312');
    return cheerio.load(data);
};

async function getFullArticle(link) {
    try {
        const response = await got({
            method: 'get',
            url: link,
            responseType: 'buffer',
        });
        const fullArtData = transcode(response.data);
        const fullArt = fullArtData('.main_r_co_fo').html();
        return fullArt;
    } catch (error) {
        return '<h1> 这条消息被 -1s 了 </h1>';
    }
}

module.exports = async (ctx) => {
    const type = ctx.params.type || 'students';
    const config = {
        students: {
            link: '198076.htm',
            section: '面向学生的通知',
        },
        news: {
            link: '198005.htm',
            section: '新闻中心',
        },
        notice: {
            link: '198392.htm',
            section: '通知通告',
        },
        operation: {
            link: '198042.htm',
            section: '教学运行',
        },
        affairs: {
            link: '198043.htm',
            section: '注册学务',
        },
        yjb: {
            link: '198044.htm',
            section: '研究办',
        },
        jgb: {
            link: '198046.htm',
            section: '教改办',
        },
        zhb: {
            link: '198047.htm',
            section: '综合办',
        },
        party: {
            link: '198097.htm',
            section: '工会与支部',
        },
    };

    const sectionLink = url.resolve(urlRoot, config[type].link);

    const response = await got({
        method: 'get',
        url: sectionLink,
        responseType: 'buffer',
    });

    const $ = transcode(response.data);

    const out = await Promise.all(
        $('.main_r_xuxian')
            .find('tr')
            .slice(0, 10)
            .map(async (i, e) => {
                const title = $(e)
                    .find('a')
                    .text()
                    .replace(/[\r\n]/g, ' ');
                const relativeLink = $(e).find('a').attr('href');
                const link = url.resolve(sectionLink, relativeLink);
                const date = new Date(
                    $(e)
                        .children('td')
                        .eq(-1)
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}/)[0]
                );
                const timeZone = 8;
                const serverOffset = date.getTimezoneOffset() / 60;
                const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
                const description = await ctx.cache.tryGet(link, () => getFullArticle(link));
                const single = {
                    title,
                    link,
                    pubDate,
                    description,
                };
                return Promise.resolve(single);
            })
            .get()
    );

    ctx.state.data = {
        title: '上海交通大学教务处 ' + config[type].section,
        link: sectionLink,
        item: out,
    };
};
