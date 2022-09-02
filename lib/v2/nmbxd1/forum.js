const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// extracted from https://www.nmbxd1.com/Public/Css/h.desktop.css
const style = `
<style>
    .h-threads-item {
        display: block;
        background: #ffe;
        color: #800000;
    }
    
    .h-threads-item .h-threads-img-box {
        display: inline;
        position: relative;
        margin: 3px 0;
    }
    
    .h-threads-item .h-threads-img-box .h-threads-img-a .h-threads-img {
        padding: 0;
        margin: 0 20px;
        max-width: 250px;
    }
    
    .h-threads-item .h-threads-info .h-threads-info-title {
        font-weight: bold;
        color: #cc1105;
    }
    
    .h-threads-item .h-threads-info .h-threads-info-email {
        font-weight: bold;
        color: #117743;
    }
    
    .h-threads-item .h-threads-info .h-threads-info-email,
    .h-threads-item .h-threads-info .h-threads-info-createdat,
    .h-threads-item .h-threads-info .h-threads-info-uid,
    .h-threads-item .h-threads-info .h-threads-info-id,
    .h-threads-item .h-threads-info,
    .h-threads-item .h-threads-info {
        margin-left: 5px;
    }
    
    .h-threads-item .h-threads-info {
        font-size: 12px;
    }
    
    .h-threads-item .h-threads-info a {
        margin: 0 2px;
    }
    
    .h-threads-item .h-threads-content {
        font-size: 16px;
        line-height: 22px;
        margin: 15px 40px;
    }
    
    .h-threads-item .h-threads-item-replies .h-threads-item-reply {
        display: table;
        margin-bottom: 3px;
    }
    
    .h-threads-item .h-threads-item-replies .h-threads-item-reply .h-threads-item-reply-main {
        display: table-cell;
        background: #f0e0d6;
    }
</style>`;

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://www.nmbxd1.com';
    const currentUrl = /^\d+$/.test(id) ? `${rootUrl}/Forum/timeline/id/${id}` : `${rootUrl}/f/${id}`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    $('.h-threads-img-tool').remove();
    $('.h-threads-item-reply-icon').remove();
    $('.h-admin-tool').remove();
    $('.h-threads-tips').remove();
    $('.h-threads-info-report-btn').remove();
    $('.h-threads-info-reply-btn').remove();

    const items = $('.h-threads-item')
        .get()
        .map((item) => {
            item = $(item);
            // Do not remove the info element to keep the description style consistent.
            const info = item.find('.h-threads-item-main .h-threads-info');
            const title = info.find('.h-threads-info-title').text();
            const author = [info.find('.h-threads-info-uid font'), info.find('.h-threads-info-uid')]
                .find((elem) => elem.length > 0)
                .contents()
                .first()
                .text()
                .replace(/^ID:/, '');
            const category = info.find('spam').text();
            const link = new URL(rootUrl + info.find('.h-threads-info-id').attr('href'));
            // cleanup query paramter
            link.query = link.search = '';
            const pubDate = timezone(parseDate(info.find('.h-threads-info-createdat').text().replace(/\(.\)/, ' ')), +8);

            return {
                title,
                author,
                category,
                description: `<div class="h-threads-item">${item.html()}</div>${style}`,
                pubDate,
                link: link.toString(),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: items,
    };
};
