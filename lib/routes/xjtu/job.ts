// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as path from 'node:path';
import { art } from '@/utils/render';

const baseUrl = 'https://job.xjtu.edu.cn';
const arr = {
    zxgg: '中心公告',
    xds: '选调生',
    zddw: '重点单位',
    gjzz: '国际组织',
    cxcy: '创新创业',
    jysx: '就业实习',
};

export default async (ctx) => {
    const subpath = ctx.req.param('subpath') ?? 'zxgg';
    const getTzgg = await got.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getTzgg.do`, {
        form: {
            requestParamStr: '{"pageSize":7,"pageNumber":1}',
        },
        https: {
            rejectUnauthorized: false,
        },
    });

    const menuid = getTzgg.data.data.find((item) => item.menutitle === arr[subpath]).menuid;
    const { data } = await got.post(`${baseUrl}/xsfw/sys/jyxtgktapp/modules/jywzManage/getMhcxWzData.do`, {
        form: {
            requestParamStr: `{"pageSize":4,"pageNumber":1,"LMDM":${menuid}}`,
        },
        https: {
            rejectUnauthorized: false,
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
                    https: {
                        rejectUnauthorized: false,
                    },
                });

                let attachments = '';
                if (response.data.data[0].FJ) {
                    const attachmentData = await got(`${baseUrl}/xsfw/sys/emapcomponent/file/getUploadedAttachment.do?fileToken=${response.data.data[0].FJ}`, {
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    attachments = art(path.join(__dirname, 'templates/attachments.art'), {
                        items: attachmentData.data.items,
                    });
                }

                item.author = response.data.data[0].CZZXM;
                item.description = response.data.data[0].NR + attachments;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `西安交通大学学生就业创业信息网 - ${arr[subpath]}`,
        link: baseUrl,
        item: items,
    });
};
