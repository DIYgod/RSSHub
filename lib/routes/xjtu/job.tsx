import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://job.xjtu.edu.cn';
const arr = {
    zxgg: '中心公告',
    xds: '选调生',
    zddw: '重点单位',
    gjzz: '国际组织',
    cxcy: '创新创业',
    jysx: '就业实习',
};

export const route: Route = {
    path: '/job/:subpath?',
    categories: ['university'],
    example: '/xjtu/job/zxgg',
    parameters: { subpath: '栏目类型，默认请求`zxgg`，详见下方表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '就业创业中心',
    maintainers: ['DylanXie123'],
    handler,
    description: `栏目类型

| 中心公告 | 选调生 | 重点单位 | 国际组织 | 创新创业 | 就业实习 |
| -------- | ------ | -------- | -------- | -------- | -------- |
| zxgg     | xds    | zddw     | gjzz     | cxcy     | jysx     |`,
};

async function handler(ctx) {
    const subpath = ctx.req.param('subpath') ?? 'zxgg';
    const getTzgg = await got.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getTzgg.do`, {
        form: {
            requestParamStr: '{"pageSize":7,"pageNumber":1}',
        },
    });

    const menuid = getTzgg.data.data.find((item) => item.menutitle === arr[subpath]).menuid;
    const { data } = await got.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getMhcxWzData.do`, {
        form: {
            requestParamStr: `{"pageSize":4,"pageNumber":1,"LMDM":${menuid}}`,
        },
    });
    const list = data.data.map((item) => ({
        title: item.menutitle,
        description: item.NR,
        pubDate: timezone(parseDate(item.SBSJ), +8),
        guid: item.menuid,
        link: `${baseUrl}/xsfw/sys/emaphome/website/template/detail.html?menuid=${item.menuid}&msg=TZGG&msgChild=NRXQ`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getWzone.do`, {
                    form: {
                        requestParamStr: `{"WID":${item.guid}}`,
                    },
                });

                let attachments = '';
                if (response.data.data[0].FJ) {
                    const attachmentData = await got(`${baseUrl}/xsfw/sys/emapcomponent/file/getUploadedAttachment.do?fileToken=${response.data.data[0].FJ}`);
                    attachments = renderToString(<XjtuAttachments items={attachmentData.data.items} />);
                }

                item.author = response.data.data[0].CZZXM;
                item.description = response.data.data[0].NR + attachments;
                return item;
            })
        )
    );

    return {
        title: `西安交通大学学生就业创业信息网 - ${arr[subpath]}`,
        link: baseUrl,
        item: items,
    };
}

const XjtuAttachments = ({ items }: { items: Array<{ fileUrl: string; name: string }> }) => (
    <>
        {items.map((item) => (
            <>
                <a href={item.fileUrl} rel="noreferrer">
                    {item.name}
                </a>
                <br />
            </>
        ))}
    </>
);
