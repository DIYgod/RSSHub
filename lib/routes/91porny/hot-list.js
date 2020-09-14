const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://91porny.com/video/category/latest'

    const response = await got(`${host}`);
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const elems = $('div[class=video-elem]').slice().get();
    // console.log(items.find($('a')).attr('href'));
    /**
     * 
     * <a target="_self" class="display d-block" href="/video/viewhd/1712487be55729d6ed37">
    <div class="scale"></div>
    <div class="img" style="background-image: url(&apos;https://img.t6k.co/thumb/392871.jpg&apos;)"></div>
    <small class="layer"> 01:55</small>
    <small class="ad-layer"> HD </small>
    
    </a>
    <a target="_self" class="title text-sub-title mt-2" href="/video/viewhd/1712487be55729d6ed37">&#x51FA;&#x79DF;&#x5C4B;&#x540E;&#x5165;&#x5C0F;&#x5C11;&#x5987;</a>   
    <small class="text-sub-title">2020-08-28&#xA0;|&#xA0;4197&#x6B21;&#x64AD;&#x653E;</small><br>
     */
    const items = elems.map((i) => {
        const item = $(i);
        const url = item.find('a').attr('href');
        const title = item.find('a').text();
        const description = item.find('a').html();
        const single = {
            title: title,
            description: description,
            link: 'https://91porny.com' + url
        };
        return single;
    });

    ctx.state.data = {
        title: '91porny',
        link: 'https://91porny.com',
        item: items
    }

};