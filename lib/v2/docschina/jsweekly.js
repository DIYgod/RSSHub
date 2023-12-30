const got = require('@/utils/got');
const cheerio = require('cheerio');
const md = require('markdown-it')();

module.exports = async (ctx) => {
    const baseURL = 'https://docschina.org';
    const { data: res } = await got(`${baseURL}/weekly/js/docs/`);

    const $ = cheerio.load(res);

    const title = $('head title').text();
    const vendorLink = $('body script')
        .toArray()
        .find((i) =>
            $(i)
                .attr('src')
                .match(/vendor/)
        ).attribs.src;

    const { data: vendor } = await got(`https:${vendorLink}`);
    const env = vendor.match(/default.init\({env:"(.*?)"}\)/)[1]; // docschina-live-10765e
    const dataVersion = vendor.match(/,dataVersion:"(\d{4}-\d{2}-\d{2})",/)[1]; // 2020-01-10

    // const seqId = Math.random().toString(16).slice(2);
    const { data: document } = await got.post('https://tcb-api.tencentcloudapi.com/web', {
        headers: {
            origin: 'https://docschina.org',
            // referer: 'https://docschina.org/',
            // 'x-sdk-version': '@cloudbase/js-sdk/1.3.3',
            // 'x-seqid': seqId,
        },
        searchParams: {
            env,
        },
        json: {
            action: 'database.queryDocument',
            collectionName: 'js_weekly_document',
            dataVersion,
            env,
            limit: 100,
            query: JSON.stringify({
                path: '/',
            }),
            queryType: 'WHERE',
            // seqId,
        },
    });

    const { data: sidebar } = await got.post('https://tcb-api.tencentcloudapi.com/web', {
        headers: {
            origin: 'https://docschina.org',
        },
        searchParams: {
            env,
        },
        json: {
            action: 'database.queryDocument',
            collectionName: 'js_weekly_sidebar',
            dataVersion,
            env,
            limit: 100,
            query: JSON.stringify({
                pages: {
                    $in: [document.data.list[0]._id],
                },
            }),
        },
    });

    const list = sidebar.data.list[0].value
        .filter((i) => i.key !== 'home')
        .map((i) => ({
            title: i.title,
            link: `${baseURL}/weekly/js${i.path}`,
            key: i.key,
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: document } = await got.post('https://tcb-api.tencentcloudapi.com/web', {
                    headers: {
                        origin: 'https://docschina.org',
                    },
                    searchParams: {
                        env,
                    },
                    json: {
                        action: 'database.queryDocument',
                        collectionName: 'js_weekly_document',
                        dataVersion,
                        env,
                        limit: 100,
                        query: JSON.stringify({
                            path: item.key,
                        }),
                    },
                });

                item.description = md.render(document.data.list[0].content);

                delete item.key;
                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link: `${baseURL}/weekly/js/docs/`,
        icon: 'https://docschina.org/favicon.ico',
        item: items,
    };
};
