import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import got from '@/utils/got';

const host = 'https://www.hpoi.net';

const MAPs = {
    character: {
        url: `${host}/hobby/all?order={order}&r18=-1&charactar={id}`,
        title: '角色周边',
    },
    work: {
        url: `${host}/hobby/all?order={order}&r18=-1&works={id}`,
        title: '作品周边',
    },
    overview: {
        url: `${host}/works/{id}`,
        title: '周边总览',
    },
    all: {
        url: `${host}/hobby/all?order={order}&r18=-1`,
        title: '全部周边',
    },
};

const ProcessFeed = async (type, id, order) => {
    if (order && !['release', 'add', 'hits', 'hits7Day', 'hitsDay', 'rating'].includes(order)) {
        throw new InvalidParameterError('Invalid order: expected release, add, hits, hits7Day, hitsDay, or rating.');
    }
    if (type !== 'all' && !/^[1-9]\d*$/.test(id)) {
        throw new InvalidParameterError('Invalid id: expected a positive integer.');
    }
    const link = MAPs[type].url.replace(/\{id\}/, () => id).replace(/\{order\}/, () => order || 'add');
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);

    return {
        title: `Hpoi 手办维基 - ${MAPs[type].title}${id ? ` ${id}` : ''}`,
        link,
        item: $('.hpoi-glyphicons-list li')
            .toArray()
            .map((_item) => {
                const $_item = $(_item);
                return {
                    title: $_item.find('.hpoi-detail-grid-title a').text(),
                    link: new URL($_item.find('a').attr('href')!, link).href,
                    description: `<img src="${$_item.find('img').attr('src')!.replace('/s/', '/n/')}">${$_item.find('.hpoi-detail-grid-info').html()!.replaceAll('span>', 'p>')}`,
                };
            }),
    };
};

export { ProcessFeed };
