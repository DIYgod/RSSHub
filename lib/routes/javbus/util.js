const axios = require('@/utils/axios');
const { load } = require('cheerio');

exports.getPage = async (url, ctx) => {
    const { data } = await axios(url);
    const $ = load(data);

    const pageTitle = `JavBus - ${$('head > title')
        .text()
        .replace(' - JavBus', '')}`;

    return {
        title: pageTitle,
        link: url,
        description: pageTitle,
        item: await Promise.all(parseItems($, ctx)),
    };
};

exports.createHandler = (url) => async (ctx) => {
    ctx.state.data = await exports.getPage(url, ctx);
};

const parseItems = ($, ctx) =>
    $('.movie-box')
        .map((_, ele) => ({
            title: $(ele)
                .find('img')
                .attr('title'),
            thumb: $(ele)
                .find('img')
                .attr('src'),
            link: $(ele).attr('href'),
            pubDate: new Date(
                $(ele)
                    .find('date:nth-child(4)')
                    .text()
            ).toUTCString(),
            aid: $(ele)
                .find('date:nth-child(3)')
                .text(),
        }))
        .toArray()
        .map(async ({ title, thumb, link, pubDate, aid }) => {
            const detail = await getDetail(link, ctx);
            title = `${aid} ${title}${detail.filmTime}`;
            if (detail.screenData) {
                detail.imgHTML = detail.screenData.map((url) => `<img referrerpolicy="no-referrer" src="${url}"><br />`);
            }
            return {
                title,
                link,
                pubDate,
                description: `
        <h3>${title}</h3>
        <br />
        <img referrerpolicy="no-referrer" src="${thumb.replace(/\/thumbs?\//, '/cover/').replace('.jpg', '_b.jpg')}" />
        ${detail.filmTime ? `<h3>发售日期 : ${detail.filmTime}</h3>` : ''}
        ${detail.actresses ? `<h3>女优 : ${detail.actresses}</h3>` : ''}
        ${detail.filmEstabName ? `<h3>發行商 : ${detail.filmEstabName}</h3>` : ''}
        ${detail.filmMakerbName ? `<h3>製作商 : ${detail.filmMakerbName}</h3>` : ''}
        ${detail.seriesName ? `<h3>系列 : ${detail.seriesName}</h3>` : ''}
        ${detail.screenData ? `<h3>影片截图 : </h3>${detail.imgHTML.join('')}` : ''}
    `.trim(),
            };
        });

const getDetail = async (link, ctx) => {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return JSON.parse(cache);
    } else {
        const resp = await axios(link);
        const detailPage = resp.data;
        // 演员
        const actressReg = /<a class="avatar-box"[\s\S]*?<\/a>/g;
        let match = detailPage.match(actressReg);
        let actresses = [];
        if (match) {
            match.map((i) => {
                const name = /<span>(.*?)<\/span>/.exec(i)[1];
                actresses = actresses.concat(name);
                return null;
            });
        } else {
            actresses = null; // []
        }
        // 影片详情
        // const filmCover = /<a class="bigImage" href="(.*?)"/.exec(detailPage)[1];
        // const filmName = /<a class="bigImage" href="(.*?)" title="(.*?)"/.exec(detailPage)[2];
        let filmTime = /<span class="header">發行日期:<\/span>([\s\S]*?)<\/p>/.exec(detailPage);
        if (filmTime) {
            filmTime = filmTime[1];
        } else {
            filmTime = null;
        }

        let filmLast = /<span class="header">長度:<\/span>([\s\S]*?)<\/p>/.exec(detailPage);
        if (filmLast) {
            const lastmins = /\d+/.exec(filmLast[1]);
            const hours = Math.floor(lastmins / 60);
            let mins = lastmins % 60;
            mins = mins === '0' ? '00' : mins;
            filmLast = hours + ':' + mins;
        } else {
            filmLast = null;
        }
        let filmEstabName = /<span class="header">發行商:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (filmEstabName) {
            filmEstabName = filmEstabName[2];
        } else {
            filmEstabName = null;
        }

        let filmMakerbName = /<span class="header">製作商:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (filmMakerbName) {
            filmMakerbName = filmMakerbName[2];
        } else {
            filmMakerbName = null;
        }
        let seriesName = /<span class="header">系列:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (seriesName) {
            seriesName = seriesName[2];
        } else {
            seriesName = null;
        }
        let directorName = /<span class="header">導演:[\s\S]*?"(.*?)">(.*?)<\/a>/.exec(detailPage);
        if (directorName) {
            directorName = directorName[2];
        } else {
            directorName = null;
        }

        const code = /<span class="header">識別碼:[\s\S]*?">([\s\S]*?)<\/span>/.exec(detailPage)[1];
        // 影片截图
        const regScreenshot = /<a class="sample-box" href="(.*?)"[\s\S]*?<img src="(.*?)">/g;
        match = detailPage.match(regScreenshot);
        let screenData = [];
        if (match) {
            screenData = match.map((i) => /<a class="sample-box" href="(.*?)"[\s\S]*?<img src="(.*?)">/g.exec(i)[1]);
        } else {
            screenData = null;
        }
        const detail = { actresses, filmTime, filmLast, filmEstabName, filmMakerbName, seriesName, directorName, code, screenData };
        ctx.cache.set(link, JSON.stringify(detail));
        return detail;
    }
};
