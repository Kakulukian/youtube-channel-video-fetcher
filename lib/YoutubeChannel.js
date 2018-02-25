'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var request = require('request-promise');
var qs = require('querystring');
var moment = require('moment');

class YoutubeChannel {
    constructor() {
        var channelId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

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
        if (this.channelId.length === 24) {
            this.LOAD_FIRST_VIDEO = `https://www.youtube.com/channel/${this.channelId}/videos?flow=grid&view=0&pbj=1`;
        } else {
            this.LOAD_FIRST_VIDEO = `https://www.youtube.com/user/${this.channelId}/videos?flow=grid&view=0&pbj=1`;
        }
        this.LOAD_VIDEO_URL = 'https://www.youtube.com/browse_ajax';
        this.EXTRACT_DATE = new RegExp(/(\d+)\s(\w+)\sago/gi);
    }

    __buildQueryUrl(session) {
        var query = qs.stringify({
            continuation: session.ctoken,
            ctoken: session.ctoken,
            itct: session.itct
        });
        return `${this.LOAD_VIDEO_URL}?${query}`;
    }

    __parseVideo(obj) {
        var date = this.EXTRACT_DATE.exec(obj.gridVideoRenderer.publishedTimeText.simpleText);
        var timestamp = null;
        if (date) {
            timestamp = moment().subtract(date[1], date[2]).valueOf();
        } else {
            date = this.EXTRACT_DATE.exec(obj.gridVideoRenderer.publishedTimeText.simpleText);
            timestamp = moment().subtract(date[1], date[2]).valueOf();
        }
        var compatVideo = {
            id: obj.gridVideoRenderer.videoId,
            title: obj.gridVideoRenderer.title.simpleText,
            thumbnail: obj.gridVideoRenderer.thumbnail.thumbnails[0].url,
            views: parseInt(obj.gridVideoRenderer.viewCountText.simpleText.replace(',', '').replace(' views', '')),
            timestamp
        };
        return compatVideo;
    }

    __getFirstVideos() {
        var _this = this;

        return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
            var session, videoTab, channelVideo, tokens, videosList, videos;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return _this.request(_this.LOAD_FIRST_VIDEO);

                        case 2:
                            session = _context2.sent;
                            videoTab = session[1].response.contents.twoColumnBrowseResultsRenderer.tabs[1];
                            channelVideo = videoTab.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].gridRenderer;
                            tokens = null;

                            if (channelVideo.continuations && channelVideo.continuations.length > 0 && channelVideo.continuations[0].nextContinuationData) {
                                tokens = {
                                    itct: channelVideo.continuations[0].nextContinuationData.clickTrackingParams,
                                    ctoken: channelVideo.continuations[0].nextContinuationData.continuation
                                };
                            }
                            videosList = channelVideo.items.map(function () {
                                var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(obj) {
                                    return regeneratorRuntime.wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    return _context.abrupt('return', _this.__parseVideo(obj));

                                                case 1:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, _this);
                                }));

                                return function (_x2) {
                                    return _ref.apply(this, arguments);
                                };
                            }());
                            _context2.next = 10;
                            return Promise.all(videosList);

                        case 10:
                            videos = _context2.sent;
                            return _context2.abrupt('return', { videos, continuation: tokens });

                        case 12:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this);
        }))();
    }

    getVideos(continuation) {
        var _this2 = this;

        return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
            var session, channelVideo, tokens, videosList, videos;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (continuation) {
                                _context4.next = 5;
                                break;
                            }

                            _context4.next = 3;
                            return _this2.__getFirstVideos();

                        case 3:
                            session = _context4.sent;
                            return _context4.abrupt('return', session);

                        case 5:
                            _context4.next = 7;
                            return _this2.request(_this2.__buildQueryUrl(continuation));

                        case 7:
                            channelVideo = _context4.sent;
                            tokens = null;

                            if (channelVideo[1].response.continuationContents.gridContinuation.continuations && channelVideo[1].response.continuationContents.gridContinuation.continuations.length > 0) {
                                tokens = {
                                    itct: channelVideo[1].response.continuationContents.gridContinuation.continuations[0].nextContinuationData.clickTrackingParams,
                                    ctoken: channelVideo[1].response.continuationContents.gridContinuation.continuations[0].nextContinuationData.continuation
                                };
                            }
                            videosList = channelVideo[1].response.continuationContents.gridContinuation.items.map(function () {
                                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(obj) {
                                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                        while (1) {
                                            switch (_context3.prev = _context3.next) {
                                                case 0:
                                                    return _context3.abrupt('return', _this2.__parseVideo(obj));

                                                case 1:
                                                case 'end':
                                                    return _context3.stop();
                                            }
                                        }
                                    }, _callee3, _this2);
                                }));

                                return function (_x3) {
                                    return _ref2.apply(this, arguments);
                                };
                            }());
                            _context4.next = 13;
                            return Promise.all(videosList);

                        case 13:
                            videos = _context4.sent;
                            return _context4.abrupt('return', { videos, continuation: tokens });

                        case 15:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this2);
        }))();
    }
}

module.exports = YoutubeChannel;