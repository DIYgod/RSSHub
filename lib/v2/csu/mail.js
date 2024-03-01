const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function fetch(address) {
    const res = await got(address);
    const $ = cheerio.load(res.data);
    return $('.tb-ct-info').html();
}

module.exports = async (ctx) => {
    const baseUrl = 'https://oa.csu.edu.cn';
    const { type = '01' } = ctx.params;
    const link = `${baseUrl}/mailbox/NoAuth/MailList_Pub?tp=${type}`;

    const response = await got.post(`${baseUrl}/mailbox/NoAuth/Get_MailList_Pub`, {
        form: {
            params: `{"XXLX":"${type}","tjnr":""}`,
            pageSize: 1,
            pageNo: 15,
        },
    });

    const list = response.data.data.map((item) => ({
        title: item.WJBT,
        link: `${baseUrl}/mailbox/NoAuth/MailInInfo?XXLX=${type}&id=${item.NBBM}`,
        pubDate: timezone(parseDate(item.LXSJ), 8),
        author: item.FZDW,
        category: item.NRFL,
    }));

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                item.description = await fetch(item.link);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `中南大学学校信箱 - ${type === '01' ? '校长信箱' : '党委信箱'}`,
        link,
        item: out,
    };
};
