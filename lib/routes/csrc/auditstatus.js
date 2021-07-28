const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const apply_id = ctx.params.apply_id;
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
    const item_url = `https://neris.csrc.gov.cn/alappl/home1/onlinealog?appMatrCde=${apply_id}`;
    const url = 'https://neris.csrc.gov.cn/alappl/home1/onlinealog.do';
    const res = await got({
        // method: 'get',
        method: 'post',
        url: url,
        headers: {
            'User-Agent': userAgent,
        },
        form: {
            appMatrCde: apply_id,
            pageNo: 1,
            pageSize: 10,
        },
        rejectUnauthorized: false,
    });
    const $ = cheerio.load(res.data);
    const list = $('tr[height=50]').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const audit_status_td = $('td[style="font-weight:100 ;color: black ;position: relative;left:20px"]');
            const audit_status = audit_status_td.eq(-1).text();
            const title = '【' + audit_status + '】' + $('li.templateTip').text();
            const audit_date = audit_status_td.eq(-1).next('td').text();

            let audit_desc = '';
            if (audit_status_td.length > 1) {
                for (let i = 0; i < audit_status_td.length; i++) {
                    audit_desc += audit_status_td.eq(i).next('td').text() + '，' + audit_status_td.eq(i).text() + '；';
                }
            } else {
                audit_desc = audit_date + '，' + audit_status;
            }

            const description = $('li.templateTip').text() + '：' + audit_desc;
            const itemUrl = item_url;

            const single = {
                title,
                description,
                pubDate: new Date(audit_date).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '申请事项进度查询 - 中国证监会',
        link: item_url,
        item: out,
    };
};
