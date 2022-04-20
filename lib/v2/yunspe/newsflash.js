const got = require('@/utils/got');
// const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: `https://www.yunspe.com/wp-json/b2/v1/getNewsflashesList`,
        headers: {
            Referer: `https://www.yunspe.com/newsflashes`,
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: 'paged=1&term=0&post_paged=1',
    });
    const data = response.data.data;

    const out = data.map((item) => {
        const year = String(item[0].date.key).substring(0, 4);
        const mouthlength = item[0].date._date.indexOf('月');
        const month = mouthlength > 1 ? item[0].date._date.substring(0, mouthlength) : '0' + item[0].date._date.substring(0, mouthlength);
        let day = item[0].date._date.substring(mouthlength + 1);
        day = day.length > 1 ? day : '0' + day;

        const link = item[0].link;
        const date = new Date(year + '-' + month + '-' + day + ' ' + item[0].date.time + ':00');
        const title = item[0].title.replace('【微语简报】', '');
        const description = item[0].content
            .substring(item[0].content.indexOf('【今日简报】') + 6)
            .replace(/(\d*\.\s)|(【)/g, '<br>$1$2')
            .substring(4);

        const single = {
            title,
            link,
            pubDate: date,
            description,
        };

        return single;
    });
    ctx.state.data = {
        title: `微语简报`,
        link: `https://www.yunspe.com/wp-json/b2/v1/getNewsflashesList`,
        description: '微语简报',
        item: out,
    };
};
