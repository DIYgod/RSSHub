const got = require('@/utils/got');
const cheerio = require('cheerio');
const md = require('markdown-it')();
const { parseDate } = require('@/utils/parse-date');
const asyncPool = require('tiny-async-pool');

const baseUrl = 'https://www.luogu.com.cn';

const typeMap = {
    ruleType: {
        1: 'OI',
        2: 'ACM',
        3: '乐多',
        4: 'IOI',
    },
    visibilityType: {
        1: '官方比赛',
        2: '团队公开赛',
        4: '个人公开赛',
    },
    // invitationCodeType: {
    //     1: '',
    //     2: '',
    // },
};

module.exports = async (ctx) => {
    const link = `${baseUrl}/contest/list`;
    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const data = JSON.parse(
        decodeURIComponent(
            $('script')
                .text()
                .match(/decodeURIComponent\("(.*)"\)/)[1]
        )
    );

    const result = [];
    for await (const item of asyncPool(4, data.currentData.contests.result, (item) =>
        ctx.cache.tryGet(`${baseUrl}/contest/${item.id}`, async () => {
            const { data: response } = await got(`${baseUrl}/contest/${item.id}`);
            const $ = cheerio.load(response);
            const data = JSON.parse(
                decodeURIComponent(
                    $('script')
                        .text()
                        .match(/decodeURIComponent\("(.*)"\)/)[1]
                )
            );

            return {
                title: item.name,
                description: md.render(data.currentData.contest.description),
                link: `${baseUrl}/contest/${item.id}`,
                author: item.host.name,
                pubDate: parseDate(item.startTime, 'X'),
                category: [item.rated ? 'Rated' : null, typeMap.ruleType[item.ruleType], typeMap.visibilityType[item.visibilityType]].filter((i) => i),
            };
        })
    )) {
        result.push(item);
    }

    ctx.state.data = {
        title: $('head title').text(),
        link,
        image: 'https://www.luogu.com.cn/favicon.ico',
        item: result,
    };
};
