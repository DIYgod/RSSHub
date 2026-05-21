import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import utils from './utils';

type FixedChannelConfig = {
    path: string;
    id: string;
    name: string;
    source: string;
};

export const createFixedChannelRoute = ({ path, id, name, source }: FixedChannelConfig): Route => ({
    path,
    categories: ['new-media'],
    example: `/thepaper${path}`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name,
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: [source],
            target: path,
        },
    ],
    handler: async (ctx) => {
        const channelUrl = `https://m.thepaper.cn/channel/${id}`;
        const channelUrlResp = await ofetch(channelUrl);
        const $ = load(channelUrlResp.data);
        const nextData = $('#__NEXT_DATA__').text();
        const channelUrlData = JSON.parse(nextData);

        const resp = await ofetch('https://api.thepaper.cn/contentapi/nodeCont/getByChannelId', {
            method: 'POST',
            body: {
                channelId: id,
            },
        });
        const list = resp.data.list;

        const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
        return {
            title: `\u6f8e\u6e43\u65b0\u95fb - ${utils.ChannelIdToName(id, channelUrlData)}`,
            link: `https://www.thepaper.cn/channel_${id}`,
            item: items,
            itunes_author: '\u6f8e\u6e43\u65b0\u95fb',
            image: utils.ExtractLogo(channelUrlResp),
        };
    },
});
