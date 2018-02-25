const request = require('request-promise');
const qs = require('querystring');
const moment = require('moment');

class YoutubeChannel {
    constructor(channelId = '') {
        this.request = request.defaults({
            headers: {
                'accept-language': 'en-US;q=1.0,en;q=0.9',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                'x-chrome-uma-enabled': '1',
                'x-client-data': 'CKS1yQEIibbJAQiktskBCMS2yQEIq5jKAQipncoBCKijygE=',
                'x-spf-previous': `https://www.youtube.com/channel/${channelId}/videos`,
                'x-spf-referer': `https://www.youtube.com/channel/${channelId}/videos`,
                'x-youtube-client-name': '1',
                'x-youtube-client-version': '2.20180222'
            },
            timeout: 30000,
            json: true,
            jar: request.jar()
        });
        this.channelId = channelId;
        if(this.channelId.length === 24) {
            this.LOAD_FIRST_VIDEO = `https://www.youtube.com/channel/${this.channelId}/videos?flow=grid&view=0&pbj=1`;
        } else {
            this.LOAD_FIRST_VIDEO = `https://www.youtube.com/user/${this.channelId}/videos?flow=grid&view=0&pbj=1`;
        }
        this.LOAD_VIDEO_URL = 'https://www.youtube.com/browse_ajax';
        this.EXTRACT_DATE = new RegExp(/(\d+)\s(\w+)\sago/gi);
    }

    __buildQueryUrl(session){
        const query = qs.stringify({
            continuation: session.ctoken,
            ctoken: session.ctoken,
            itct: session.itct
        });
        return `${this.LOAD_VIDEO_URL}?${query}`
    }

    __parseVideo(obj) {
        let date = this.EXTRACT_DATE.exec(obj.gridVideoRenderer.publishedTimeText.simpleText);
        let timestamp = null;
        if(date) {
            timestamp = moment().subtract(date[1], date[2]).valueOf();
        } else {
            date = this.EXTRACT_DATE.exec(obj.gridVideoRenderer.publishedTimeText.simpleText);
            timestamp = moment().subtract(date[1], date[2]).valueOf();
        }
        let compatVideo = {
            id: obj.gridVideoRenderer.videoId,
            title: obj.gridVideoRenderer.title.simpleText,
            thumbnail: obj.gridVideoRenderer.thumbnail.thumbnails[0].url,
            views: parseInt(obj.gridVideoRenderer.viewCountText.simpleText.replace(',', '').replace(' views', '')),
            timestamp
        };
        return compatVideo; 
    }

    async __getFirstVideos() {
        const session = await this.request(this.LOAD_FIRST_VIDEO);
        const videoTab = session[1].response.contents.twoColumnBrowseResultsRenderer.tabs[1];        
        const channelVideo = videoTab.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer
        let tokens = null;
        if(channelVideo.continuations && channelVideo.continuations.length > 0 && channelVideo.continuations[0].nextContinuationData) {
            tokens = {
                itct:  channelVideo.continuations[0].nextContinuationData.clickTrackingParams,
                ctoken: channelVideo.continuations[0].nextContinuationData.continuation
            }; 
        }
        const videosList = channelVideo.items.map(async obj => this.__parseVideo(obj));
        const videos = await Promise.all(videosList);
        return {videos, continuation: tokens};
    }

    async getVideos(continuation) {
        if(!continuation) {
            try {
            let session = await this.__getFirstVideos();
            return session;
            } catch(e) {
                throw new Error('Are you sure that the channel exists ?')
            }
        }
        try {
            const channelVideo = await this.request(this.__buildQueryUrl(continuation));
            let tokens = null;
            if(channelVideo[1].response.continuationContents.gridContinuation.continuations && channelVideo[1].response.continuationContents.gridContinuation.continuations.length > 0) {
                tokens = {
                    itct: channelVideo[1].response.continuationContents.gridContinuation.continuations[0].nextContinuationData.clickTrackingParams,
                    ctoken: channelVideo[1].response.continuationContents.gridContinuation.continuations[0].nextContinuationData.continuation
                };
            }
            const videosList = channelVideo[1].response.continuationContents.gridContinuation.items.map(async obj => this.__parseVideo(obj));
            const videos = await Promise.all(videosList);
            return {videos, continuation: tokens};
        } catch(e) {
            throw new Error('Something goes wrong :-(')
        }
    }
}

module.exports = YoutubeChannel;