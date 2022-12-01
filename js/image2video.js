const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const image2video = async () => {
  const message = document.getElementById('message');
  message.innerHTML = 'Loading ffmpeg-core.js';
  await ffmpeg.load();
  message.innerHTML = 'Loading data';
  for (let i = 0; i < 60; i += 1) {
    const num = `00${i}`.slice(-3);
    ffmpeg.FS('writeFile', `tmp.${num}.png`, await fetchFile('./assets/triangle/tmp.${num}.png'));
  }

  message.innerHTML = 'Start transcoding';
  await ffmpeg.run('-framerate', '10', '-pattern_type', 'glob', '-i', '*.png', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4');
  const data = ffmpeg.FS('readFile', 'out.mp4');
  for (let i = 0; i < 60; i += 1) {
    const num = `00${i}`.slice(-3);
    ffmpeg.FS('unlink', `tmp.${num}.png`);
  }

  const video = document.getElementById('output-video');
  video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
}
const elm = document.getElementById('start-btn');
elm.addEventListener('click', image2video);

//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf
//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf
//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf
//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf
//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf//asdf


var totalfiles;
function UploadFiles()
{
    var totalfiles = document.getElementById('files').files.length;

}

function DrawFrame(ind)
{
    canvas.width = images[ind].width;
    canvas.height = images[ind].height;
    ctx.drawImage(images[ind], 0, 0,images[ind].width, images[ind].height );
}

function UpdatePreview()
{
    frameNum = 0;
    DrawFrame(frameNum);
}

var img_urls = [];
var images = [];
var AddImageFiles = async ({target: { files } }) => {
    files = [].slice.call(files).sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
    })

    for(var i = 0; i < files.length; i++)
    {   
        let src_url = URL.createObjectURL(files[i]);
        img_urls.push(src_url);
        let img = new Image();
        img.src = src_url;
        images.push(img);
    }
    images[files.length - 1].onload = function() {
        UpdatePreview();
    };
}



function TogglePlay()
{
    isPlaying = !isPlaying;
    if(isPlaying)
    {
        if(frameNum == img_urls.length - 1)
        {
            frameNum = 0;
        }
        setTimeout(AdvanceFrame, frameDuration);
    }
    else
    {

    }
}

function AdvanceFrame()
{
    if(isPlaying)
    {
        frameNum += 1;
        if(frameNum >= img_urls.length)
        {
            if(loopClip)
            {
                frameNum = 0;
            }
            else
            {
                frameNum -= 1;
                isPlaying = false;
            }
        }
        DrawFrame(frameNum);
        setTimeout(AdvanceFrame, frameDuration);
    }
}



//document.getElementById('uploadButton').addEventListener('change', SetFileAddress);// transcode);

//document.getElementById('uploadButton').addEventListener('onclick',UploadFiles );



document.getElementById('image_uploader').addEventListener('change', AddImageFiles);


const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
canvas.addEventListener("click", TogglePlay);

var frameDuration = 500;
var loopClip = false;

var isPlaying = false;
var frameNum = 0;

