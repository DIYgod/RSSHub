import { renderToString } from 'hono/jsx/dom/server';

type PlaylistData = {
    singer?: string;
    album?: string;
    date?: string;
    picUrl?: string;
};

export const renderPlaylistDescription = ({ singer, album, date, picUrl }: PlaylistData) =>
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
        </>
    );
