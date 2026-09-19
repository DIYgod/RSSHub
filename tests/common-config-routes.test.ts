import type { Context } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Data, Route } from '../lib/types';

const mocks = vi.hoisted(() => ({ raw: vi.fn(), get: vi.fn() }));
vi.mock('../lib/utils/ofetch', () => ({ default: Object.assign(vi.fn(), { raw: mocks.raw }) }));
vi.mock('../lib/utils/got', () => ({ default: mocks.get }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: (_key: string, load: () => unknown) => load() } }));
vi.mock('../lib/routes/weibo/utils', () => ({ default: { sinaimgTvax: (data: Data) => data } }));

const fixtures = [
    {
        name: 'government policy library',
        module: () => import('../lib/routes/gov/zhengce/zhengceku'),
        params: { department: 'bmwj' },
        html: '<div class="channel_tab"><div class="noline"><a>部门文件</a></div></div><div class="news_box"><div class="list"><ul><li><h4><a href="/policy">政策正文</a><span class="date">2025-01-01</span></h4></li><li class="line">separator</li></ul></div></div>',
        title: '部门文件 - 政府文件库',
        item: { title: '政策正文', link: '/policy', pubDate: new Date('2025-01-01T00:00:00Z') },
    },
    {
        name: 'Polimi',
        module: () => import('../lib/routes/polimi/news'),
        params: { language: 'en' },
        html: '<article class="card--editorial-photo"><div class="card-title">News</div><div class="card-footer"><a href="/story">Read</a></div><div class="news-bodytext"><b>Body</b></div><time datetime="2025-01-01T00:00:00Z"></time></article>',
        title: 'Polimi News',
        item: { title: 'News', link: 'https://www.polimi.it/story', description: '<b>Body</b>', pubDate: new Date('2025-01-01T00:00:00Z') },
    },
    {
        name: 'Jewish Museum',
        module: () => import('../lib/routes/jewishmuseum/exhibitions'),
        html: '<section id="current"><article class="exhibition"><a href="/show"><h3>Exhibition</h3></a></article></section>',
        title: 'Jewish Museums - Exhibitions',
        item: { title: 'Exhibition', link: '/show' },
    },
    {
        name: 'Brooklyn Museum',
        module: () => import('../lib/routes/brooklynmuseum/exhibitions'),
        html: '<div class="exhibitions"><article class="image-card"><h2><a href="/show">Exhibition</a></h2><h6>Description</h6></article></div>',
        title: 'Brooklyn Museum - Exhibitions',
        item: { title: 'Exhibition', link: '/show', description: 'Description' },
    },
    {
        name: 'New Museum',
        module: () => import('../lib/routes/newmuseum/exhibitions'),
        html: '<div class="exh"><a href="/show"><span class="title">Exhibition</span></a><div class="body-reveal">Description</div></div>',
        title: 'New Museum - Exhibitions',
        item: { title: 'Exhibition', link: '/show', description: 'Description' },
    },
    {
        name: 'Stratechery',
        module: () => import('../lib/routes/stratechery/index'),
        html: '<article><header><h1><a href="/post">Post</a></h1></header><time class="entry-date" datetime="2025-01-01T00:00:00Z"></time><div class="entry-content"><p>100% growth</p></div></article>',
        title: 'Stratechery by Ben Thompson',
        item: { title: 'Post', link: '/post', description: '<p>100&percnt; growth</p>', pubDate: new Date('2025-01-01T00:00:00Z') },
    },
    {
        name: 'Queshu book',
        module: () => import('../lib/routes/queshu/book'),
        params: { bookid: '123' },
        html: '<div id="book_left"><h1 id="h1">Book</h1></div><div id="detail_intro"><div class="detail_body">Description</div></div><div class="stacked right_state"><a href="/sale"><div class="right_item"><div class="bodycol_258">Offer</div></div></a></div>',
        title: 'Book - 单品活动信息 - 缺书网',
        item: { title: 'Offer', link: 'http://www.queshu.com/sale' },
    },
    {
        name: 'Queshu sale',
        module: () => import('../lib/routes/queshu/sale'),
        html: '<table id="tb_sale"><tr><td class="news_sale_title"><a href="/book">Book</a></td><td class="news_sale_detail"><span class="sale_btn">Offer</span><span class="sale_time_end">Ends today</span><span class="sale_time_end inline_right">Yesterday</span></td></tr></table>',
        title: '图书促销 - 缺书网',
        item: { title: 'Offer：Book', link: 'http://www.queshu.com/book', description: 'Offer：Book<br>Ends today<br>发布时间：Yesterday' },
    },
    {
        name: 'AIEA',
        module: () => import('../lib/routes/aiea/index'),
        params: { period: 'upcoming' },
        html: '<div class="seminar-contents"><div class="seminar-partWrap"><div class="seminar-list"><div class="seminar-list-title"><span>Seminar</span></div><a href="/0504/1">Details</a><div class="txt"><span class="title">Description</span></div></div></div></div>',
        title: 'AIEA Seminars',
        item: { title: 'Seminar', link: '/0504/1', description: 'Description' },
    },
    {
        name: 'Oasis',
        module: () => import('../lib/routes/weibo/oasis/user'),
        params: { userid: '123' },
        html: '<div class="name-main">Author</div><div class="desc">Profile</div><div class="container"><div class="status-item"><div data-id="456"><div class="status-item-title">Post<span>Ignored child</span></div></div><div class="status-img"><img src="/image.jpg"></div></div></div>',
        title: 'Author - 用户 - 绿洲',
        item: { title: 'Post', link: 'https://oasis.weibo.cn/v1/h5/share?sid=456', description: 'Post<br><img src="/image.jpg">' },
    },
    {
        name: 'Oct0pu5',
        module: () => import('../lib/routes/oct0pu5/rss'),
        html: '<div class="recent-posts"><article class="recent-post-item"><div class="recent-post-info"><a href="/post">Post</a><div class="content">Description</div><div class="article-meta-wrap"><span class="post-meta-date"><time>2025-01-01T00:00:00Z</time></span></div></div></article></div>',
        title: '博客',
        item: { title: 'Post', link: '/post', description: 'Description', pubDate: 1_735_689_600_000 },
    },
    {
        name: 'Air China',
        module: () => import('../lib/routes/airchina/index'),
        html: '<ul class="serviceMsg"><li><a href="/1">First</a><span>2025-01-01</span></li><li><a href="/2">Second</a><span>2025-01-02</span></li></ul>',
        title: '国航服务公告',
        item: { title: 'First', link: '/1', pubDate: new Date(2025, 0, 1), description: 'Article detail' },
        uniqueGuid: true,
    },
    {
        name: 'Xunhupay',
        module: () => import('../lib/routes/xunhupay/index'),
        html: '<div class="blog-post"><article><h5>First</h5><a href="/1"></a><div class="content">Description</div><div class="date">2025-01-01</div></article><article><h5>Second</h5><a href="/2"></a><div class="date">2025-01-02</div></article></div>',
        title: '博客',
        item: { title: 'First', link: '/1', pubDate: new Date(2025, 0, 1), description: 'Description' },
        uniqueGuid: true,
    },
    {
        name: 'iiilab',
        module: () => import('../lib/routes/iiilab/index'),
        html: '<div class="aw-common-list"><div><a href="/1">First</a><div class="markitup-box">Description</div><div class="text-color-999">2025-01-01 00:00</div></div><div><a href="/2">Second</a><div class="text-color-999">2025-01-02 00:00</div></div></div>',
        title: '发现',
        item: { title: 'First', link: '/1', pubDate: new Date(2025, 0, 1), description: 'Description' },
        uniqueGuid: true,
    },
];

beforeEach(() => {
    vi.clearAllMocks();
    mocks.get.mockResolvedValue({ data: '<div class="serviceMsg">Article detail</div>' });
});

describe('common-config route callbacks', () => {
    it.each(fixtures)('$name extracts its HTML fixture without evaluating selector strings', async (fixture) => {
        mocks.raw.mockResolvedValue({ headers: new Headers({ 'content-type': 'text/html' }), _data: fixture.html });
        const { route } = await fixture.module();
        const params: Record<string, string | undefined> = fixture.params ?? {};
        const ctx = { req: { param: (key?: string) => (key ? params[key] : params), query: () => {} } } as unknown as Context;
        const data = (await (route.handler as Exclude<Route['handler'], string>)(ctx)) as Data;
        expect(mocks.raw).toHaveBeenCalledTimes(1);
        expect(data.title).toBe(fixture.title);
        expect(data.item).toHaveLength(fixture.uniqueGuid ? 2 : 1);
        expect(data.item![0]).toMatchObject(fixture.item);
        if (fixture.uniqueGuid) {
            expect(data.item!.map((item) => item.guid)).toEqual(['LzE=', 'LzI=']);
        }
    });
});
