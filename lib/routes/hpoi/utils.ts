import { load } from 'cheerio';

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
    let link = MAPs[type].url.replace(/{id}/, id).replace(/{order}/, order || 'add');
    let response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    let $ = load(response.data);

    if (type === 'work') {
        const overviewLink = MAPs.overview.url.replace(/{id}/, id);
        const overviewResponse = await got({
            method: 'get',
            url: overviewLink,
            headers: {
                Referer: host,
            },
        });
        const $overview = load(overviewResponse.data);

        const moreLink = $overview('.company-ibox a.hpoi-btn-border.hpoi-btn-more').attr('href');
        if (moreLink) {
            const worksId = moreLink.match(/modal\/taobao\/more\/(\d+)/)?.[1];
            if (worksId) {
                link = `${host}/hobby/all?order=${order || 'add'}&r18=-1&works=${worksId}`;
                response = await got({
                    method: 'get',
                    url: link,
                    headers: {
                        Referer: host,
                    },
                });
                $ = load(response.data);
            }
        }
    }

    return {
        title: `Hpoi 手办维基 - ${MAPs[type].title}${id ? ` ${id}` : ''}`,
        link,
        item: $('.hpoi-glyphicons-list li')
            .toArray()
            .map((_item) => {
                _item = $(_item);
                return {
                    title: _item.find('.hpoi-detail-grid-title a').text(),
                    link: host + '/' + _item.find('a').attr('href'),
                    description: `<img src="${_item.find('img').attr('src').replace('/s/', '/n/')}">${_item.find('.hpoi-detail-grid-info').html().replaceAll('span>', 'p>')}`,
                };
            }),
    };
};

export { ProcessFeed };
