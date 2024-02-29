// Japan government page

// params:
// [null]

const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser
const path = require('path');

const base_url = 'https://www.mofa.go.jp';
const index_url = path.join(base_url, '/mofaj/press/kaiken/bn/index.html');
module.exports = async (ctx) => {
    // get the update list
    const response = await got({
        method: 'get',
        url: index_url,
    });
    const data = response.data; // content is html format

    const $ = cheerio.load(data);
    const list = $('dl.title-list dt.list-title a');

    // parse meeting urls
    const detail_urls = [];
    for (const a of list) {
        // for (let i = 0; i < 1; ++i) {
        if ($(a).text() === 'テキスト版要旨') {
            let l = $(a).attr('href');
            l = path.join(base_url, l);
            detail_urls.push(l);
        }
    }

    // get meetings
    const responses = await Promise.all(detail_urls.map((url) => got(url)));
    const meetings = responses.map(({ data }) => data);

    // get real data to feed
    const article_list = [];
    for (const meeting of meetings) {
        const $ = cheerio.load(meeting);
        $('script').remove();
        $('div.social-btn-top').remove();
        const link = $('meta[property="og:url"]').attr('content');
        const title = $('meta[property="og:title"]').attr('content');
        const author = '外務省';
        const content = $('h3.title3').html() + '<br/>' + $('div#maincontents').html();

        let pub_date_num = '1970-01-01T00:00Z';
        try {
            const date_str = $('h3.title3').text();
            const m = date_str.match(/（(..)(\d+)年(\d+)月(\d+)日（(.)曜日）(\d+)時(\d+)分.*）/);
            const era = m[1];
            let yy = Number.parseInt(m[2]);
            const mm = m[3];
            const dd = m[4];
            // const ww = m[5];
            const HH = m[6];
            const MM = m[7];
            switch (era) {
                case '昭和':
                    yy += 1925;
                    break;
                case '平成':
                    yy += 1988;
                    break;
                case '令和':
                    yy += 2018;
                    break;
            }
            pub_date_num = yy.toString() + '-' + mm + '-' + dd + ' ' + HH + ':' + MM + ' +09';
            // console.log(pub_date_num);
        } catch (error) {
            error;
        }
        const pub_date = new Date(pub_date_num).toUTCString();

        const item = {
            title,
            author,
            pubDate: pub_date,
            link,
            description: content,
        };
        article_list.push(item);
    }

    // feed the data
    ctx.state.data = {
        title: '日本国外務省記者会見',
        link: index_url,
        item: article_list,
    };
};
