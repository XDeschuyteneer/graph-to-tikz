function print(x) {
    console.log(x);
}

function init() {
    print("init()")
    var video = document.querySelector("#webcam");
 
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
