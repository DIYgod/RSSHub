const got = require('@/utils/got');
const cheerio = require("cheerio");

const prefix = 'https://www.baozimh.com';

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `${prefix}/comic/${name}`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const chapters = [];
    //  展开部分列表
    $('#chapter-items > div > a').map((index, el) => {
        const url = $(el).attr('href');
        const title = $(el).find('div > span').text();
        chapters.push({title, link: url});
        return el;
    });
    //  闭合部分列表
    try {
        $('#chapters_other_list > div > a').map((i, el) => {
            const url = $(el).attr('href');
            const title = $(el).find('div > span').text();
            chapters.push({title, link: url});
            return el;
        });
        // eslint-disable-next-line no-empty
    } catch (e) {
    }
    chapters.reverse();

    // 更新时间
    const lastUpdateAtStr = $('#layout > div.comics-detail > div.de-info-wr > div.l-content > div > div.pure-u-1-1.pure-u-sm-2-3.pure-u-md-3-4 > div > div.supporting-text.mt-2 > div:nth-child(2) > span > em').text().trim('\n').trim();
    const hasDataStr = lastUpdateAtStr.match(/\((\d+).(\d+).(\d+)/);
    if (hasDataStr !== null) {
        const lastUpdateAt = (new Date(`${hasDataStr[1]}-${hasDataStr[2]}-${hasDataStr[3]} 00:00:00`)).getTime();
        chapters[0].pubDate = lastUpdateAt;
    }
    chapters.forEach((el, i) => {
        if (i === 0 && el.pubDate !== null) {
            return;
        }
        const startTime = chapters[0].pubDate !== null ? chapters[0].pubDate - 60 * 60 * 24 * 1000 : Date.now();
        chapters[i].pubDate = startTime - i * 10000;
    });
    // 获取最后一章节内容
    let description = '';
    const images = (await getDetail(chapters[0].link));
    images.forEach((v) => {
        description = ` ${description}  <img src='${v}' />`;
    });
    chapters[0].description = description;

    const title = $('#layout > div.comics-detail > div.de-info-wr > div.l-content > div > div.pure-u-1-1.pure-u-sm-2-3.pure-u-md-3-4 > div > h1').text();

    ctx.state.data = {
        title,
        link: url,
        item: chapters,
    };
};


const getDetail = async (url) => {
    if (!url.match(/https?:\/\/.+/)) {
        url = `${prefix}${url}`;
    }
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    let imags = new Set();
    $('button').map((i, el) => {
        try {
            const text = $(el).attr('on');
            const result = text.match(/(https?:\/\/[^?]+)/g);
            if (text.match('tap:AMP.setState') && result !== null) {
                imags.add(result[0]);
            }
            // eslint-disable-next-line no-empty
        } catch (e) {
        }
        return el;
    });

    const nextChapterUrl = $('#layout > div > div.next_chapter > a').attr('href');
    if (nextChapterUrl) {
        const nexUrls = await getDetail(nextChapterUrl);
        imags = new Set([...imags, ...nexUrls]);
    }
    return imags;
};
