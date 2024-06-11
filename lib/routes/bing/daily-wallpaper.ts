import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:routeParams?',
    parameters: {
        routeParams: '额外参数type,story和lang:请参阅以下说明和表格',
    },
    radar: [
        {
            source: ['www.bing.com/', 'cn.bing.com/'],
            target: '',
        },
    ],
    name: '每日壁纸',
    maintainers: ['FHYunCai', 'LLLLLFish'],
    handler,
    url: 'www.bing.com/',
    example: '/bing/type=UHD&story=1&lang=zh-CN',
    description: `| 参数    | 含义                 | 接受的值                                                      | 默认值       | 备注                                                     |
|-------|--------------------|-----------------------------------------------------------|-----------|--------------------------------------------------------|
| type  | 输出壁纸的像素类型          | UHD/1920x1080/1920x1200/768x1366/1080x1920/1080x1920_logo | 1920x1080 | 1920x1200与1080x1920_logo带有水印,输入的值不在接受范围内都会输出成1920x1080 |
| story | 是否输出壁纸的故事          | 1/0                                                       | 0         | 输入的值不为1都不会输出故事                                         |
| lang  | 输出壁纸图文的地区(中文或者是英文) | zh/en                                               | zh     | zh/en输出的壁纸图文不一定是一样的;如果en不生效,试着部署到其他地方               |
`,
};

async function handler(ctx) {
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    let type = routeParams.get('type') || '1920x1080';
    let lang = routeParams.get('lang');
    let apiUrl = '';
    const allowedTypes = ['UHD', '1920x1080', '1920x1200', '768x1366', '1080x1920', '1080x1920_logo'];
    if (lang !== 'zh' && lang !== 'en') {
        lang = 'zh';
    }
    if (lang === 'zh') {
        lang = 'zh-CN';
        apiUrl = 'https://cn.bing.com';
    } else {
        lang = 'en-US';
        apiUrl = 'https://www.bing.com';
    }
    if (!allowedTypes.includes(type)) {
        type = '1920x1080';
    }
    const story = routeParams.get('story') === '1';
    const resp = await ofetch('/hp/api/model', {
        baseURL: apiUrl,
        method: 'GET',
        query: {
            mtk: lang,
        },
    });
    const items = resp.MediaContents.map((item) => {
        const ssd = item.Ssd;
        const link = `${apiUrl}${item.ImageContent.Image.Url.match(/\/th\?id=[^_]+_[^_]+/)[0].replace(/(_\d+x\d+\.webp)$/i, '')}_${type}.jpg`;
        let description = `<img src="${link}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
        if (story) {
            description += `<b>${item.ImageContent.Headline}</b>`;
            description += `<i>${item.ImageContent.QuickFact.MainText}</i><br>`;
            description += `<p>${item.ImageContent.Description}<p>`;
        }
        return {
            title: item.ImageContent.Title,
            description,
            link: `${apiUrl}${item.ImageContent.BackstageUrl}`,
            author: item.ImageContent.Copyright,
            pubDate: timezone(parseDate(ssd, 'YYYYMMDD_HHmm'), 0),
        };
    });
    return {
        title: 'Bing每日壁纸',
        link: apiUrl,
        description: 'Bing每日壁纸',
        item: items,
    };
}
