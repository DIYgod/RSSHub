// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const utils = require('./utils');

const baseUrl = 'https://www.cde.org.cn';
const xxgkMap = {
    xxgk: {
        priorityApproval: {
            title: '优先审评公示',
            url: `${baseUrl}/main/xxgk/listpage/2f78f372d351c6851af7431c7710a731`,
            endPoint: '/priority/getPriorityApprovalList',
            form: {
                pageSize: 50,
                pageNum: 1,
                noticeType: 2,
                acceptid: '',
                drugname: '',
                company: '',
            },
        },
        breakthroughCure: {
            title: '突破性治疗公示',
            url: `${baseUrl}/main/xxgk/listpage/da6efd086c099b7fc949121166f0130c`,
            endPoint: '/breakthrough/getBreakthroughCureList',
            form: {
                pageSize: 50,
                pageNum: 1,
                noticeType: 1,
                acceptid: '',
                drugname: '',
                company: '',
            },
        },
        cliniCal: {
            title: '临床试验默示许可',
            url: `${baseUrl}/main/xxgk/listpage/4b5255eb0a84820cef4ca3e8b6bbe20c`,
            endPoint: '/xxgk/getCliniCalList',
            form: {
                pageSize: 50,
                pageNum: 1,
                condition: '',
            },
        },
    },
};

export default async (ctx) => {
    const category = ctx.req.param('category');

    const { data } = await got.post(`${baseUrl}/main${xxgkMap.xxgk[category].endPoint}`, {
        form: xxgkMap.xxgk[category].form,
        headers: {
            referer: xxgkMap.xxgk[category].url,
            cookie: await utils.getCookie(ctx),
        },
    });

    const items = data.data.records.map((item) => ({
        title: item.drgnamecn,
        guid: item.acceptid,
        pubDate: item.endNoticeDate ? parseDate(item.endNoticeDate) : null,
        description: art(path.join(__dirname, `templates/xxgk/${category}.art`), { item }),
        link: xxgkMap.xxgk[category].url,
    }));

    ctx.set('data', {
        title: `${xxgkMap.xxgk[category].title} - 国家药品监督管理局药品审评中心`,
        link: xxgkMap.xxgk[category].url,
        item: items,
    });
};
