const request = require('request');
const art = require('art-template');
const path = require('path');
const base = require('../base');
const mix = require('../../utils/mix');

module.exports = (req, res) => {
    const uid = req.params.uid;

    base({
        req: req,
        res: res,
        getHTML: (callback) => {
            request.post(
                {
                    url: 'http://music.163.com/api/user/playlist',
                    headers: {
                        'User-Agent': mix.ua,
                        Referer: 'https://music.163.com/'
                    },
                    form: {
                        uid: uid,
                        limit: 1000,
                        offset: 0
                    }
                },
                (err, httpResponse, body) => {
                    let data;
                    try {
                        data = JSON.parse(body);
                    } catch (e) {
                        data = {};
                    }
                    const playlist = data.playlist || [{ creator: {} }];

                    const creator = playlist[0].creator;

                    const { nickname, signature } = creator;

                    const html = art(
                        path.resolve(__dirname, '../../views/rss.art'),
                        {
                            title: `${nickname} 的所有歌单`,
                            link: `http://music.163.com/user/home?id=${uid}`,
                            description: signature,
                            lastBuildDate: new Date().toUTCString(),
                            item:
                                playlist[0].id &&
                                playlist.map((pl) => ({
                                    title: pl.name,
                                    description: pl.description,
                                    pubDate: new Date(
                                        pl.createTime
                                    ).toUTCString(),
                                    link: `http://music.163.com/playlist?id=${
                                        pl.id
                                    }`
                                }))
                        }
                    );
                    callback(html);
                }
            );
        }
    });
};
