const got = require('@/utils/got');
const cheerio = require('cheerio');
const map = new Map([
    ['1', { name: '今日推荐' }],
    ['2', { name: '精选' }],
]);
module.exports = async (ctx) => {
    const typeid = ctx.params.typeid || '2';
    const OutName = map.get(typeid).name;
    const url = `https://coffee.pmcaff.com/list?type=${typeid}`;
    const response = await got({
        method: 'post',
        url: `https://coffee.pmcaff.com/list`,
        headers: {
            Referer: url,
        },
        json: true,
        data: {
            page: 1,
            feed_sum: 15,
            type: typeid,
            times: 0,
            user_id: 0,
        },
    });
    const list = response.data.data;
    // console.log(list.length);
    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.created_at;
            const id = info.id;
            const author = info.author;
            const itemUrl = `https://coffee.pmcaff.com/article/${id}`;
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got({
                method: 'get',
                url: itemUrl,
                headers: {
                    Referer: url,
                },
            });
            const data = response.data;
            const $ = cheerio.load(data);
            $('#articleCont img').attr('referrerpolicy', 'no-referrer');
            const description = $('#articleCont').html();

            const single = {
                title: title,
                author,
                link: itemUrl,
                description: description,
                pubDate: new Date(date + ' GMT').toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `${OutName}-PMCAFF互联网产品社区`,
        description: `PMCAFF互联网产品社区 - 产品经理人气组织::专注于互联网产品研究`,
        link: url,
        item: out,
    };
};
