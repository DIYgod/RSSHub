import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/:city?/:type?/:query?',
    categories: ['other'],
    example: '/lianjia/bj/zufang/rs西山锦绣府',
    parameters: {
        city: '城市子域名',
        type: 'zufang',
        query: 'query',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lianjia.com/zufang'],
            target: '',
        },
    ],
    name: '链家',
    maintainers: ['sohow'],
    handler,
};

async function handler(ctx) {
    const { city = '', type = '', query = '' } = ctx.req.param();
    let items: any[] = [];

    // 处理query参数
    const queryArray = query ? query.split('_').filter(Boolean) : [''];

    // 生成所有参数组合
    const allCombinations: [string][] = [];
    for (const qu of queryArray) {
        allCombinations.push([qu]);
    }

    // 并发请求所有组合
    const promises = allCombinations.map(([qu]) => requestData(city, type, qu));

    // 等待所有请求完成并合并结果
    const results = await Promise.all(promises);
    items = results.flat();

    return {
        title: '链家',
        link: `https://bj.lianjia.com/zufang/rs%E8%A5%BF%E5%B1%B1%E9%94%A6%E7%BB%A3%E5%BA%9C/`,
        item: items,
    };
}

interface RentalInfo {
    title: string;
    link: string;
    region: string;
    area: string;
    community: string;
    size: string;
    direction: string;
    layout: string;
    floorInfo: string; // 新增楼层信息
    tags: string[];
    brand: string;
    price: string;
    lastUpdated: string;
    vrAvailable: boolean; // 新增VR标识
    sxzAvailable: boolean; // 新增省心租标识
    imageUrl: string; // 新增图片URL字段
}

function parseRentalList(html: string): RentalInfo[] {
    const $ = load(html);
    const rentals: RentalInfo[] = [];

    $('.content__list--item').each((index, element) => {
        const $item = $(element);

        // 提取标题和链接 - 添加默认值处理
        const titleLink = $item.find('.content__list--item--title a');
        const title = titleLink.text().trim() || '无标题';
        const link = titleLink.attr('href') || '#';

        // 提取图片URL - 新增功能
        const imageContainer = $item.find('.content__list--item--aside');
        let imageUrl = '';
        imageUrl = imageContainer.length ? (imageContainer.find('img.lazyload').length ? imageContainer.find('img.lazyload').attr('data-src') || imageContainer.find('img.lazyload').attr('src') || '' : '') : '';

        // 提取区域信息 - 使用更健壮的选择器
        const regionLinks = $item.find('.content__list--item--des a');
        const region = regionLinks.eq(0).text().trim() || '';
        const area = regionLinks.eq(1).text().trim() || '';
        const community = regionLinks.length > 2 ? regionLinks.eq(2).text().trim() : '';

        // 提取详细描述 - 处理隐藏的楼层信息
        const des = $item.find('.content__list--item--des');
        const size =
            des
                .contents()
                .filter((_, el) => el.nodeType === 3 && el.data?.includes('㎡'))
                .text()
                .trim()
                .split(' ')[0] || '';

        const direction =
            des
                .contents()
                .filter((_, el) => el.nodeType === 3 && /[东南西北]+/.test(el.data || ''))
                .text()
                .trim() || '';

        const layout =
            des
                .contents()
                .filter((_, el) => el.nodeType === 3 && /[0-9]室[0-9]厅/.test(el.data || ''))
                .text()
                .trim() || '';

        // 提取隐藏的楼层信息
        const floorInfo = des.find('span.hide').text().trim().replaceAll(/\s+/g, ' ') || '';

        // 修复标签提取 - 使用更准确的选择器
        const tags: string[] = [];
        $item.find('.content__list--item--bottom i').each((i, el) => {
            const tagText = $(el).text().trim();
            // 过滤空标签和特定类别的标签
            if (tagText && !['vr-logo', 'sxz-logo'].some((cls) => $(el).hasClass(cls))) {
                tags.push(tagText);
            }
        });

        // 提取品牌和更新时间 - 添加回退处理
        const brandEl = $item.find('.content__list--item--brand .brand');
        const brand = brandEl.text().trim() || brandEl.next().text().trim() || '';

        const lastUpdated = $item.find('.content__list--item--brand .content__list--item--time').text().trim().replaceAll(/\s+/g, ' ') || '';

        // 提取价格 - 处理无价格情况
        const priceEl = $item.find('.content__list--item-price em');
        const price = priceEl.length ? `${priceEl.text().trim()} 元/月` : '价格面议';

        // 提取特殊标识
        const vrAvailable = $item.find('.vr-logo').length > 0;
        const sxzAvailable = $item.find('.sxz-logo').length > 0;

        rentals.push({
            title,
            link,
            region,
            area,
            community,
            size,
            direction,
            layout,
            floorInfo,
            tags,
            brand,
            price,
            lastUpdated,
            vrAvailable,
            sxzAvailable,
            imageUrl,
        });
    });

    return rentals;
}

async function requestData(city: string, type: string, qu: string): Promise<any[]> {
    const baseUrl = `https://bj.lianjia.com`;
    const url = `${baseUrl}/zufang/rs${qu}`;

    const response = await ofetch(url, {
        method: 'GET',
        // headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        // },
        // body: new URLSearchParams(data),
    });
    const list = parseRentalList(response);

    // 从 API 响应中提取相关数据
    const items = list.map((item) => {
        const tags = item.tags.join(', ');
        return {
            title: item.title,
            link: `${baseUrl}${item.link}`,
            image: item.imageUrl,
            // pubDate: parseDate(pub.text()),
            author: item.community,
            description: `${item.community} 户型: ${item.layout} 面积: ${item.size} 价格: ${item.price} 朝向: ${item.direction} 楼层: ${item.floorInfo} tags: ${tags}`,
        };
    });

    return items;
}
