import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    platforms: string[];
    reason: string;
    subsequent: string;
    prLabel?: string;
    prLinks: string[];
    logUrl: string;
};

export const renderDescription = ({ platforms, reason, subsequent, prLabel, prLinks, logUrl }: DescriptionData): string =>
    renderToString(
        <>
            {platforms.length > 0 && <p>Platforms: {platforms.join(', ')}.</p>}
            {reason && (
                <>
                    <p>Reason:</p>
                    <pre>{reason}</pre>
                </>
            )}
            {subsequent && (
                <>
                    <p>Subsequent processing:</p>
                    <pre>{subsequent}</pre>
                </>
            )}
            {prLabel && <p>PR: {prLabel}.</p>}
            {prLinks.map((link) => (
                <p>
                    <a href={link}>{link}</a>
                </p>
            ))}
            <p>
                <a href={logUrl}>Original log</a>
            </p>
        </>
    );
