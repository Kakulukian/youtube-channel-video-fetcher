# Youtube Channel Video Fetcher
This module allows you to retrieve all video informations from a channel without using official Youtube API.
## Install

```bash
npm install --save youtube-channel-video-fetcher
```
## Table of contents

- [Cheat Sheet](#cheat-sheet)
- [More Examples](#more-examples)
- [Configuration](#configuration)
- [Licence](#licence)

## Cheat Sheet

```js
const YoutubeChannel = require('youtube-channel-video-fetcher');
```

### Fetch videos
```js
const YoutubeChannel = new YoutubeChannel('channelId');
const scrapeChannel = (continuation) => {
    return new Promise((resolve, reject) => {
        YoutubeChannel.getVideo(continuation).then(function(videos) {
            if(videos.continuation !== 0) {
                resolve(scrapeChannel(videos.continuation));
            }
            console.log(posts);
        });
    });
};
scrapeChannel();
```

## More examples in async/await
To see more examples, click [here](https://github.com/Kakulukian/node-jeuxvideo-bot-api/blob/master/example/README.md)

## Configuration
| Param | Type | Default | Description |
| --- | --- | --- | --- |
| channelId | <code>String</code> | Empty | Channel id or username|
## License

**The MIT License (MIT)**

Copyright (c) 2018 Kakulukian