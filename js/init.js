function print(x) {
    console.log(x);
}

function init() {
    print("init()")
    video = document.getElementById("webcam");
    var canvas = document.getElementById("capture");
    ctx = canvas.getContext('2d');

    navigator.getUserMedia =
        navigator.getUserMedia 
        || navigator.webkitGetUserMedia 
        || navigator.mozGetUserMedia 
        || navigator.msGetUserMedia 
        || navigator.oGetUserMedia;
 
    if (navigator.getUserMedia) {       
        navigator.getUserMedia({video: true}, handleVideo, videoError);
        print("    usermedia ok!")
    }
 
    function handleVideo(stream) {
        print("handlevideo()");
        var source;
        if (window.webkitURL) {

            source = window.webkitURL.createObjectURL(stream);

        } else {

            source = stream; // Opera and Firefox
        }
        video.src = source;
    }
 
    function videoError(e) {
        print("videoError()");
        print(e);
    }
}

function clicked() {
    print("clicked!");
    ctx.drawImage(video, 0, 0, 500, 375);
}

