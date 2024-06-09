import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:routeParams?',
    parameters: { type: '类型', story: '故事' },
    radar: [
        {
            source: ['cn.bing.com/'],
            target: '',
        },
    ],
    name: '每日壁纸',
    maintainers: ['FHYunCai', 'LLLLLFish'],
    handler,
    url: 'cn.bing.com/',
    example: '/bing/type=UHD&story=1',
    description: `
    type 壁纸的类型 取值为: UHD/1920x1080/1920x1200/768x1366/1080x1920/1080x1920_logo;默认值与输入的值不在范围内时设为1920x1080;1920x1200与1080x1920_logo会带有水印；
    story 壁纸对应的故事 取值为 1/0;默认值为0,即不输出壁纸对应的故事;
    `,
};

async function handler(ctx) {
    // type UHD 1920x1080 1920x1200 768x1366 1080x1920 1080x1920_logo
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const lang = 'zh-CN';
    let type = routeParams.get('type') || '1920x1080';
    const allowedTypes = ['UHD', '1920x1080', '1920x1200', '768x1366', '1080x1920', '1080x1920_logo'];
    if (!allowedTypes.includes(type)) {
        type = '1920x1080';
    }
    const story = routeParams.get('story') === '1';
    const api_url = `https://www.bing.com/hp/api/model`;
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    return {
        title: 'Bing每日壁纸',
        link: 'https://www.bing.com/',
        description: 'Bing每日壁纸',
        item: resp.data.MediaContents.map((item) => {
            const ssd = item.Ssd;
            const key = `bing_${ssd}_${lang}_${type}_${story}`;
            return cache.tryGet(key, () => {
                const link = `https://www.bing.com${item.ImageContent.Image.Url.match(/\/th\?id=[^_]+_[^_]+/)[0].replace(/(_\d+x\d+\.webp)$/i, '')}_${type}.jpg`;
                let description = `<img src="${link}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
                if (story) {
                    description += `<b>${item.ImageContent.Headline}</b><br><br>`;
                    description += `<i>${item.ImageContent.QuickFact.MainText}</i><br>`;
                    description += `<p>${item.ImageContent.Description}<p>`;
                }
                return {
                    title: item.ImageContent.Title,
                    description,
                    link: `https://www.bing.com${item.ImageContent.BackstageUrl}`,
                    author: String(item.ImageContent.Copyright),
                    pubDate: timezone(parseDate(ssd, 'YYYYMMDD_HHmm'), -8),
                };
            });
        }),
    };
}
