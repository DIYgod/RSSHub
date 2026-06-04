import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { route } from './routes/tophub';

function createCtx({ id = 'Om4ejxvxEN', threshold }: { id?: string; threshold?: string } = {}) {
    return {
        req: {
            param: (name: string) => {
                if (name === 'id') {
                    return id;
                }

                if (name === 'threshold') {
                    return threshold;
                }
            },
        },
    };
}

const homepage = `
<div class="cc-cd" id="node-1">
    <div>
        <div class="cc-cd-ih">
            <div class="cc-cd-is">
                <a href="/n/other">
                    <div class="cc-cd-lb">
                        <img src="https://example.com/other.png">
                        <span>其他榜单</span>
                    </div>
                </a>
            </div>
            <div class="cc-cd-sb">
                <div class="cc-cd-sb-ss cc-cd-sb-ss-ia">
                    <span class="cc-cd-sb-st">其他</span>
                </div>
            </div>
        </div>
        <div class="cc-cd-cb nano">
            <div class="cc-cd-cb-l nano-content">
                <a href="https://example.com/other-item" itemid="1">
                    <div class="cc-cd-cb-ll">
                        <span class="s h">1</span>
                        <span class="t">不会被选中的条目</span>
                        <span class="e">999W</span>
                    </div>
                </a>
            </div>
        </div>
        <div class="cc-cd-if">
            <div class="i-h">10分钟前</div>
            <div class="i-o" nodeid="1" hashid="other"></div>
        </div>
    </div>
</div>
<div class="cc-cd" id="node-3">
    <div>
        <div class="cc-cd-ih">
            <div class="cc-cd-is">
                <a href="/n/Om4ejxvxEN">
                    <div class="cc-cd-lb">
                        <img src="https://file.ipadown.com/tophub/assets/images/media/tieba.baidu.com.png_160x160.png">
                        <span>百度贴吧</span>
                    </div>
                </a>
            </div>
            <div class="cc-cd-sb">
                <div class="cc-cd-sb-ss cc-cd-sb-ss-ia">
                    <span class="cc-cd-sb-st">热议榜</span>
                </div>
            </div>
        </div>
        <div class="cc-cd-cb nano">
            <div class="cc-cd-cb-l nano-content">
                <a href="http://tieba.baidu.com/hottopic/1" itemid="240111571">
                    <div class="cc-cd-cb-ll">
                        <span class="s h">1</span>
                        <span class="t">一眼假!造谣山姆偷吃者被拘</span>
                        <span class="e">173.1W实时讨论</span>
                    </div>
                </a>
                <a href="http://tieba.baidu.com/hottopic/2" itemid="240109140">
                    <div class="cc-cd-cb-ll">
                        <span class="s h">2</span>
                        <span class="t">Faker怒喷拳头elo机制</span>
                        <span class="e">15.2万实时讨论</span>
                    </div>
                </a>
                <a href="/link/relative" itemid="240099820">
                    <div class="cc-cd-cb-ll">
                        <span class="s">3</span>
                        <span class="t">无热度也要保留</span>
                        <span class="e">作者署名</span>
                    </div>
                </a>
            </div>
        </div>
        <div class="cc-cd-if">
            <div class="i-h">5分钟前</div>
            <div class="i-o" nodeid="3" hashid="Om4ejxvxEN"></div>
        </div>
    </div>
</div>
`;

describe('/tophub/:id/:threshold?', () => {
    it('builds the feed from the homepage card when the detail page is blocked', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(http.get('https://tophub.today/', () => HttpResponse.html(homepage)));

        const feed = await route.handler(createCtx());

        expect(feed.title).toBe('百度贴吧 - 热议榜');
        expect(feed.description).toBe('5分钟前');
        expect(feed.link).toBe('https://tophub.today/n/Om4ejxvxEN');
        expect(feed.image).toBe('https://file.ipadown.com/tophub/assets/images/media/tieba.baidu.com.png_160x160.png');
        expect(feed.item).toHaveLength(3);
        expect(feed.item[0]).toMatchObject({
            title: '一眼假!造谣山姆偷吃者被拘 (173.1W实时讨论)',
            link: 'http://tieba.baidu.com/hottopic/1',
        });
        expect(feed.item[2]).toMatchObject({
            title: '无热度也要保留 (作者署名)',
            link: 'https://tophub.today/link/relative',
        });
    });

    it('filters items by threshold only when the heat value is numeric', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(http.get('https://tophub.today/', () => HttpResponse.html(homepage)));

        const feed = await route.handler(createCtx({ threshold: '100' }));

        expect(feed.item).toHaveLength(1);
        expect(feed.item[0].title).toBe('一眼假!造谣山姆偷吃者被拘 (173.1W实时讨论)');
    });
});
