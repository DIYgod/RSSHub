import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

export interface ResourceLink {
    label: string;
    href: string;
}

export const renderChartNotice = (articleUrl: string, headingText: string): string =>
    renderToString(
        <p>
            <a href={articleUrl}>{headingText ? `Interactive chart on Apple ML Research: ${headingText}` : 'View interactive chart on Apple Machine Learning Research'}</a>
        </p>
    );

export const renderHeroVideo = (videoUrl: string, videoType?: string, posterUrl?: string): string =>
    renderToString(
        <figure>
            <video controls preload="metadata" poster={posterUrl}>
                <source src={videoUrl} type={videoType || 'video/mp4'} />
            </video>
            <p>
                <a href={videoUrl}>Watch the video</a>
            </p>
        </figure>
    );

export const renderMlResearchDescription = (bodyHtml: string, heroImageUrl: string | undefined, heroImageAlt: string | undefined, heroVideoHtml: string | undefined, resourceLinks: readonly ResourceLink[]): string => {
    const includeHeroImage = Boolean(heroImageUrl && !bodyHtml.includes(heroImageUrl));
    return renderToString(
        <>
            {heroVideoHtml ? raw(heroVideoHtml) : null}
            {!heroVideoHtml && includeHeroImage && heroImageUrl ? (
                <figure>
                    <img src={heroImageUrl} alt={heroImageAlt ?? ''} />
                </figure>
            ) : null}
            {bodyHtml ? raw(bodyHtml) : null}
            {resourceLinks.length > 0 ? (
                <ul>
                    {resourceLinks.map((link) => (
                        <li>
                            <a href={link.href}>{link.label}</a>
                        </li>
                    ))}
                </ul>
            ) : null}
        </>
    );
};

export const renderFallbackDescription = (summaryHtml: string | undefined, resourceLinks: readonly ResourceLink[]): string | undefined => {
    if (!summaryHtml && resourceLinks.length === 0) {
        return undefined;
    }
    return renderToString(
        <>
            {summaryHtml ? raw(summaryHtml) : null}
            {resourceLinks.length > 0 ? (
                <ul>
                    {resourceLinks.map((link) => (
                        <li>
                            <a href={link.href}>{link.label}</a>
                        </li>
                    ))}
                </ul>
            ) : null}
        </>
    );
};
