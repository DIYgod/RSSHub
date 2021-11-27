const got = require('@/utils/got');
module.exports = async (ctx) => {
    const user = ctx.params.user;
    const url = 'https://leetcode-cn.com/graphql';
    let payload = `{"operationName":"userPublicProfile","variables":{"userSlug":"${user}"},"query":"query userPublicProfile($userSlug: String!) {\\n  userProfilePublicProfile(userSlug: $userSlug) {\\n    username\\n    haveFollowed\\n    siteRanking\\n    profile {\\n      userSlug\\n      realName\\n      aboutMe\\n      country\\n      userAvatar\\n      location\\n      gender\\n      websites\\n      skillTags\\n      contestCount\\n      asciiCode\\n      ranking {\\n        rating\\n        ranking\\n        currentLocalRanking\\n        currentGlobalRanking\\n        currentRating\\n        ratingProgress\\n        totalLocalUsers\\n        totalGlobalUsers\\n        __typename\\n      }\\n      skillSet {\\n        langLevels {\\n          langName\\n          langVerboseName\\n          level\\n          __typename\\n        }\\n        topics {\\n          slug\\n          name\\n          translatedName\\n          __typename\\n        }\\n        topicAreaScores {\\n          score\\n          topicArea {\\n            name\\n            slug\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      socialAccounts {\\n        provider\\n        profileUrl\\n        __typename\\n      }\\n      __typename\\n    }\\n    educationRecordList {\\n      unverifiedOrganizationName\\n      __typename\\n    }\\n    occupationRecordList {\\n      unverifiedOrganizationName\\n      jobTitle\\n      __typename\\n    }\\n    submissionProgress {\\n      totalSubmissions\\n      waSubmissions\\n      acSubmissions\\n      reSubmissions\\n      otherSubmissions\\n      acTotal\\n      questionTotal\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`;
    const responseBasic = await got({
        method: 'post',
        data: payload,
        url,
        headers: {
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9',
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            Accept: '*/*',
            Host: 'leetcode-cn.com',
            Connection: 'keep-alive',
        },
    });
    const dataBasic = responseBasic.data.data;
    const userProfilePublicProfile = dataBasic.userProfilePublicProfile;
    const siteRanking = userProfilePublicProfile.siteRanking; // 全站排名
    const profile = userProfilePublicProfile.profile;
    const userSlug = profile.userSlug; // 用户名
    const userAvatar = profile.userAvatar; // 用户头像
    const submissionProgress = userProfilePublicProfile.submissionProgress;
    // 解决的题目
    const acTotal = submissionProgress.acTotal;
    const questionTotal = submissionProgress.questionTotal;
    // 通过的提交
    const acSubmissions = submissionProgress.acSubmissions;
    const totalSubmissions = submissionProgress.totalSubmissions;
    // 提交通过率
    const ProgressNumber = (acSubmissions / totalSubmissions).toFixed(4);
    const description = `全站排名 ${siteRanking} <br>解决的题目 ${acTotal} / ${questionTotal} <br>通过的提交 ${acSubmissions} / ${totalSubmissions} <br>提交通过率 ${ProgressNumber * 100} % <br><img src="${userAvatar}">`;
    payload = `{"operationName":"recentSubmissions","variables":{"userSlug":"${user}"},"query":"query recentSubmissions($userSlug: String!) {\\n  recentSubmissions(userSlug: $userSlug) {\\n    status\\n    lang\\n    question {\\n      questionFrontendId\\n      title\\n      translatedTitle\\n      titleSlug\\n      __typename\\n    }\\n    submitTime\\n    __typename\\n  }\\n}\\n"}`;
    const responseothers = await got({
        method: 'post',
        data: payload,
        url,
        headers: {
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9',
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
            Accept: '*/*',
            Host: 'leetcode-cn.com',
            Connection: 'keep-alive',
        },
    });
    const dataOthers = responseothers.data.data;
    const recentSubmissions = dataOthers.recentSubmissions;
    const dic_lang = {
        A_0: 'C++',
        A_1: 'Java',
        A_2: 'Python',
        A_3: 'MySQL',
        A_4: 'C',
        A_5: 'C#',
        A_6: 'JavaScript',
        A_7: 'Ruby',
        A_8: 'Bash',
        A_9: 'Swift',
        A_10: 'Go',
        A_11: 'Python3',
        A_12: 'Scala',
        A_13: 'Kotlin',
        A_14: 'MS SQL Server',
        A_15: 'Oracle',
        A_16: 'HTML',
        A_17: 'Python ML',
        A_18: 'Rust',
        A_19: 'PHP',
    };
    const dic_status = {
        A_10: 'accepted',
        A_11: 'wrong-answer',
        A_12: 'memory-limit-exceeded',
        A_13: 'output-limit-exceeded',
        A_14: 'time-limit-exceeded',
        A_15: 'runtime-error',
        A_16: 'internal-error',
        A_20: 'compile-error',
        A_30: 'timeout',
    };
    const state = ' 提交记录';
    ctx.state.data = {
        title: userSlug + state,
        link: `https://leetcode-cn.com/u/${user}`,
        description,
        item: recentSubmissions.map((item) => ({
            title: item.question.questionFrontendId + ' ' + item.question.title + ' ' + item.question.translatedTitle,
            description: dic_status[item.status.toString()] + ' ' + dic_lang[item.lang.toString()],
            pubDate: new Date(parseInt(item.submitTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' '),
            link: `https://leetcode-cn.com/problems/${item.question.titleSlug}/`,
        })),
    };
};
