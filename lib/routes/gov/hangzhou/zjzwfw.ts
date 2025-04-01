import logger from '@/utils/logger';

export async function crawler(item: any, browser: any): Promise<string> {
    try {
        let response = '';
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['document', 'script', 'stylesheet', 'xhr'].includes(resourceType)) {
                request.continue();
            } else {
                request.abort();
            }
        });
        await page.goto(item.link, {
            waitUntil: 'networkidle0',
            timeout: 29000,
        });
        const selector = '.item-left .item .title .button';
        await page.evaluate((selector) => document.querySelector(selector).click(), selector);
        await page.waitForSelector('.item-left .item .bg_box div:nth-child(16)', { timeout: 5000 });
        response = await page.content();
        return response || '';
    } catch (error) {
        logger.error('Error when visiting /gov/hangzhou/zwfw:', error);
        return '';
    }
}

export function analyzer(box: any): object {
    return {
        serviceInfo: {
            serviceTarget: box.find('.row:nth(1)>div:nth(1)').find('.inner').children().first().attr('content'),
            processingMethods: box.find('.row:nth(1)>div:nth(3)').find('.inner').text(),
            processingLocation: box.find('.row:nth(2)>div:nth(1)').find('.inner').text(),
            processingTime: box.find('.row:nth(3)>div:nth(1)').find('.inner').text(),
        },
        applicationInfo: {
            acceptanceConditions: box.find('.row:nth(5)>div:nth(1)').find('.inner').text(),
            prohibitedRequirements: box.find('.row:nth(6)>div:nth(1)').find('.inner').text(),
            quantityRestrictions: box.find('.row:nth(7)>div:nth(1)').find('.inner').text(),
        },
        resultInfo: {
            approvalResult: box.find('.row:nth(9)>div:nth(1)').find('.inner').text(),
            approvalSample: box.find('.row:nth(10)>div:nth(1)').find('.inner').html(),
            approvalResultType: box.find('.row:nth(10)>div:nth(3)').find('.inner').text(),
        },
        feeInfo: {
            isThereAFee: box.find('.row:nth(12)>div:nth(1)').find('.inner').text(),
            isOnlinePaymentSupported: box.find('.row:nth(12)>div:nth(3)').find('.inner').text(),
        },
        approvalInfo: {
            authoritySource: box.find('.row:nth(14)>div:nth(1)').find('.inner').text(),
            exerciseLevel: box.find('.row:nth(15)>div:nth(1)').find('.inner').text(),
            implementingEntity: box.find('.row:nth(15)>div:nth(3)').find('.inner').text(),
        },
        deliveryInfo: {
            isLogisticsSupported: box.find('.row:nth(17)>div:nth(1)').find('.inner').text(),
            deliveryTimeframe: box.find('.row:nth(17)>div:nth(3)').find('.inner').text(),
            deliveryMethods: box.find('.row:nth(18)>div:nth(1)').find('.inner').text(),
        },
        agentService: box.find('.row:nth(20)>div:nth(1)').find('.inner').text(),
        otherInfo: {
            departmentName: box.find('.row:nth(22)>div:nth(1)').find('.inner').text(),
            matterType: box.find('.row:nth(22)>div:nth(3)').find('.inner').text(),
            acceptingInstitution: box.find('.row:nth(23)>div:nth(1)').find('.inner').text(),
            basicCode: box.find('.row:nth(24)>div:nth(1)').find('.inner').text(),
            implementationCode: box.find('.row:nth(24)>div:nth(3)').find('.inner').text(),
            scopeOfGeneralHandling: box.find('.row:nth(25)>div:nth(1)').find('.inner').text(),
            documentType: box.find('.row:nth(25)>div:nth(3)').find('.inner').text(),
            decisionMakingAuthority: box.find('.row:nth(26)>div:nth(1)').find('.inner').text(),
            delegatedDepartment: box.find('.row:nth(26)>div:nth(3)').find('.inner').text(),
            onlineProcessingDepth: box.find('.row:nth(27)>div:nth(1)').find('.inner').text(),
            reviewType: box.find('.row:nth(27)>div:nth(3)').find('.inner').text(),
            isItAvailableInTheGovernmentServiceHall: box.find('.row:nth(28)>div:nth(1)').find('.inner').text(),
            isSelfServiceTerminalProcessingSupported: box.find('.row:nth(28)>div:nth(3)').find('.inner').text(),
            isACommitmentSystemImplemented: box.find('.row:nth(29)>div:nth(1)').find('.inner').text(),
            authorityAttribute: box.find('.row:nth(29)>div:nth(3)').find('.inner').text(),
            isAppointmentBookingSupported: box.find('.row:nth(30)>div:nth(1)').find('.inner').text(),
            isOnlineProcessingAvailable: box.find('.row:nth(30)>div:nth(3)').find('.inner').text(),
            naturalPersonThemeClassification: box.find('.row:nth(31)>div:nth(1)').find('.inner').text(),
            legalPersonThemeClassification: box.find('.row:nth(31)>div:nth(3)').find('.inner').text(),
            rightsAndObligationsOfAdministrativeCounterparties: box.find('.row:nth(32)>div:nth(1)').find('.inner').text(),
            applicableObjectDescription: box.find('.row:nth(33)>div:nth(1)').find('.inner').text(),
            contentInvolved: box.find('.row:nth(34)>div:nth(1)').find('.inner').text(),
        },
    };
}
