import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const rootUrl = 'https://kyfw.12306.cn';

async function getJSESSIONID(linkUrl) {
    const res = await got({
        method: 'get',
        url: linkUrl,
        headers: {
            UserAgent: config.ua,
            Referer: 'https://www.12306.cn/index/index.html',
        },
    });

    return res.headers['set-cookie'].join(',').match(/JSESSIONID=([^;]+);/)[0];
}

function getStationInfo(stationName) {
    return cache.tryGet(stationName, async () => {
        const res = await got({
            method: 'get',
            url: `${rootUrl}/otn/resources/js/framework/station_name.js`,
            headers: {
                UserAgent: config.ua,
                Referer: 'https://kyfw.12306.cn/otn/leftTicket/init',
            },
        });

        return res.data
            .split('@')
            .map((item) => {
                const itemData = item.split('|');

                return itemData.includes(stationName)
                    ? {
                          code: itemData[2],
                          name: itemData[1],
                      }
                    : null;
            })
            .find(Boolean);
    });
}

export const route: Route = {
    path: '/:date/:from/:to/:type?',
    categories: ['travel'],
    example: '/12306/2022-02-19/重庆/永川东',
    parameters: { date: '时间，格式为（YYYY-MM-DD）', from: '始发站', to: '终点站', type: '售票类型，成人和学生可选，默认为成人' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '售票信息',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const date = ctx.req.param('date');
    const fromStationInfo = await getStationInfo(ctx.req.param('from'));
    const toStationInfo = await getStationInfo(ctx.req.param('to'));
    const type = ctx.req.param('type') ?? 'ADULT';

    const apiUrl = `${rootUrl}/otn/leftTicket/queryA?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStationInfo.code}&leftTicketDTO.to_station=${toStationInfo.code}&purpose_codes=${type}`;
    const linkUrl = `${rootUrl}/otn/leftTicket/init?linktypeid=dc&fs=${fromStationInfo.code}&ts=${toStationInfo.code}&date=${date}&flag=N,N,Y`;

    const response = await got.get(apiUrl, {
        headers: {
            UserAgent: config.ua,
            Referer: 'https://kyfw.12306.cn/otn/leftTicket/init',
            Cookie: await getJSESSIONID(linkUrl),
        },
    });
    if (response.data.data === undefined || response.data.data.length === 0) {
        throw new InvalidParameterError('没有找到相关车次，请检查参数是否正确');
    }
    const data = response.data.data.result;
    const map = response.data.data.map;

    const items = data.map((item) => {
        const itemData = item.split('|');
        const trainInfo = {
            trainNo: itemData[3],
            fromStation: map[itemData[6]],
            toStation: map[itemData[7]],
            startTime: itemData[8],
            arriveTime: itemData[9],
            duration: itemData[10],
            today: itemData[11],
            A9: itemData[32],
            M: itemData[31],
            O: itemData[30],
            A6: itemData[29],
            A4: itemData[28],
            F: itemData[27],
            A3: itemData[26],
            A2: itemData[25],
            A1: itemData[24],
            WZ: itemData[23],
            QT: itemData[22],
        };

        return {
            title: `${trainInfo.fromStation} → ${trainInfo.toStation} ${trainInfo.startTime} ${trainInfo.arriveTime}`,
            description: art(path.join(__dirname, 'templates/train.art'), {
                trainInfo,
            }),
            link: linkUrl,
            guid: Object.values(trainInfo).join('|'),
        };
    });

    return {
        title: `${fromStationInfo.name} → ${toStationInfo.name} ${date}`,
        link: linkUrl,
        item: items,
    };
}
