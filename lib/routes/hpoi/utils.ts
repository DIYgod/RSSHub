import got from '@/utils/got';
import { load } from 'cheerio';

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
    all: {
        url: `${host}/hobby/all?order={order}&r18=-1`,
        title: '全部周边',
    },
};

const ProcessFeed = async (type, id, order) => {
    const link = MAPs[type].url.replace(/{id}/, id).replace(/{order}/, order || 'add');
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = load(response.data);
    return {
        title: `Hpoi 手办维基 - ${MAPs[type].title}${id ? ` ${id}` : ''}`,
        link,
        item: $('.hpoi-glyphicons-list li')
            .map((_index, _item) => {
                _item = $(_item);
                return {
                    title: _item.find('.hpoi-detail-grid-title a').text(),
                    link: host + '/' + _item.find('a').attr('href'),
                    description: `<img src="${_item.find('img').attr('src').replace('/s/', '/n/')}">${_item.find('.hpoi-detail-grid-info').html().replaceAll('span>', 'p>')}`,
                };
            })
            .get(),
    };
};

export { ProcessFeed };
