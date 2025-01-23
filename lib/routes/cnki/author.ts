import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { ProcessItem } from './utils';

export const route: Route = {
    name: '作者',
    maintainers: ['Derekmini', 'harveyqiu'],
    categories: ['journal'],
    path: '/author/:name/:company',
    parameters: { name: '作者姓名', company: '作者单位' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    example: '/cnki/author/丁晓东/中国人民大学',
    description: `::: tip
    可能仅限中国大陆服务器访问，以实际情况为准。
:::`,
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const company = ctx.req.param('company');
    const host = 'https://kns.cnki.net';
    const link = `${host}/kns8s/AdvSearch?classid=WD0FTY92`;

    const params = new URLSearchParams();
    params.append('boolSearch', 'true');
    params.append(
        'QueryJson',
        JSON.stringify({
            Platform: '',
            Resource: 'CROSSDB',
            Classid: 'WD0FTY92',
            Products: '',
            QNode: {
                QGroup: [
                    {
                        Key: 'Subject',
                        Title: '',
                        Logic: 0,
                        Items: [],
                        ChildItems: [
                            {
                                Key: 'input[data-tipid=gradetxt-1]',
                                Title: '作者',
                                Logic: 0,
                                Items: [
                                    {
                                        Key: 'input[data-tipid=gradetxt-1]',
                                        Title: '作者',
                                        Logic: 0,
                                        Field: 'AU',
                                        Operator: 'DEFAULT',
                                        Value: name,
                                        Value2: '',
                                    },
                                ],
                                ChildItems: [],
                            },
                            {
                                Key: 'input[data-tipid=gradetxt-2]',
                                Title: '作者单位',
                                Logic: 0,
                                Items: [
                                    {
                                        Key: 'input[data-tipid=gradetxt-2]',
                                        Title: '作者单位',
                                        Logic: 0,
                                        Field: 'AF',
                                        Operator: 'FUZZY',
                                        Value: company,
                                        Value2: '',
                                    },
                                ],
                                ChildItems: [],
                            },
                        ],
                    },
                    {
                        Key: 'ControlGroup',
                        Title: '',
                        Logic: 0,
                        Items: [],
                        ChildItems: [],
                    },
                ],
            },
            ExScope: '0',
            SearchType: 3,
            Rlang: 'CHINESE',
            KuaKuCode: 'YSTT4HG0,LSTPFY1C,JUP3MUPD,MPMFIG1A,EMRPGLPA,WQ0UVIAA,BLZOG7CK,PWFIRAGL,NN3FJMUV,NLBO1Z6R',
        })
    );
    params.append('pageNum', '1');
    params.append('pageSize', '20');
    params.append('sortField', 'PT');
    params.append('sortType', 'desc');
    params.append('dstyle', 'listmode');
    params.append('productStr', 'YSTT4HG0,LSTPFY1C,RMJLXHZ3,JQIRZIYA,JUP3MUPD,1UR4K4HZ,BPBAFJ5S,R79MZMCB,MPMFIG1A,EMRPGLPA,J708GVCE,ML4DRIDX,WQ0UVIAA,NB3BWEHK,XVLO76FD,HR1YT1Z9,BLZOG7CK,PWFIRAGL,NN3FJMUV,NLBO1Z6R,');
    params.append('aside', `（作者：${name}(精确)）AND（作者单位：${company}(模糊)）`);
    params.append('searchFrom', '资源范围：总库;  时间范围：更新时间：不限;');
    params.append('CurPage', '1');

    const response = await ofetch(`${host}/kns8s/brief/grid`, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            referer: `${host}/kns8s/AdvSearch?classid=WD0FTY92`,
        },
        body: params.toString(),
    });
    const $ = load(response);
    const list = $('tr')
        .toArray()
        .slice(1)
        .map((item) => {
            const title = $(item).find('a.fz14').text();
            const filename = $(item).find('a.icon-collect').attr('data-filename');
            const link = `https://cnki.net/kcms/detail/detail.aspx?filename=${filename}&dbcode=CJFD`;
            const pubDate = parseDate($(item).find('td.date').text(), 'YYYY-MM-DD');
            return {
                title,
                link,
                pubDate,
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => ProcessItem(item))));

    const processedItems = items
        .filter((item): item is Record<string, any> => item !== null && typeof item === 'object')
        .map((item) => ({
            title: item.title || '',
            link: item.link,
            pubDate: item.pubDate,
        }));

    return {
        title: `知网 ${name} ${company}`,
        link,
        item: processedItems,
    };
}
