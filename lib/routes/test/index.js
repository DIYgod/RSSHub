const config = require('@/config').value;
let cacheIndex = 0;
const got = require('@/utils/got');

module.exports = async (ctx) => {
    if (ctx.params.id === 'error') {
        throw Error('Error test');
    }
    if (ctx.params.id === 'httperror') {
        await got({
            method: 'get',
            url: `https://google.com/404`,
        });
    }
    let item = [];
    if (ctx.params.id === 'filter') {
        item = [
            {
                title: 'Filter Title1',
                description: 'Description1',
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://github.com/DIYgod/RSSHub/issues/-1`,
                author: `DIYgod0`,
            },
            {
                title: 'Filter Title2',
                description: 'Description2',
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://github.com/DIYgod/RSSHub/issues/0`,
                author: `DIYgod0`,
            },
        ];
    } else if (ctx.params.id === 'long') {
        item.push({
            title: `Long Title `.repeat(50),
            description: `Long Description `.repeat(10),
            pubDate: new Date(`2019-3-1`).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/0`,
            author: `DIYgod0`,
        });
    } else if (ctx.params.id === 'cache') {
        const description = await ctx.cache.tryGet(
            'test',
            () => ({
                text: `Cache${++cacheIndex}`,
            }),
            config.cache.routeExpire * 2
        );
        item.push({
            title: 'Cache Title',
            description: description.text,
            pubDate: new Date(`2019-3-1`).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/0`,
            author: `DIYgod0`,
        });
    } else if (ctx.params.id === 'refreshCache') {
        let refresh = await ctx.cache.get('refreshCache');
        let noRefresh = await ctx.cache.get('noRefreshCache', false);
        if (!refresh) {
            refresh = '0';
            await ctx.cache.set('refreshCache', '1');
        }
        if (!noRefresh) {
            noRefresh = '0';
            await ctx.cache.set('noRefreshCache', '1', undefined, false);
        }
        item.push({
            title: 'Cache Title',
            description: refresh + ' ' + noRefresh,
            pubDate: new Date(`2019-3-1`).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/0`,
            author: `DIYgod0`,
        });
    } else if (ctx.params.id === 'complicated') {
        item.push({
            title: `Complicated Title`,
            description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">
<script>alert(1);</script>
<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg">
<img data-src="/DIYgod/RSSHub.jpg">
<img data-mock="/DIYgod/RSSHub.png">
<img mock="/DIYgod/RSSHub.gif">
<img src="http://mock.com/DIYgod/DIYgod/RSSHub">
<img src="/DIYgod/RSSHub.jpg" onclick="alert(1);" onerror="alert(1);" onload="alert(1);">`,
            pubDate: new Date(`2019-3-1`).toUTCString(),
            link: `//mock.com/DIYgod/RSSHub`,
            author: `DIYgod`,
        });
        item.push({
            title: `Complicated Title`,
            description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">`,
            pubDate: new Date(`2019-3-1`).toUTCString(),
            link: `https://mock.com/DIYgod/RSSHub`,
            author: `DIYgod`,
        });
    } else if (ctx.params.id === 'sort') {
        item.push({
            title: `Sort Title 0`,
            link: `https://github.com/DIYgod/RSSHub/issues/s1`,
            author: `DIYgod0`,
        });
        item.push({
            title: `Sort Title 1`,
            link: `https://github.com/DIYgod/RSSHub/issues/s1`,
            author: `DIYgod0`,
        });
        item.push({
            title: `Sort Title 2`,
            link: `https://github.com/DIYgod/RSSHub/issues/s2`,
            pubDate: new Date(1546272000000 - 10 * 10 * 1000).toUTCString(),
            author: `DIYgod0`,
        });
        item.push({
            title: `Sort Title 3`,
            link: `https://github.com/DIYgod/RSSHub/issues/s3`,
            pubDate: new Date(1546272000000).toUTCString(),
            author: `DIYgod0`,
        });
    } else if (ctx.params.id === 'mess') {
        item.push({
            title: `Mess Title`,
            link: `/DIYgod/RSSHub/issues/0`,
            pubDate: 1546272000000,
            author: `DIYgod0`,
        });
    } else if (ctx.params.id === 'opencc') {
        item.push({
            title: '小可愛',
            description: '宇宙無敵',
            link: `/DIYgod/RSSHub/issues/0`,
            pubDate: new Date(1546272000000).toUTCString(),
            author: `DIYgod0`,
        });
    }

    for (let i = 1; i < 6; i++) {
        item.push({
            title: `Title${i}`,
            description: `Description${i}`,
            pubDate: new Date((ctx.params.id === 'current_time' ? new Date() : 1546272000000) - i * 10 * 1000).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/${i}`,
            author: `DIYgod${i}`,
        });
    }

    if (ctx.params.id === 'empty') {
        item = null;
    }

    if (ctx.params.id === 'allow_empty') {
        item = null;
    }

    if (ctx.params.id === 'enclosure') {
        item = [
            {
                title: '',
                link: 'https://github.com/DIYgod/RSSHub/issues/1',
                enclosure_url: 'https://github.com/DIYgod/RSSHub/issues/1',
                enclosure_length: 3661,
            },
        ];
    }

    if (ctx.query.mode === 'fulltext') {
        item = [
            {
                title: '',
                link: 'https://m.thepaper.cn/newsDetail_forward_4059298',
            },
        ];
    }

    ctx.state.data = {
        title: `Test ${ctx.params.id}`,
        itunes_author: ctx.params.id === 'enclosure' ? 'DIYgod' : null,
        link: 'https://github.com/DIYgod/RSSHub',
        item,
        allowEmpty: ctx.params.id === 'allow_empty',
    };
};
