// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function fetch(address) {
    const res = await got(address);
    const $ = load(res.data);
    return $('.tb-ct-info').html();
}

export default async (ctx) => {
    const baseUrl = 'https://oa.csu.edu.cn';
    const { type = '01' } = ctx.req.param();
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
            cache.tryGet(item.link, async () => {
                item.description = await fetch(item.link);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `中南大学学校信箱 - ${type === '01' ? '校长信箱' : '党委信箱'}`,
        link,
        item: out,
    });
};
