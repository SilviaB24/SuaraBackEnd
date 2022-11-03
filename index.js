var express     = require('express');
var app         = express();
var fs          = require('fs');

app.listen(3000, function() {
    console.log("[NodeJS] Application Listening on Port 3000");
});

app.get('/api/allSongs/', function(req, res) {
    console.log("SONGS LIST");
    let rawMusicData = fs.readFileSync('musicData.json');
    let musicData = JSON.parse(rawMusicData);
    console.log(musicData);
    res.end(JSON.stringify(musicData));
});

app.get('/api/play/:key', function(req, res) {
    console.log("Streaming now")
    var key = req.params.key;

    var music = 'musicFiles/' + key + '.mp3';

    var stat = fs.statSync(music);
    range = req.headers.range;
    var readStream;
    console.log("stat", stat);
    console.log("range", range);

    if (range !== undefined) {
        var parts = range.replace(/bytes=/, "").split("-");
        console.log("parts", parts)
        var partial_start = parts[0];
        var partial_end = parts[1];
        console.log(partial_start, partial_end);

        if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
            return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
        }

        var start = parseInt(partial_start, 10);
        var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
        var content_length = (end - start) + 1;
        console.log(start, end, content_length);

        res.status(206).header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': content_length,
            'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
        });

        readStream = fs.createReadStream(music, {start: start, end: end});
    } else {
        res.header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });
        readStream = fs.createReadStream(music);
    }
    readStream.pipe(res);
    console.log("-------------");
   // console.log(res);
    //console.log(readStream.pipe(res));
});

app.get('/api/download', function(req, res) {

    console.log("Download1");
    res.download("musicFiles", "sofia.mp3", (err) => {
        if (err) console.log(err);
    });
    console.log("Download2");
})
