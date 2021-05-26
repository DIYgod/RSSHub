const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // pgyer目前个人版分发页面有三种模板
    const indexOfEle = {
        viewColorful: {
            appName: 'title',
            appIntro: '#description',
            updateIntro: '.update-description',
            version: '.breadcrumb',
            appSize: '.breadcrumb',
            appImg: 'td',
            appStatus: '#down_load',
        },
        viewClassic: {
            appName: 'title',
            appIntro: '#description',
            updateIntro: 'body > div.container.content > div:nth-child(5) > div > div',
            version: 'ul',
            appSize: 'ul',
            appImg: 'td',
            appStatus: '#down_load',
        },
        viewGreen: {
            appName: 'title',
            appIntro: '#description',
            updateIntro: 'body > div.container.content > div:nth-child(5) > div > div',
            version: 'ul',
            appSize: 'ul',
            appImg: 'td',
            appStatus: '#down_load',
        },
    };
    const app = ctx.params.app;
    const link = `https://www.pgyer.com/${app}`;
    const { data } = await got.get(link);
    const $ = cheerio.load(data);

    // 页面模板判断
    let pageTemplate = '';
    $('head > link')
        .toArray()
        .forEach((item) => {
            const cssName = $(item).attr('href').split('/');
            cssName[cssName.length - 1].split('.').forEach((val) => {
                Object.keys(indexOfEle).forEach((item) => {
                    if (item === val) {
                        pageTemplate = val;
                    }
                });
            });
        });
    const appName = $(`${indexOfEle[pageTemplate].appName}`).text();
    const appIntro = $(`${indexOfEle[pageTemplate].appIntro}`).text();
    const version = $(`${indexOfEle[pageTemplate].version}`).children('li').eq(0).text();
    const appSize = $(`${indexOfEle[pageTemplate].appSize}`).children('li').eq(1).text().slice(3);
    const appImg = $(`${indexOfEle[pageTemplate].appImg}`)
        .toArray()
        .reduce((acc, curr) => (acc += `<img src='${$(curr).children().find('img').attr('src')}'  style="margin: 0 auto;">`), '');
    let appStatus = $(`${indexOfEle[pageTemplate].appStatus}`).text().trim();
    if (appStatus === '点击安装') {
        appStatus = '可下载安装';
    }

    let updateIntro = $(`${indexOfEle[pageTemplate].updateIntro}`).text().trim().slice(4);
    if (updateIntro === '') {
        updateIntro = '暂无更新内容';
    }

    let description = '';
    if (appStatus) {
        description = `<b>安装状态:</b>${appStatus}<br>
                        <b>软件大小:</b>${appSize}<br>
                        <b>更新说明:</b>${updateIntro}<br>
                        <b>应用截图:</b><br>${appImg}`;
    }

    ctx.state.data = {
        title: appName,
        link: `https://www.pgyer.com/${app}`,
        description: appIntro,
        item: [
            {
                link: link,
                title: `${appName}-${version}`,
                description: `${description}`,
            },
        ],
    };
};
