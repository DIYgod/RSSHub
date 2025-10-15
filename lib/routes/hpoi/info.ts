import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/info/:type?/:catType?',
    categories: ['anime'],
    example: '/hpoi/info/all/hobby|model',
    parameters: {
        type: {
            description: '情报类型',
            options: [
                { value: 'all', label: '全部' },
                { value: 'confirm', label: '制作' },
                { value: 'official_pic', label: '官图更新' },
                { value: 'preorder', label: '开订' },
                { value: 'delay', label: '延期' },
                { value: 'release', label: '出荷' },
                { value: 'reorder', label: '再版' },
                { value: 'hobby', label: '手办(拟废弃, 无效果)' },
                { value: 'model', label: '动漫模型(拟废弃, 无效果)' },
            ],
            default: 'all',
        },
        catType: {
            description: '手办分类过滤, 使用|分割, 支持的分类见下表',
            default: 'all',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '情报',
    maintainers: ['sanmmm DIYgod'],
    description: `::: tip
  情报类型中的*手办*、*模型*只是为了兼容, 实际效果等同于**全部**, 如果只需要**手办**类型的情报, 可以使用参数*catType*, e.g. /hpoi/info/all/hobby
:::

|  手办   | 动漫模型 | 真实模型 | 毛绒布偶 | doll娃娃 | GK/其他 |
| ------ | ------- | ------- | ------- | ------- | ------ |
| hobby  |  model  |  real   | moppet  |  doll   | gkdiy  |`,
    handler,
};

async function handler(ctx) {
    const { type = 'all', catType = 'all' } = ctx.req.param();
    const baseUrl = 'https://www.hpoi.net';
    const reqUrl = `${baseUrl}/user/home/ajax`;

    const classMap = {
        all: '全部',
        hobby: '手办',
        model: '动漫模型',
        real: '真实模型',
        moppet: '毛绒布偶',
        doll: 'doll娃娃',
        gkdiy: 'GK/其他',
    };

    const filterArr = catType.split('|').toSorted();

    const filterSet = new Set(filterArr.map((e: string) => classMap[e]));
    if (catType.includes('all')) {
        filterSet.clear();
    }

    let finalType = type;
    if (['hobby', 'model'].includes(type)) {
        finalType = 'all';
    }

    const url = `${reqUrl}?page=1&type=info&subType=${finalType}`;
    const response = await got.post(url);

    const $ = load(response.data);

    const items = $('.home-info')
        .toArray()
        .map((ele) => {
            const $item = load(ele);
            const leftNode = $item('.overlay-container');
            const relativeLink = leftNode.find('a').first().attr('href');
            const typeName = leftNode.find('.type-name').first().text().trim();
            const imgUrl = leftNode.find('img').first().attr('src');
            const rightNode = $item('.home-info-content');
            const infoType = rightNode.find('.user-name').contents()[0].data.trim();
            const infoTitle = rightNode.find('.user-content').text();
            const infoTime = rightNode.find('.type-time').text();
            return {
                title: infoTitle,
                pubDate: parseRelativeDate(infoTime),
                link: `${baseUrl}/${relativeLink}`,
                category: infoType,
                typeName,
                description: [`类型:${typeName}`, infoTitle, `更新内容: ${infoType}`, `<img src="${imgUrl}"/>`].join('<br/>'),
            };
        });

    const items2 = filterSet.size > 0 ? items.filter((e) => filterSet.has(e.typeName)) : items;

    const typeToLabel = {
        all: '全部',
        confirm: '制作',
        official_pic: '官图更新',
        preorder: '开订',
        delay: '延期',
        release: '出荷',
        reorder: '再版',
    };
    const title = `手办维基 - 情报 - ${typeToLabel[finalType]}`;
    const catTypeName = filterSet.size > 0 ? filterArr.join('|') : 'all';
    return {
        title,
        link: `${baseUrl}/user/home?type=info&subType=${type}&catType=${catTypeName}`,
        description: title,
        item: items2,
        allowEmpty: true,
    };
}
