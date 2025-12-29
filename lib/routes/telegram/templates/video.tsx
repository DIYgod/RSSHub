import { renderToString } from 'hono/jsx/dom/server';

type VideoData = {
    source?: string;
    poster?: string;
};

export const renderVideo = ({ source, poster }: VideoData): string =>
    renderToString(
        source ? (
            <video src={source} controls="controls" poster={poster} style="width: 100%"></video>
        ) : poster ? (
            <blockquote>
                <b>Video is too big</b>
                <br />
                <img src={poster} />
            </blockquote>
        ) : (
            <blockquote>
                <b>Video is too big</b>
            </blockquote>
        )
    );
