import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import got from '@/utils/got';

const apiBaseUrl = 'https://apiv3.fansly.com';
const baseUrl = 'https://fansly.com';
const icon = `${baseUrl}/assets/images/icons/apple-touch-icon.png`;

const findAccountById = (accountId, accounts) => {
    const account = accounts.find((account) => account.id === accountId);
    return {
        displayName: account.displayName,
        username: account.username,
    };
};

const getAccountByUsername = (username) =>
    cache.tryGet(`fansly:account:${username.toLowerCase()}`, async () => {
        const { data: accountResponse } = await got(`${apiBaseUrl}/api/v1/account`, {
            searchParams: {
                usernames: username,
                'ngsw-bypass': true,
            },
        });

        if (!accountResponse.response.length) {
            throw new InvalidParameterError('This profile or page does not exist.');
        }

        return accountResponse.response[0];
    });

const getTimelineByAccountId = async (accountId) => {
    const { data: timeline } = await got(`${apiBaseUrl}/api/v1/timelinenew/${accountId}`, {
        searchParams: {
            before: 0,
            after: 0,
            wallId: '',
            contentSearch: '',
            'ngsw-bypass': true,
        },
    });

    return timeline.response;
};

const getTagId = (tag) =>
    cache.tryGet(`fansly:tag:${tag.toLowerCase()}`, async () => {
        const { data: tagResponse } = await got(`${apiBaseUrl}/api/v1/contentdiscovery/media/tag`, {
            searchParams: {
                tag,
                'ngsw-bypass': true,
            },
        });

        if (!tagResponse.response.mediaOfferSuggestionTag) {
            throw new Error("Couldn't find this hashtag.");
        }

        return tagResponse.response.mediaOfferSuggestionTag.id;
    });

const getTagSuggestion = async (tagId) => {
    const { data: suggestionResponse } = await got(`${apiBaseUrl}/api/v1/contentdiscovery/media/suggestionsnew`, {
        searchParams: {
            before: 0,
            after: 0,
            tagIds: tagId,
            limit: 25,
            offset: 0,
            'ngsw-bypass': true,
        },
    });

    return suggestionResponse.response;
};

const parseDescription = (post, aggregationData) => post.content.replaceAll('\n', '<br>') + '<br>' + parseAttachments(post.attachments, aggregationData);

const parseAttachments = (attachments, aggregationData) =>
    attachments
        .map((attachment) => {
            switch (attachment.contentType) {
                case 1:
                    // single media
                    return parseMedia(attachment.contentId, aggregationData.accountMedia);
                case 2: {
                    // media bundle
                    let attachments = '';
                    const bundle = aggregationData.accountMediaBundles.find((bundle) => bundle.id === attachment.contentId);
                    for (const mediaId of bundle.accountMediaIds) {
                        attachments += parseMedia(mediaId, aggregationData.accountMedia);
                    }
                    return attachments;
                }
                case 8: {
                    // aggregated post (repost)
                    let attachments = '<br><br>';
                    const repost = aggregationData.aggregatedPosts.find((post) => post.id === attachment.contentId) || aggregationData.posts.find((post) => post.id === attachment.contentId);
                    attachments += parseDescription(repost, aggregationData);

                    return attachments;
                }

                case 7100:
                    return renderTipGoal(attachment.contentId, aggregationData.tipGoals);
                case 32001:
                    // unknown
                    return '';
                case 42001:
                    return renderPoll(attachment.contentId, aggregationData.polls);

                default:
                    throw new Error(`Unhandled attachment type: ${attachment.contentType} for post ${attachment.postId}`);
            }
        })
        .join('');

const parseMedia = (contentId, accountMedia) => {
    const media = accountMedia.find((media) => media.id === contentId);
    if (!media) {
        return '';
    }
    return renderMedia(media.preview ?? media.media);
};

const renderMedia = (media) => {
    switch (media.mimetype) {
        case 'image/gif':
        case 'image/jpeg':
        case 'image/png':
        case 'video/mp4':
        case 'audio/mp4':
            return renderToString(<FanslyMedia poster={media.mimetype === 'video/mp4' ? media.variants[0].locations[0] : null} src={media.locations[0]} />);
        default:
            throw new Error(`Unhandled media type: ${media.mimetype}`);
    }
};

const renderPoll = (pollId, polls) => {
    const poll = polls.find((poll) => poll.id === pollId);
    return renderToString(<FanslyPoll title={poll.question} options={poll.options} version={poll.version} />);
};
const renderTipGoal = (tipGoalId, tipGoals) => {
    const goal = tipGoals.find((goal) => goal.id === tipGoalId);
    return renderToString(<FanslyTipGoal label={goal.label} currentPercentage={goal.currentPercentage} currentAmount={goal.currentAmount} goalAmount={goal.goalAmount} />);
};

export { baseUrl, findAccountById, getAccountByUsername, getTagId, getTagSuggestion, getTimelineByAccountId, icon, parseAttachments, parseDescription, parseMedia, renderMedia, renderPoll, renderTipGoal };

const FanslyMedia = ({ poster, src }: { poster?: { location?: string } | null; src?: { location?: string } }) => (
    <>
        {poster && src ? (
            <video controls preload="metadata" poster={poster.location}>
                <source src={src.location} type="video/mp4" />
            </video>
        ) : src ? (
            <img src={src.location} />
        ) : null}
        <br />
    </>
);

const FanslyPoll = ({ title, options, version }: { title: string; options: any[]; version: string }) => (
    <>
        <b>{title}</b>
        <br />
        {options.map((option) => (
            <>
                {option.voteCount}/{version} {option.title}
                <br />
            </>
        ))}
    </>
);

const FanslyTipGoal = ({ label, currentPercentage, currentAmount, goalAmount }: { label: string; currentPercentage: number; currentAmount: number; goalAmount: number }) => (
    <>
        {label}
        <br />
        {currentPercentage}% ${currentAmount / 1000} / ${goalAmount / 1000}
    </>
);
