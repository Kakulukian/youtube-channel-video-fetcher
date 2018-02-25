const YoutubeChannel = require('youtube-channel-video-fetcher');

if(process.argv.length < 3) return console.warn('Missing channel argument !');

const ytc = new YoutubeChannel(process.argv[2]);

;(async () => {
    let continuation = null;
    let videos = [];
    do {
        const videoPage = await ytc.getVideos(continuation);
        continuation = videoPage.continuation;
        videos = videos.concat(videoPage.videos);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);    
        process.stdout.write(`Fetched ${videos.length} videos from channel ${process.argv[2]} ...`);     
    } while(continuation);
})();