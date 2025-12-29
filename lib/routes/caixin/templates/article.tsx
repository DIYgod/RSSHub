import type { CheerioAPI } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ArticleData = {
    item: any;
    $: CheerioAPI;
};

export const renderArticle = ({ item, $ }: ArticleData) => {
    const subhead = $('.article .subhead').length ? $('.article .subhead').html() : null;
    const media = $('.article .media').length ? $('.article .media').html() : null;
    const contentVideo = $('.article .content_video').length
        ? $('script')
              .text()
              .match(/initPlayer\('(.*?)','(.*?)'\)/)
        : null;
    const mainContent = $('div#Main_Content_Val.text').length ? $('div#Main_Content_Val.text').html() : null;
    const picsValue = item.pics;
    const picsList = typeof picsValue === 'string' && picsValue.includes('#') ? picsValue.split('#') : null;

    return renderToString(
        <>
            {item.audio ? (
                <>
                    <audio src={item.audio} controls></audio>
                    <br />
                </>
            ) : null}
            {subhead ? (
                <>
                    <blockquote>
                        <p>{raw(subhead)}</p>
                    </blockquote>
                    <br />
                </>
            ) : null}
            {media ? (
                <>
                    {raw(media)}
                    <br />
                </>
            ) : null}
            {contentVideo ? (
                <>
                    <video controls preload="metadata" poster={contentVideo[2]} src={contentVideo[1]}></video>
                    <br />
                </>
            ) : null}
            {mainContent ? (
                <>{raw(mainContent)}</>
            ) : (
                <>
                    {item.summary ? (
                        <>
                            <blockquote>
                                <p>{item.summary}</p>
                            </blockquote>
                            <br />
                        </>
                    ) : null}
                    {picsList ? (
                        <>
                            {picsList.map((pic) => (
                                <>
                                    <img src={pic} />
                                    <br />
                                </>
                            ))}
                        </>
                    ) : (
                        <>
                            <img src={picsValue} />
                            <br />
                        </>
                    )}
                </>
            )}
        </>
    );
};
