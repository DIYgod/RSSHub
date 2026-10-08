import { renderToString } from 'hono/jsx/dom/server';

type PlaylistData = {
    songId?: number;
    singer?: string;
    album?: string;
    date?: string;
    picUrl?: string;
};

export const renderPlaylistDescription = ({ songId, singer, album, date, picUrl }: PlaylistData) =>
    renderToString(
        <>
            歌手：{singer}
            <br />
            专辑：{album}
            <br />
            {date ? (
                <>
                    发行日期：{date}
                    <br />
                </>
            ) : null}
            <img src={picUrl} />
            {songId ? <iframe src={`https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=66`} width="330" height="86" frameborder="0" /> : null}
        </>
    );
