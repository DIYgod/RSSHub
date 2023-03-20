const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const baseUrl = 'https://neris.csrc.gov.cn';
    const { apply_id } = ctx.params;
    const itemUrl = `${baseUrl}/alappl/home1/onlinealog`;
    const res = await got(itemUrl, {
        searchParams: {
            appMatrCde: apply_id,
        },
    });
    const $ = cheerio.load(res.data);

    const out = $('tr[height="50"]')
        .toArray()
        .map((item) => {
            item = $(item);
            const itemTitle = item.find('li.templateTip').text();
            const audit_status_td = item.find('td[style="font-weight:100 ;color: black ;position: relative;left:20px"]');
            const audit_status = audit_status_td.eq(-1).text();
            const title = '【' + audit_status + '】' + itemTitle;
            const audit_date = audit_status_td.eq(-1).next('td').text();

            let audit_desc = '';
            if (audit_status_td.length > 1) {
                for (let i = 0; i < audit_status_td.length; i++) {
                    audit_desc += audit_status_td.eq(i).next('td').text() + '，' + audit_status_td.eq(i).text() + '；';
                }
            } else {
                audit_desc = audit_date + '，' + audit_status;
            }

            const description = itemTitle + '：' + audit_desc;

            const single = {
                title,
                description,
                pubDate: timezone(parseDate(audit_date), 8),
                link: res.url,
                guid: `${res.url}#${md5(description)}`,
            };
            return single;
        });

    ctx.state.data = {
        title: `${$('.zx2 div').attr('title')} - 申请事项进度查询 - 中国证监会`,
        link: res.url,
        item: out,
    };
};
