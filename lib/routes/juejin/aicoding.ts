import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getTagList, parseList, ProcessFeed } from './utils';
import { Tag } from './types';

export const route: Route = {
    path: '/aicoding/:tag?/:sort?',
    categories: ['programming'],
    example: '/juejin/aicoding',
    parameters: {
        tag: {
            description: '标签，留空为全部',
            options: [
                { value: 'AI编程', label: 'AI编程' },
                { value: 'Claude', label: 'Claude' },
                { value: 'Trae', label: 'Trae' },
                { value: 'MCP', label: 'MCP' },
                { value: 'Cursor', label: 'Cursor' },
                { value: 'Cline', label: 'Cline' },
                { value: 'Github Copilot', label: 'Github Copilot' },
                { value: 'bolt', label: 'bolt' },
                { value: 'V0', label: 'V0' },
                { value: 'replit', label: 'replit' },
                { value: 'Warp', label: 'Warp' },
                { value: 'Visual Studio IntelliCode', label: 'Visual Studio IntelliCode' },
                { value: 'WindSurf', label: 'WindSurf' },
                { value: '豆包MarsCode', label: '豆包MarsCode' },
                { value: '通义灵码', label: '通义灵码' },
                { value: 'Devin', label: 'Devin' },
                { value: '文心快码', label: '文心快码' },
                { value: 'imgcook', label: 'imgcook' },
                { value: 'CodeWhisperer', label: 'CodeWhisperer' },
                { value: 'Lovable', label: 'Lovable' },
                { value: 'FittenCode', label: 'FittenCode' },
                { value: 'Solo', label: 'Solo' },
                { value: 'CodeFuse', label: 'CodeFuse' },
                { value: 'Tabnine', label: 'Tabnine' },
            ],
        },
        sort: {
            description: '排序方式，默认为最新发布',
            default: 'hot',
            options: [
                { value: 'hot', label: '热门' },
                { value: 'latest', label: '最新' },
            ],
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
    radar: [
        {
            source: ['juejin.cn/books'],
        },
    ],
    name: 'AI 编程',
    maintainers: ['TonyRL'],
    handler,
    url: 'aicoding.juejin.cn',
};

async function handler(ctx) {
    const { tag, sort } = ctx.req.param();
    const sortType = sort === 'hot' ? 1 : 2;
    let tagList: {
            tag_id: string;
            tag: Tag;
        }[],
        currentTag: Tag | undefined,
        tagId: string | undefined;
    if (tag) {
        tagList = await getTagList();
        currentTag = tagList.find((item) => item.tag.tag_name === tag)?.tag;
        tagId = currentTag?.tag_id;
    }

    const response = await ofetch('https://api.juejin.cn/content_api/v1/aicoding/content', {
        method: 'POST',
        body: {
            sort_type: sortType,
            cursor: '',
            limit: 10,
            tag_ids: tagId ? [tagId] : undefined,
        },
    });

    const list = parseList(response.data.map((item) => item.article_pack || item.short_msg_pack));
    const items = await ProcessFeed(list);

    return {
        title: `${currentTag ? `${currentTag.tag_name} - ` : ''}AI 编程`,
        link: `https://aicoding.juejin.cn/?contentType=${sortType}${tagId ? `&tagId=${tagId}` : ''}`,
        image: currentTag ? currentTag.icon : 'https://lf-web-assets.juejin.cn/obj/juejin-web/goofy_deploy_edenx/toutiao-fe/xitu_juejin_aicoding/favicon.ico',
        item: items,
    };
}
