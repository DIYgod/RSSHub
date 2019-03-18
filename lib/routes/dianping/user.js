const date = require('../../utils/date');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const userUrl = url.resolve('https://m.dianping.com/userprofile/', id);

    const browser = await require('../../utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(userUrl);
    // eslint-disable-next-line no-undef
    const html = await page.evaluate(() => document.querySelector('body').innerHTML);
    browser.close();

    const $ = cheerio.load(html);
    const user = $('div.title h3').text();
    const out = $('ul.feed-list>li')
        .map(function() {
            const link = $(this)
                .find('a.link')
                .attr('href');
            const linkid = link.match(/id=\d+/i)[0].split('=')[1];
            const userInfo = $(this)
                .find('div.user-info>p')
                .text();
            let title = '';
            let content = '';
            let feedLink = '';
            const shop = $(this)
                .find('div.poi h4')
                .text();
            const position = $(this)
                .find('div.poi p')
                .text();
            const shopid = $(this)
                .find('div.poi>a')
                .attr('href')
                .match(/id=\d+/)[0]
                .split('=')[1];

            if (link.indexOf('reviewid') > -1) {
                // 点评
                feedLink = `https://m.dianping.com/ugcdetail/${linkid}?sceneType=0&bizType=1`;
                title = '发布点评';
                const statusClass = $(this)
                    .find('span.status i')
                    .attr('class')
                    .match(/star-\d+/)[0];
                let star = '';
                switch (statusClass) {
                    case 'star-10':
                        star = '一星';
                        break;
                    case 'star-20':
                        star = '二星';
                        break;
                    case 'star-30':
                        star = '三星';
                        break;
                    case 'star-35':
                        star = '三星半';
                        break;
                    case 'star-40':
                        star = '四星';
                        break;
                    case 'star-45':
                        star = '四星半';
                        break;
                    case 'star-50':
                        star = '五星';
                        break;
                }
                const imgs = $(this)
                    .find('div.album-box img')
                    .map(function() {
                        return '<img src="' + $(this).attr('data-src') + '" />';
                    })
                    .get();
                content =
                    '<p>' +
                    $(this)
                        .find('div.show')
                        .html() +
                    '</p>';
                if (star) {
                    content += `<p>打分&nbsp;${star}</p>`;
                }
                content += `<p><a href="http://www.dianping.com/shop/${shopid}">${shop} - ${position}</a></p>`;
                if (imgs) {
                    content += '<p>' + imgs.join('<br/>') + '</p>';
                }
            } else if (link.indexOf('listId') > -1) {
                // 攻略
                feedLink = `https://m.dianping.com/cityinsight/${linkid}`;
                content =
                    '<p>' +
                    $(this)
                        .find('div.show')
                        .html() +
                    '</p>';
                title = '发布攻略';
                content += `<p><a href="http://www.dianping.com/shop/${shopid}">${shop} - ${position}</a></p>`;
                const imgs = $(this)
                    .find('div.album-box img')
                    .map(function() {
                        return '<img src="' + $(this).attr('data-src') + '" />';
                    })
                    .get();
                if (imgs) {
                    content += '<p>' + imgs.join('<br/>') + '</p>';
                }
            } else if (link.indexOf('checkinid') > -1) {
                // 签到
                feedLink = `https://m.dianping.com/ugcdetail/${linkid}?sceneType=0&bizType=3`;
                title = '签到成功';
                content = `<p><a href="http://www.dianping.com/shop/${shopid}">${shop} - ${position}</a></p>`;
            }

            const info = {
                description: content,
                title: title,
                link: feedLink,
                pubDate: date(userInfo),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: `大众点评 - ${user}`,
        link: userUrl,
        description: `大众点评 - ${user}`,
        item: out,
    };
};
