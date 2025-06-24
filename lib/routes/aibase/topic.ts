import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

import { rootUrl, buildApiUrl, processItems } from './util';

export const handler = async (ctx) => {
    const { id, filter = 'id' } = ctx.req.param();

    const limit = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const currentUrl = new URL(id ? `topic/${id}` : 'discover', rootUrl).href;

    const currentHtml = await ofetch(currentUrl);

    const $ = load(currentHtml);

    const { apiTagProcUrl } = await buildApiUrl($);

    const {
        data: { results: apiTagProcs },
    } = await ofetch(apiTagProcUrl, {
        query: {
            ...(id ? { tag: id } : {}),
            page: 1,
            pagesize: 20,
            f: filter,
            o: 'desc',
            ticket: '',
        },
    });

    const items = processItems(apiTagProcs?.slice(0, limit) ?? []);

    const image = new URL($('img.logo').prop('src'), rootUrl).href;

    const author = $('title').text().split(/_/).pop();

    return {
        title: `${author}${id ? ` | ${id}` : ''}`,
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
    };
};

export const route: Route = {
    path: '/topic/:id?/:filter?',
    name: '标签',
    url: 'top.aibase.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/aibase/topic',
    parameters: { id: '标签，默认为空，即全部产品，可在对应标签页 URL 中找到', filter: '过滤器，默认为 `id` 即最新，可选 `pv` 即热门' },
    description: `::: tip
  若订阅 [AI](https://top.aibase.com/topic/AI)，网址为 \`https://top.aibase.com/topic/AI\`。截取 \`https://top.aibase.com/topic\` 到末尾的部分 \`AI\` 作为参数填入，此时路由为 [\`/aibase/topic/AI\`](https://rsshub.app/aibase/topic/AI)。
:::

::: tip
  此处查看 [全部标签](https://top.aibase.com/topic)
:::

<details>
<summary>更多标签</summary>

| [AI](https://top.aibase.com/topic/AI)                                                               | [人工智能](https://top.aibase.com/topic/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD)                       | [图像生成](https://top.aibase.com/topic/%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90)            | [自动化](https://top.aibase.com/topic/%E8%87%AA%E5%8A%A8%E5%8C%96)                       | [AI 助手](https://top.aibase.com/topic/AI%E5%8A%A9%E6%89%8B)                  |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [聊天机器人](https://top.aibase.com/topic/%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA)            | [个性化](https://top.aibase.com/topic/%E4%B8%AA%E6%80%A7%E5%8C%96)                                  | [社交媒体](https://top.aibase.com/topic/%E7%A4%BE%E4%BA%A4%E5%AA%92%E4%BD%93)            | [图像处理](https://top.aibase.com/topic/%E5%9B%BE%E5%83%8F%E5%A4%84%E7%90%86)            | [数据分析](https://top.aibase.com/topic/%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90) |
| [自然语言处理](https://top.aibase.com/topic/%E8%87%AA%E7%84%B6%E8%AF%AD%E8%A8%80%E5%A4%84%E7%90%86) | [聊天](https://top.aibase.com/topic/%E8%81%8A%E5%A4%A9)                                             | [机器学习](https://top.aibase.com/topic/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0)            | [教育](https://top.aibase.com/topic/%E6%95%99%E8%82%B2)                                  | [内容创作](https://top.aibase.com/topic/%E5%86%85%E5%AE%B9%E5%88%9B%E4%BD%9C) |
| [生产力](https://top.aibase.com/topic/%E7%94%9F%E4%BA%A7%E5%8A%9B)                                  | [设计](https://top.aibase.com/topic/%E8%AE%BE%E8%AE%A1)                                             | [ChatGPT](https://top.aibase.com/topic/ChatGPT)                                          | [创意](https://top.aibase.com/topic/%E5%88%9B%E6%84%8F)                                  | [开源](https://top.aibase.com/topic/%E5%BC%80%E6%BA%90)                       |
| [写作](https://top.aibase.com/topic/%E5%86%99%E4%BD%9C)                                             | [效率助手](https://top.aibase.com/topic/%E6%95%88%E7%8E%87%E5%8A%A9%E6%89%8B)                       | [学习](https://top.aibase.com/topic/%E5%AD%A6%E4%B9%A0)                                  | [插件](https://top.aibase.com/topic/%E6%8F%92%E4%BB%B6)                                  | [翻译](https://top.aibase.com/topic/%E7%BF%BB%E8%AF%91)                       |
| [团队协作](https://top.aibase.com/topic/%E5%9B%A2%E9%98%9F%E5%8D%8F%E4%BD%9C)                       | [SEO](https://top.aibase.com/topic/SEO)                                                             | [营销](https://top.aibase.com/topic/%E8%90%A5%E9%94%80)                                  | [内容生成](https://top.aibase.com/topic/%E5%86%85%E5%AE%B9%E7%94%9F%E6%88%90)            | [AI 技术](https://top.aibase.com/topic/AI%E6%8A%80%E6%9C%AF)                  |
| [AI 工具](https://top.aibase.com/topic/AI%E5%B7%A5%E5%85%B7)                                        | [智能助手](https://top.aibase.com/topic/%E6%99%BA%E8%83%BD%E5%8A%A9%E6%89%8B)                       | [深度学习](https://top.aibase.com/topic/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0)            | [多语言支持](https://top.aibase.com/topic/%E5%A4%9A%E8%AF%AD%E8%A8%80%E6%94%AF%E6%8C%81) | [视频](https://top.aibase.com/topic/%E8%A7%86%E9%A2%91)                       |
| [艺术](https://top.aibase.com/topic/%E8%89%BA%E6%9C%AF)                                             | [文本生成](https://top.aibase.com/topic/%E6%96%87%E6%9C%AC%E7%94%9F%E6%88%90)                       | [开发编程](https://top.aibase.com/topic/%E5%BC%80%E5%8F%91%E7%BC%96%E7%A8%8B)            | [协作](https://top.aibase.com/topic/%E5%8D%8F%E4%BD%9C)                                  | [语言模型](https://top.aibase.com/topic/%E8%AF%AD%E8%A8%80%E6%A8%A1%E5%9E%8B) |
| [工具](https://top.aibase.com/topic/%E5%B7%A5%E5%85%B7)                                             | [销售](https://top.aibase.com/topic/%E9%94%80%E5%94%AE)                                             | [生产力工具](https://top.aibase.com/topic/%E7%94%9F%E4%BA%A7%E5%8A%9B%E5%B7%A5%E5%85%B7) | [AI 写作](https://top.aibase.com/topic/AI%E5%86%99%E4%BD%9C)                             | [创作](https://top.aibase.com/topic/%E5%88%9B%E4%BD%9C)                       |
| [工作效率](https://top.aibase.com/topic/%E5%B7%A5%E4%BD%9C%E6%95%88%E7%8E%87)                       | [无代码](https://top.aibase.com/topic/%E6%97%A0%E4%BB%A3%E7%A0%81)                                  | [隐私保护](https://top.aibase.com/topic/%E9%9A%90%E7%A7%81%E4%BF%9D%E6%8A%A4)            | [视频编辑](https://top.aibase.com/topic/%E8%A7%86%E9%A2%91%E7%BC%96%E8%BE%91)            | [摘要](https://top.aibase.com/topic/%E6%91%98%E8%A6%81)                       |
| [多语言](https://top.aibase.com/topic/%E5%A4%9A%E8%AF%AD%E8%A8%80)                                  | [求职](https://top.aibase.com/topic/%E6%B1%82%E8%81%8C)                                             | [GPT](https://top.aibase.com/topic/GPT)                                                  | [音乐](https://top.aibase.com/topic/%E9%9F%B3%E4%B9%90)                                  | [视频创作](https://top.aibase.com/topic/%E8%A7%86%E9%A2%91%E5%88%9B%E4%BD%9C) |
| [设计工具](https://top.aibase.com/topic/%E8%AE%BE%E8%AE%A1%E5%B7%A5%E5%85%B7)                       | [搜索](https://top.aibase.com/topic/%E6%90%9C%E7%B4%A2)                                             | [写作工具](https://top.aibase.com/topic/%E5%86%99%E4%BD%9C%E5%B7%A5%E5%85%B7)            | [视频生成](https://top.aibase.com/topic/%E8%A7%86%E9%A2%91%E7%94%9F%E6%88%90)            | [招聘](https://top.aibase.com/topic/%E6%8B%9B%E8%81%98)                       |
| [代码生成](https://top.aibase.com/topic/%E4%BB%A3%E7%A0%81%E7%94%9F%E6%88%90)                       | [大型语言模型](https://top.aibase.com/topic/%E5%A4%A7%E5%9E%8B%E8%AF%AD%E8%A8%80%E6%A8%A1%E5%9E%8B) | [语音识别](https://top.aibase.com/topic/%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB)            | [编程](https://top.aibase.com/topic/%E7%BC%96%E7%A8%8B)                                  | [在线工具](https://top.aibase.com/topic/%E5%9C%A8%E7%BA%BF%E5%B7%A5%E5%85%B7) |
| [API](https://top.aibase.com/topic/API)                                                             | [趣味](https://top.aibase.com/topic/%E8%B6%A3%E5%91%B3)                                             | [客户支持](https://top.aibase.com/topic/%E5%AE%A2%E6%88%B7%E6%94%AF%E6%8C%81)            | [语音合成](https://top.aibase.com/topic/%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90)            | [图像](https://top.aibase.com/topic/%E5%9B%BE%E5%83%8F)                       |
| [电子商务](https://top.aibase.com/topic/%E7%94%B5%E5%AD%90%E5%95%86%E5%8A%A1)                       | [SEO 优化](https://top.aibase.com/topic/SEO%E4%BC%98%E5%8C%96)                                      | [AI 辅助](https://top.aibase.com/topic/AI%E8%BE%85%E5%8A%A9)                             | [AI 生成](https://top.aibase.com/topic/AI%E7%94%9F%E6%88%90)                             | [创作工具](https://top.aibase.com/topic/%E5%88%9B%E4%BD%9C%E5%B7%A5%E5%85%B7) |
| [免费](https://top.aibase.com/topic/%E5%85%8D%E8%B4%B9)                                             | [LinkedIn](https://top.aibase.com/topic/LinkedIn)                                                   | [博客](https://top.aibase.com/topic/%E5%8D%9A%E5%AE%A2)                                  | [写作助手](https://top.aibase.com/topic/%E5%86%99%E4%BD%9C%E5%8A%A9%E6%89%8B)            | [助手](https://top.aibase.com/topic/%E5%8A%A9%E6%89%8B)                       |
| [智能](https://top.aibase.com/topic/%E6%99%BA%E8%83%BD)                                             | [健康](https://top.aibase.com/topic/%E5%81%A5%E5%BA%B7)                                             | [多模态](https://top.aibase.com/topic/%E5%A4%9A%E6%A8%A1%E6%80%81)                       | [任务管理](https://top.aibase.com/topic/%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86)            | [电子邮件](https://top.aibase.com/topic/%E7%94%B5%E5%AD%90%E9%82%AE%E4%BB%B6) |
| [笔记](https://top.aibase.com/topic/%E7%AC%94%E8%AE%B0)                                             | [搜索引擎](https://top.aibase.com/topic/%E6%90%9C%E7%B4%A2%E5%BC%95%E6%93%8E)                       | [计算机视觉](https://top.aibase.com/topic/%E8%AE%A1%E7%AE%97%E6%9C%BA%E8%A7%86%E8%A7%89) | [社区](https://top.aibase.com/topic/%E7%A4%BE%E5%8C%BA)                                  | [效率](https://top.aibase.com/topic/%E6%95%88%E7%8E%87)                       |
| [知识管理](https://top.aibase.com/topic/%E7%9F%A5%E8%AF%86%E7%AE%A1%E7%90%86)                       | [LLM](https://top.aibase.com/topic/LLM)                                                             | [智能聊天](https://top.aibase.com/topic/%E6%99%BA%E8%83%BD%E8%81%8A%E5%A4%A9)            | [社交](https://top.aibase.com/topic/%E7%A4%BE%E4%BA%A4)                                  | [语言学习](https://top.aibase.com/topic/%E8%AF%AD%E8%A8%80%E5%AD%A6%E4%B9%A0) |
| [娱乐](https://top.aibase.com/topic/%E5%A8%B1%E4%B9%90)                                             | [简历](https://top.aibase.com/topic/%E7%AE%80%E5%8E%86)                                             | [OpenAI](https://top.aibase.com/topic/OpenAI)                                            | [客户服务](https://top.aibase.com/topic/%E5%AE%A2%E6%88%B7%E6%9C%8D%E5%8A%A1)            | [室内设计](https://top.aibase.com/topic/%E5%AE%A4%E5%86%85%E8%AE%BE%E8%AE%A1) |
</details>
    `,
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['top.aibase.com/topic/:id'],
            target: (params) => {
                const id = params.id;

                return `/topic${id ? `/${id}` : ''}`;
            },
        },
        {
            title: 'AI',
            source: ['top.aibase.com/topic/AI'],
            target: '/topic/AI',
        },
        {
            title: '人工智能',
            source: ['top.aibase.com/topic/%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD'],
            target: '/topic/人工智能',
        },
        {
            title: '图像生成',
            source: ['top.aibase.com/topic/%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90'],
            target: '/topic/图像生成',
        },
        {
            title: '自动化',
            source: ['top.aibase.com/topic/%E8%87%AA%E5%8A%A8%E5%8C%96'],
            target: '/topic/自动化',
        },
        {
            title: 'AI助手',
            source: ['top.aibase.com/topic/AI%E5%8A%A9%E6%89%8B'],
            target: '/topic/AI助手',
        },
        {
            title: '聊天机器人',
            source: ['top.aibase.com/topic/%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA'],
            target: '/topic/聊天机器人',
        },
        {
            title: '个性化',
            source: ['top.aibase.com/topic/%E4%B8%AA%E6%80%A7%E5%8C%96'],
            target: '/topic/个性化',
        },
        {
            title: '社交媒体',
            source: ['top.aibase.com/topic/%E7%A4%BE%E4%BA%A4%E5%AA%92%E4%BD%93'],
            target: '/topic/社交媒体',
        },
        {
            title: '图像处理',
            source: ['top.aibase.com/topic/%E5%9B%BE%E5%83%8F%E5%A4%84%E7%90%86'],
            target: '/topic/图像处理',
        },
        {
            title: '数据分析',
            source: ['top.aibase.com/topic/%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90'],
            target: '/topic/数据分析',
        },
        {
            title: '自然语言处理',
            source: ['top.aibase.com/topic/%E8%87%AA%E7%84%B6%E8%AF%AD%E8%A8%80%E5%A4%84%E7%90%86'],
            target: '/topic/自然语言处理',
        },
        {
            title: '聊天',
            source: ['top.aibase.com/topic/%E8%81%8A%E5%A4%A9'],
            target: '/topic/聊天',
        },
        {
            title: '机器学习',
            source: ['top.aibase.com/topic/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0'],
            target: '/topic/机器学习',
        },
        {
            title: '教育',
            source: ['top.aibase.com/topic/%E6%95%99%E8%82%B2'],
            target: '/topic/教育',
        },
        {
            title: '内容创作',
            source: ['top.aibase.com/topic/%E5%86%85%E5%AE%B9%E5%88%9B%E4%BD%9C'],
            target: '/topic/内容创作',
        },
        {
            title: '生产力',
            source: ['top.aibase.com/topic/%E7%94%9F%E4%BA%A7%E5%8A%9B'],
            target: '/topic/生产力',
        },
        {
            title: '设计',
            source: ['top.aibase.com/topic/%E8%AE%BE%E8%AE%A1'],
            target: '/topic/设计',
        },
        {
            title: 'ChatGPT',
            source: ['top.aibase.com/topic/ChatGPT'],
            target: '/topic/ChatGPT',
        },
        {
            title: '创意',
            source: ['top.aibase.com/topic/%E5%88%9B%E6%84%8F'],
            target: '/topic/创意',
        },
        {
            title: '开源',
            source: ['top.aibase.com/topic/%E5%BC%80%E6%BA%90'],
            target: '/topic/开源',
        },
        {
            title: '写作',
            source: ['top.aibase.com/topic/%E5%86%99%E4%BD%9C'],
            target: '/topic/写作',
        },
        {
            title: '效率助手',
            source: ['top.aibase.com/topic/%E6%95%88%E7%8E%87%E5%8A%A9%E6%89%8B'],
            target: '/topic/效率助手',
        },
        {
            title: '学习',
            source: ['top.aibase.com/topic/%E5%AD%A6%E4%B9%A0'],
            target: '/topic/学习',
        },
        {
            title: '插件',
            source: ['top.aibase.com/topic/%E6%8F%92%E4%BB%B6'],
            target: '/topic/插件',
        },
        {
            title: '翻译',
            source: ['top.aibase.com/topic/%E7%BF%BB%E8%AF%91'],
            target: '/topic/翻译',
        },
        {
            title: '团队协作',
            source: ['top.aibase.com/topic/%E5%9B%A2%E9%98%9F%E5%8D%8F%E4%BD%9C'],
            target: '/topic/团队协作',
        },
        {
            title: 'SEO',
            source: ['top.aibase.com/topic/SEO'],
            target: '/topic/SEO',
        },
        {
            title: '营销',
            source: ['top.aibase.com/topic/%E8%90%A5%E9%94%80'],
            target: '/topic/营销',
        },
        {
            title: '内容生成',
            source: ['top.aibase.com/topic/%E5%86%85%E5%AE%B9%E7%94%9F%E6%88%90'],
            target: '/topic/内容生成',
        },
        {
            title: 'AI技术',
            source: ['top.aibase.com/topic/AI%E6%8A%80%E6%9C%AF'],
            target: '/topic/AI技术',
        },
        {
            title: 'AI工具',
            source: ['top.aibase.com/topic/AI%E5%B7%A5%E5%85%B7'],
            target: '/topic/AI工具',
        },
        {
            title: '智能助手',
            source: ['top.aibase.com/topic/%E6%99%BA%E8%83%BD%E5%8A%A9%E6%89%8B'],
            target: '/topic/智能助手',
        },
        {
            title: '深度学习',
            source: ['top.aibase.com/topic/%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0'],
            target: '/topic/深度学习',
        },
        {
            title: '多语言支持',
            source: ['top.aibase.com/topic/%E5%A4%9A%E8%AF%AD%E8%A8%80%E6%94%AF%E6%8C%81'],
            target: '/topic/多语言支持',
        },
        {
            title: '视频',
            source: ['top.aibase.com/topic/%E8%A7%86%E9%A2%91'],
            target: '/topic/视频',
        },
        {
            title: '艺术',
            source: ['top.aibase.com/topic/%E8%89%BA%E6%9C%AF'],
            target: '/topic/艺术',
        },
        {
            title: '文本生成',
            source: ['top.aibase.com/topic/%E6%96%87%E6%9C%AC%E7%94%9F%E6%88%90'],
            target: '/topic/文本生成',
        },
        {
            title: '开发编程',
            source: ['top.aibase.com/topic/%E5%BC%80%E5%8F%91%E7%BC%96%E7%A8%8B'],
            target: '/topic/开发编程',
        },
        {
            title: '协作',
            source: ['top.aibase.com/topic/%E5%8D%8F%E4%BD%9C'],
            target: '/topic/协作',
        },
        {
            title: '语言模型',
            source: ['top.aibase.com/topic/%E8%AF%AD%E8%A8%80%E6%A8%A1%E5%9E%8B'],
            target: '/topic/语言模型',
        },
        {
            title: '工具',
            source: ['top.aibase.com/topic/%E5%B7%A5%E5%85%B7'],
            target: '/topic/工具',
        },
        {
            title: '销售',
            source: ['top.aibase.com/topic/%E9%94%80%E5%94%AE'],
            target: '/topic/销售',
        },
        {
            title: '生产力工具',
            source: ['top.aibase.com/topic/%E7%94%9F%E4%BA%A7%E5%8A%9B%E5%B7%A5%E5%85%B7'],
            target: '/topic/生产力工具',
        },
        {
            title: 'AI写作',
            source: ['top.aibase.com/topic/AI%E5%86%99%E4%BD%9C'],
            target: '/topic/AI写作',
        },
        {
            title: '创作',
            source: ['top.aibase.com/topic/%E5%88%9B%E4%BD%9C'],
            target: '/topic/创作',
        },
        {
            title: '工作效率',
            source: ['top.aibase.com/topic/%E5%B7%A5%E4%BD%9C%E6%95%88%E7%8E%87'],
            target: '/topic/工作效率',
        },
        {
            title: '无代码',
            source: ['top.aibase.com/topic/%E6%97%A0%E4%BB%A3%E7%A0%81'],
            target: '/topic/无代码',
        },
        {
            title: '隐私保护',
            source: ['top.aibase.com/topic/%E9%9A%90%E7%A7%81%E4%BF%9D%E6%8A%A4'],
            target: '/topic/隐私保护',
        },
        {
            title: '视频编辑',
            source: ['top.aibase.com/topic/%E8%A7%86%E9%A2%91%E7%BC%96%E8%BE%91'],
            target: '/topic/视频编辑',
        },
        {
            title: '摘要',
            source: ['top.aibase.com/topic/%E6%91%98%E8%A6%81'],
            target: '/topic/摘要',
        },
        {
            title: '多语言',
            source: ['top.aibase.com/topic/%E5%A4%9A%E8%AF%AD%E8%A8%80'],
            target: '/topic/多语言',
        },
        {
            title: '求职',
            source: ['top.aibase.com/topic/%E6%B1%82%E8%81%8C'],
            target: '/topic/求职',
        },
        {
            title: 'GPT',
            source: ['top.aibase.com/topic/GPT'],
            target: '/topic/GPT',
        },
        {
            title: '音乐',
            source: ['top.aibase.com/topic/%E9%9F%B3%E4%B9%90'],
            target: '/topic/音乐',
        },
        {
            title: '视频创作',
            source: ['top.aibase.com/topic/%E8%A7%86%E9%A2%91%E5%88%9B%E4%BD%9C'],
            target: '/topic/视频创作',
        },
        {
            title: '设计工具',
            source: ['top.aibase.com/topic/%E8%AE%BE%E8%AE%A1%E5%B7%A5%E5%85%B7'],
            target: '/topic/设计工具',
        },
        {
            title: '搜索',
            source: ['top.aibase.com/topic/%E6%90%9C%E7%B4%A2'],
            target: '/topic/搜索',
        },
        {
            title: '写作工具',
            source: ['top.aibase.com/topic/%E5%86%99%E4%BD%9C%E5%B7%A5%E5%85%B7'],
            target: '/topic/写作工具',
        },
        {
            title: '视频生成',
            source: ['top.aibase.com/topic/%E8%A7%86%E9%A2%91%E7%94%9F%E6%88%90'],
            target: '/topic/视频生成',
        },
        {
            title: '招聘',
            source: ['top.aibase.com/topic/%E6%8B%9B%E8%81%98'],
            target: '/topic/招聘',
        },
        {
            title: '代码生成',
            source: ['top.aibase.com/topic/%E4%BB%A3%E7%A0%81%E7%94%9F%E6%88%90'],
            target: '/topic/代码生成',
        },
        {
            title: '大型语言模型',
            source: ['top.aibase.com/topic/%E5%A4%A7%E5%9E%8B%E8%AF%AD%E8%A8%80%E6%A8%A1%E5%9E%8B'],
            target: '/topic/大型语言模型',
        },
        {
            title: '语音识别',
            source: ['top.aibase.com/topic/%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB'],
            target: '/topic/语音识别',
        },
        {
            title: '编程',
            source: ['top.aibase.com/topic/%E7%BC%96%E7%A8%8B'],
            target: '/topic/编程',
        },
        {
            title: '在线工具',
            source: ['top.aibase.com/topic/%E5%9C%A8%E7%BA%BF%E5%B7%A5%E5%85%B7'],
            target: '/topic/在线工具',
        },
        {
            title: 'API',
            source: ['top.aibase.com/topic/API'],
            target: '/topic/API',
        },
        {
            title: '趣味',
            source: ['top.aibase.com/topic/%E8%B6%A3%E5%91%B3'],
            target: '/topic/趣味',
        },
        {
            title: '客户支持',
            source: ['top.aibase.com/topic/%E5%AE%A2%E6%88%B7%E6%94%AF%E6%8C%81'],
            target: '/topic/客户支持',
        },
        {
            title: '语音合成',
            source: ['top.aibase.com/topic/%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90'],
            target: '/topic/语音合成',
        },
        {
            title: '图像',
            source: ['top.aibase.com/topic/%E5%9B%BE%E5%83%8F'],
            target: '/topic/图像',
        },
        {
            title: '电子商务',
            source: ['top.aibase.com/topic/%E7%94%B5%E5%AD%90%E5%95%86%E5%8A%A1'],
            target: '/topic/电子商务',
        },
        {
            title: 'SEO优化',
            source: ['top.aibase.com/topic/SEO%E4%BC%98%E5%8C%96'],
            target: '/topic/SEO优化',
        },
        {
            title: 'AI辅助',
            source: ['top.aibase.com/topic/AI%E8%BE%85%E5%8A%A9'],
            target: '/topic/AI辅助',
        },
        {
            title: 'AI生成',
            source: ['top.aibase.com/topic/AI%E7%94%9F%E6%88%90'],
            target: '/topic/AI生成',
        },
        {
            title: '创作工具',
            source: ['top.aibase.com/topic/%E5%88%9B%E4%BD%9C%E5%B7%A5%E5%85%B7'],
            target: '/topic/创作工具',
        },
        {
            title: '免费',
            source: ['top.aibase.com/topic/%E5%85%8D%E8%B4%B9'],
            target: '/topic/免费',
        },
        {
            title: 'LinkedIn',
            source: ['top.aibase.com/topic/LinkedIn'],
            target: '/topic/LinkedIn',
        },
        {
            title: '博客',
            source: ['top.aibase.com/topic/%E5%8D%9A%E5%AE%A2'],
            target: '/topic/博客',
        },
        {
            title: '写作助手',
            source: ['top.aibase.com/topic/%E5%86%99%E4%BD%9C%E5%8A%A9%E6%89%8B'],
            target: '/topic/写作助手',
        },
        {
            title: '助手',
            source: ['top.aibase.com/topic/%E5%8A%A9%E6%89%8B'],
            target: '/topic/助手',
        },
        {
            title: '智能',
            source: ['top.aibase.com/topic/%E6%99%BA%E8%83%BD'],
            target: '/topic/智能',
        },
        {
            title: '健康',
            source: ['top.aibase.com/topic/%E5%81%A5%E5%BA%B7'],
            target: '/topic/健康',
        },
        {
            title: '多模态',
            source: ['top.aibase.com/topic/%E5%A4%9A%E6%A8%A1%E6%80%81'],
            target: '/topic/多模态',
        },
        {
            title: '任务管理',
            source: ['top.aibase.com/topic/%E4%BB%BB%E5%8A%A1%E7%AE%A1%E7%90%86'],
            target: '/topic/任务管理',
        },
        {
            title: '电子邮件',
            source: ['top.aibase.com/topic/%E7%94%B5%E5%AD%90%E9%82%AE%E4%BB%B6'],
            target: '/topic/电子邮件',
        },
        {
            title: '笔记',
            source: ['top.aibase.com/topic/%E7%AC%94%E8%AE%B0'],
            target: '/topic/笔记',
        },
        {
            title: '搜索引擎',
            source: ['top.aibase.com/topic/%E6%90%9C%E7%B4%A2%E5%BC%95%E6%93%8E'],
            target: '/topic/搜索引擎',
        },
        {
            title: '计算机视觉',
            source: ['top.aibase.com/topic/%E8%AE%A1%E7%AE%97%E6%9C%BA%E8%A7%86%E8%A7%89'],
            target: '/topic/计算机视觉',
        },
        {
            title: '社区',
            source: ['top.aibase.com/topic/%E7%A4%BE%E5%8C%BA'],
            target: '/topic/社区',
        },
        {
            title: '效率',
            source: ['top.aibase.com/topic/%E6%95%88%E7%8E%87'],
            target: '/topic/效率',
        },
        {
            title: '知识管理',
            source: ['top.aibase.com/topic/%E7%9F%A5%E8%AF%86%E7%AE%A1%E7%90%86'],
            target: '/topic/知识管理',
        },
        {
            title: 'LLM',
            source: ['top.aibase.com/topic/LLM'],
            target: '/topic/LLM',
        },
        {
            title: '智能聊天',
            source: ['top.aibase.com/topic/%E6%99%BA%E8%83%BD%E8%81%8A%E5%A4%A9'],
            target: '/topic/智能聊天',
        },
        {
            title: '社交',
            source: ['top.aibase.com/topic/%E7%A4%BE%E4%BA%A4'],
            target: '/topic/社交',
        },
        {
            title: '语言学习',
            source: ['top.aibase.com/topic/%E8%AF%AD%E8%A8%80%E5%AD%A6%E4%B9%A0'],
            target: '/topic/语言学习',
        },
        {
            title: '娱乐',
            source: ['top.aibase.com/topic/%E5%A8%B1%E4%B9%90'],
            target: '/topic/娱乐',
        },
        {
            title: '简历',
            source: ['top.aibase.com/topic/%E7%AE%80%E5%8E%86'],
            target: '/topic/简历',
        },
        {
            title: 'OpenAI',
            source: ['top.aibase.com/topic/OpenAI'],
            target: '/topic/OpenAI',
        },
        {
            title: '客户服务',
            source: ['top.aibase.com/topic/%E5%AE%A2%E6%88%B7%E6%9C%8D%E5%8A%A1'],
            target: '/topic/客户服务',
        },
        {
            title: '室内设计',
            source: ['top.aibase.com/topic/%E5%AE%A4%E5%86%85%E8%AE%BE%E8%AE%A1'],
            target: '/topic/室内设计',
        },
    ],
};
