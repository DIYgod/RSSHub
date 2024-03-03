// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';

const host = 'https://gateway-api-ipv4.dushu365.com/compose-orch/offlineActivity/v100/activity/list';
const itemLink = 'https://card.dushu.io/requirement/offline-activity/activity-detail/v/index.html';
const link = 'https://card.dushu.io/requirement/offline-activity/host-home/v/index.html?webview-type=rn&hostId=xtntzsnwsnkw511r';

const transformTime = (item) => {
    const startTime = new Date(item.startTime);
    item.startTime = `${startTime.getFullYear()}-${startTime.getMonth() + 1}-${startTime.getDate()} ${startTime.getHours()}:${startTime.getMinutes()}`;
    const endTime = new Date(item.endTime);
    item.endTime = `${endTime.getFullYear()}-${endTime.getMonth() + 1}-${endTime.getDate()} ${endTime.getHours()}:${endTime.getMinutes()}`;
};

export default async (ctx) => {
    const response = await got
        .post(host, {
            json: {
                channelTid: 'xtntzsnwsnkw511r',
                pageNo: 1,
                pageSize: 10,
                type: 0,
            },
        })
        .json();

    const data = response.data.activityListVOS;
    data.map((element) => transformTime(element));

    ctx.set('data', {
        title: '樊登福州运营中心',
        link,
        item: data.map((item) => ({
            title: item.activityName,
            link: itemLink + '?productId=' + item.activityId + '&type=' + item.type,
            description: art(path.join(__dirname, 'templates/message.art'), {
                item,
            }),
        })),
    });
};
