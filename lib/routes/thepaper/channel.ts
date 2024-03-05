// @ts-nocheck
const utils = require('./utils');
import { load } from 'cheerio';
import got from '@/utils/got';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const channel_url = `https://m.thepaper.cn/channel/${id}`;
    const channel_url_resp = await got(channel_url);
    const channel_url_data = JSON.parse(load(channel_url_resp.data)('#__NEXT_DATA__').html());

    const resp = await got.post('https://api.thepaper.cn/contentapi/nodeCont/getByChannelId', {
        json: {
            channelId: id,
        },
    });
    const list = resp.data.data.list;

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    ctx.set('data', {
        title: `澎湃新闻频道 - ${utils.ChannelIdToName(id, channel_url_data)}`,
        link: channel_url,
        item: items,
        itunes_author: '澎湃新闻',
        image: utils.ExtractLogo(channel_url_resp),
    });
};
