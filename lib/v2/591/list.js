const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');

const cookieJar = new CookieJar();

const client = got.extend({
    cookieJar,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    },
});

function appendRentalAPIParams(urlString) {
    const searchParams = new URLSearchParams(urlString);

    searchParams.set('is_format_data', '1');
    searchParams.set('is_new_list', '1');
    searchParams.set('type', '1');

    return searchParams.toString();
}

async function getToken() {
    const html = await client('https://rent.591.com.tw').text();

    const $ = cheerio.load(html);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    if (!csrfToken) {
        throw 'CSRF token not found';
    }

    return csrfToken;
}

async function getHouseList(houseListURL) {
    const csrfToken = await getToken();

    const data = await client({
        url: houseListURL,
        headers: {
            'X-CSRF-TOKEN': csrfToken,
        },
    }).json();

    const {
        data: { data: houseList },
    } = data;

    return houseList;
}

module.exports = async (ctx) => {
    const query = ctx.params.query ?? '';

    const houses = await getHouseList(`https://rent.591.com.tw/home/search/rsList?${appendRentalAPIParams(query)}`);

    const queryUrl = `https://rent.591.com.tw/?${query}`;

    // title: string;
    // type: string;
    // post_id: number;
    // kind_name: string;
    // room_str: string;
    // floor_str: string;
    // community: string;
    // price: string;
    // price_unit: string;
    // photo_list: string[];
    // section_name: string;
    // street_name: string;
    // location: string;
    // rent_tag: RentTagItem[];
    // area: string;
    // role_name: string;
    // contact: string;
    // refresh_time: string;
    // yesterday_hit: number;
    // is_vip: number;
    // is_combine: number;
    // hurry: number;
    // is_socail: number;
    // surrounding: Surrounding;
    // discount_price_str: string;
    // cases_id: number;
    // is_video: number;
    // preferred: number;
    // cid: number;
    const items = houses.map((house) => {
        const { title, post_id, price, price_unit, photo_list, rent_tag } = house;

        const itemUrl = `https://rent.591.com.tw/home/${post_id}`;
        const itemTitle = `${title} - ${price} ${price_unit}`;
        const tags = rent_tag.map((tag) => `<code>${tag.name}</code>`).join(' ');

        const description = `
            <img src="${photo_list[0]}" style="margin-bottom: 20px;">

            <table>
                <tr>
                    <td>類型</td>
                    <td>${house.kind_name}</td>
                </tr>
                <tr>
                    <td>坪數</td>
                    <td>${house.area} 坪</td>
                </tr>
                <tr>
                    <td>樓層</td>
                    <td>${house.floor_str}</td>
                </tr>
                <tr>
                    <td>社區</td>
                    <td>${house.community}</td>
                </tr>
                <tr>
                    <td>地點</td>
                    <td>${house.location}</td>
                </tr>
                <tr>
                    <td>更新時間</td>
                    <td>${house.refresh_time}</td>
                </tr>
                <tr>
                    <td>標籤</td>
                    <td>${tags}</td>
                </tr>
            </table>

            <p>更多資訊請見 <a href="${itemUrl}">591 租屋</a></p>

            <br />

            <h3>更多圖片</h3>

            <br />

            <div id="more-pictures">
                ${photo_list
                    .slice(1)
                    .map((photo) => `<img src="${photo}" style="margin-bottom: 20px;">`)
                    .join('')}
            </div>

            <div id="hidden-meta" style="display: none;">
                <div id="post-id">${post_id}</div>
                <div id="item-url">${itemUrl}</div>
                <div id="item-title">${house.title}</div>
                <div id="item-price">${price}</div>
                <div id="item-price-unit">${price_unit}</div>
                <div id="item-kind-name">${house.kind_name}</div>
                <div id="item-area">${house.area}</div>
                <div id="item-floor-str">${house.floor_str}</div>
                <div id="item-community">${house.community}</div>
                <div id="item-location">${house.location}</div>
                <div id="item-refresh-time">${house.refresh_time}</div>
                <div id="item-photo-list">${photo_list.join(',')}</div>
                <div id="item-rent-tag">${rent_tag.map((tag) => `<span>${tag.name}</span>`).join('')}</div>
                <div id="item-room-str">${house.room_str}</div>
                <div id="item-section-name">${house.section_name}</div>
                <div id="item-street-name">${house.street_name}</div>
                <div id="item-role-name">${house.role_name}</div>
                <div id="item-contact">${house.contact}</div>
                <div id="item-yesterday-hit">${house.yesterday_hit}</div>
                <div id="item-is-vip">${house.is_vip}</div>
                <div id="item-is-combine">${house.is_combine}</div>
                <div id="item-hurry">${house.hurry}</div>
                <div id="item-is-socail">${house.is_socail}</div>
                <div id="item-surrounding">${house.surrounding}</div>
                <div id="item-discount-price-str">${house.discount_price_str}</div>
                <div id="item-cases-id">${house.cases_id}</div>
                <div id="item-is-video">${house.is_video}</div>
                <div id="item-preferred">${house.preferred}</div>
                <div id="item-cid">${house.cid}</div>
            </div>`;

        return {
            title: itemTitle,
            description,
            link: itemUrl,
        };
    });

    ctx.state.data = {
        title: `591 租屋 - 自訂查詢`,
        link: queryUrl,
        description: `591 租屋 - 自訂查詢, query: ${query}`,
        item: items,
    };
};
