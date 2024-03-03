// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const rootUrl = 'https://xgzlyhd.samr.gov.cn';
const apiUrl = new URL('gjjly/message/getMessageList', rootUrl).href;
const apiDataUrl = new URL('gjjly/message/getDataList', rootUrl).href;
const currentUrl = new URL('gjjly/index', rootUrl).href;

const types = {
    category: '1',
    department: '2',
};

const fetchOptions = async (type) => {
    const { data: response } = await got.post(apiDataUrl, {
        json: {
            type: types[type],
        },
    });

    return response.data;
};

const getOption = async (type, name) => {
    const options = await fetchOptions(type);
    const results = options.filter((o) => o.name === name || o.code === name);

    if (results.length > 0) {
        return results.pop();
    }
    return;
};

export default async (ctx) => {
    const { category, department } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    let categoryOption;
    let departmentOption;

    if (category) {
        categoryOption = await getOption('category', category);
    }

    if (department) {
        departmentOption = await getOption('department', department);
    }

    const { data: response } = await got.post(apiUrl, {
        json: {
            clyj: '',
            curPage: '1',
            endTime: '',
            fzsj: departmentOption?.code ?? '',
            lybt: undefined,
            lylx: categoryOption?.code ?? '',
            lynr: '',
            startTime: '',
            zj: '',
        },
    });

    const items = response.data.data.slice(0, limit).map((item) => ({
        title: item.lybt,
        link: `${currentUrl}#${item.zj}`,
        description: art(path.join(__dirname, 'templates/description.art'), {
            item,
        }),
        author: `${item.lyr} ⇄ ${item.fzsjCn}`,
        category: [item.fzsjCn],
        guid: `${currentUrl}#${item.zj}`,
        pubDate: parseDate(item.pubtime),
    }));

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = '国家市场监督管理总局';
    const title = $('title').text();
    const subtitle = [categoryOption ? categoryOption.name : undefined, departmentOption ? departmentOption.name : undefined].filter(Boolean).join(' - ');
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${author}${title}${subtitle ? ` - ${subtitle}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        image: new URL(`gjjly/${$('div.fd-logo img').prop('src')}`, rootUrl).href,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    });
};
