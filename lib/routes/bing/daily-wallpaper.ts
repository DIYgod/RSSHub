import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:routeParams?',
    parameters: {
        routeParams: '额外参数type和story:请参阅以下说明和表格',
    },
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
    description: `| 参数    | 含义        | 接受的值                                                      | 默认值       | 备注                                                     |
|-------|-----------|-----------------------------------------------------------|-----------|--------------------------------------------------------|
| type  | 输出图片的像素类型 | UHD/1920x1080/1920x1200/768x1366/1080x1920/1080x1920_logo | 1920x1080 | 1920x1200与1080x1920_logo带有水印,输入的值不在接受范围内都会输出成1920x1080 |
| story | 是否输出图片的故事 | 1/0                                                       | 0         | 输入的值不为1都不会输出故事                                         |
`,
};

async function handler(ctx) {
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    let type = routeParams.get('type') || '1920x1080';
    const allowedTypes = ['UHD', '1920x1080', '1920x1200', '768x1366', '1080x1920', '1080x1920_logo'];
    if (!allowedTypes.includes(type)) {
        type = '1920x1080';
    }
    const story = routeParams.get('story') === '1';
    const apiUrl = 'https://cn.bing.com/hp/api/model';
    const resp = await ofetch(apiUrl, {
        method: 'GET',
    });
    const items = await Promise.all(
        resp.MediaContents.map((item) => {
            const ssd = item.Ssd;
            const link = `https://cn.bing.com${item.ImageContent.Image.Url.match(/\/th\?id=[^_]+_[^_]+/)[0].replace(/(_\d+x\d+\.webp)$/i, '')}_${type}.jpg`;
            let description = `<img src="${link}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
            if (story) {
                description += `<b>${item.ImageContent.Headline}</b>`;
                description += `<i>${item.ImageContent.QuickFact.MainText}</i><br>`;
                description += `<p>${item.ImageContent.Description}<p>`;
            }
            return {
                title: item.ImageContent.Title,
                description,
                link: `https://cn.bing.com${item.ImageContent.BackstageUrl}`,
                author: String(item.ImageContent.Copyright),
                pubDate: timezone(parseDate(ssd, 'YYYYMMDD_HHmm'), -8),
            };
        })
    );
    return {
        title: 'Bing每日壁纸',
        link: 'https://cn.bing.com/',
        description: 'Bing每日壁纸',
        item: items,
    };
}
