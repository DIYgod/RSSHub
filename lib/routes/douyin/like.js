const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const browser = await require('../../utils/puppeteer')();
    const page = await browser.newPage();

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 1000));
    await timerPromise;

    const data = await new Promise((resolve) => {
        const result = {
            name: null,
            description: null,
            list: null,
        };

        page.goto(`https://www.douyin.com/share/user/${id}`)
            .then(() => {
                page.click('.like-tab').catch(() => {});
            })
            .catch(() => {});

        page.on('response', (response) => {
            const req = response.request();
            if (req.url().match(`www.douyin.com/share/user/${id}`)) {
                response.text().then((text) => {
                    const $ = cheerio.load(text);
                    result.name = $('.nickname').text();
                    result.description = $('.signature').text();
                    if (result.list) {
                        resolve(result);
                        browser.close();
                    }
                });
            } else if (req.url().match('www.douyin.com/aweme/v1/aweme/favorite')) {
                response.json().then((data) => {
                    result.list = data;
                    if (result.name) {
                        resolve(result);
                        browser.close();
                    }
                });
            }
        });
    });

    ctx.state.data = {
        title: `${data.name}的抖音-喜欢的视频`,
        link: `https://www.douyin.com/share/user/${id}`,
        description: data.description,
        item:
            data.list &&
            data.list.aweme_list.map((item) => ({
                title: item.share_info.share_desc,
                description: `
                    <p>${item.share_info.share_desc}</p>
                    <p><a href="https://www.amemv.com/redirect/?redirect_url=aweme%3A%2F%2Faweme%2Fdetail%2F${item.aweme_id}%3Frefer%3Dweb%26gd_label%3Dclick_wap_profile_feature%26appParam%3D%26needlaunchlog%3D1">APP 内打开</a></p>
                    <p>
                        <video
                            controls="controls"
                            width="${item.video.width}"
                            height="${item.video.height}"
                            poster="${item.video.cover.url_list[0]}"
                            src="${item.video.play_addr.url_list[0]}"
                            >
                    </p>`,
                link: item.video.play_addr.url_list[0],
            })),
    };
};
