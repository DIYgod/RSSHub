const got = require('../../utils/got');

module.exports = async (ctx) => {

    const response = await got({
        method: 'post',
        url: `https://www.yunspe.com/wp-json/b2/v1/getNewsflashesList`,
        headers: {
            Referer: `https://www.yunspe.com/newsflashes`,
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: "paged=1&term=0&post_paged=1",
    });
    let data = response.data.data;

    function getDate(datestr, mouthstr) {
        let year = String(datestr).substring(0, 4);
        let mouthlength = mouthstr.indexOf('月');
        let month = mouthlength > 1 ? mouthstr.substring(0, mouthlength) : ('0' + mouthstr.substring(0, mouthlength));

        let day = mouthstr.substring(mouthlength + 1);
        day = day.length > 1 ? day : ('0' + day);
        return year + '-' + month + '-' + day;
    }
    ctx.state.data = {
        title: `微语简报`,
        link: `https://www.yunspe.com/wp-json/b2/v1/getNewsflashesList`,
        description: '微语简报',
        item: data.map((item) => ({
            title: item[0].title,
            description: item[0].content,
            pubDate: new Date(getDate(item[0].date.key, item[0].date._date) + ' ' + item[0].date.time + ':00'),
            link: item[0].link,
        })),
    };
};
