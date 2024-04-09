const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.423down.com';

const categeoryMap = {
    index: {
        all: '',
    },
    android: {
        apk: 'apk',
    },
    computer: {
        originalsoft: 'zd423',
        multimedia: 'multimedia',
        browser: 'browser',
        image: 'image',
        im: 'im',
        work: 'work',
        down: 'down',
        systemsoft: 'systemsoft',
        systemplus: 'systemplus',
        security: 'security',
        patch: 'patch',
        hardware: 'hardware',
    },
    os: {
        win11: 'win11',
        win10: 'win10',
        win7: 'win7',
        winxp: 'winxp',
        winpe: 'pe-system',
    },
};

const titleMap = {
    index: {
        all: '首页',
    },
    android: {
        apk: '安卓软件',
    },
    computer: {
        originalsoft: '原创软件',
        multimedia: '媒体播放',
        browser: '网页浏览',
        image: '图形图像',
        im: '聊天软件',
        work: '办公软件',
        down: '上传下载',
        systemsoft: '系统辅助',
        systemplus: '系统必备',
        security: '安全软件',
        patch: '补丁相关',
        hardwork: '硬件相关',
    },
    os: {
        win11: 'windows 11',
        win10: 'Windows 10',
        win7: 'Windows 7',
        winxp: 'Windows XP',
        winpe: 'Windows PE',
    },
};

module.exports = async (ctx) => {
    const { category, type } = ctx.params;

    const url = `${rootUrl}/${categeoryMap[category][type]}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $('div.content-wrap > div > ul > li > a')
        .filter((_, item) => {
            const notAnotherWebPage = $(item).attr('style') !== 'display: none !important;';
            return notAnotherWebPage;
        })
        .map((_, item) => ({
            link: $(item).attr('href'),
        }))
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            item = await ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const $ = cheerio.load(detailResponse.data);

                const title = $('div.content-wrap > div > div.meta > h1 > a').text();
                const pageContent = $('div.content-wrap > div > div.entry').html();
                const pageComments = $('#postcomments > ol').html();
                const desc = pageContent + pageComments;
                const date = $('div.content-wrap > div > div.meta > p').text();
                const categeory = $('div.content-wrap > div > div.meta > p > a:not(.comm)').text();

                item.title = title;
                item.description = desc;
                item.categeory = categeory;
                item.pubDate = parseDate(date.split(' ')[0], 'YYYY-MM-DD');

                return item;
            });

            return item;
        })
    );

    ctx.state.data = {
        title: `423down-${titleMap[category][type]}`,
        link: url,
        item: items,
    };
};
