//
//FFMPEG WASM Section
//
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

 const CreateVideo = async () => {
    const message = document.getElementById('VideoProcessingMessage');
    message.innerHTML = 'Loading ffmpeg-core.js';
    await ffmpeg.load();
    message.innerHTML = 'Loading data';

    for (let i = 0; i < img_urls.length; i += 1) {
        const frame_filename = 'tmp' + i.toString().padStart(4, '0') + ".png";
        ffmpeg.FS('writeFile', frame_filename, await fetchFile(img_urls[i]));
    }
    
    message.innerHTML = 'Start transcoding';
    //await ffmpeg.run('-framerate', '10', '-pattern_type', 'glob', '-i', '*.png', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4');
    await ffmpeg.run('-framerate', '30', '-pattern_type', 'glob', '-i', '*.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4');
    //await ffmpeg.run('-framerate', '30', '-pattern_type', 'glob', '-i', '*.png', 'out.mp4');
    const data = ffmpeg.FS('readFile', 'out.mp4');

    for (let i = 0; i < img_urls.length; i += 1) {
        const frame_filename = 'tmp' + i.toString().padStart(4, '0') + ".png";
        ffmpeg.FS('unlink', frame_filename);
    }

    let video_src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));


    const a = document.createElement('a')
    a.href = video_src
    a.download = video_src.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    message.innerHTML = 'Done!';
  }

const CreateGIF = async () =>{
    const message = document.getElementById('VideoProcessingMessage');
    message.innerHTML = 'Loading ffmpeg-core.js';
    await ffmpeg.load();
    message.innerHTML = 'Loading data';

    for (let i = 0; i < img_urls.length; i += 1) {
      const frame_filename = 'tmp' + i.toString().padStart(4, '0') + ".png";
      ffmpeg.FS('writeFile', frame_filename, await fetchFile(img_urls[i]));
    }
  
    message.innerHTML = 'Start transcoding';
    let max_width = 512;
    let scaled_width = (images[0].width > max_width) ? max_width : images[0].width;
    let filterCommand = "scale=" + scaled_width.toString() + ":-1";
    await ffmpeg.run('-framerate', '5', '-pattern_type', 'glob', '-i', '*.png', '-vf', filterCommand, 'out.gif');
    const data = ffmpeg.FS('readFile', 'out.gif');
    
    for (let i = 0; i < img_urls.length; i += 1) {
        const frame_filename = 'tmp' + i.toString().padStart(4, '0') + ".png";
        ffmpeg.FS('unlink', frame_filename);
    }
  
    let gif_src = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));

    const a = document.createElement('a')
    a.href = gif_src
    a.download = gif_src.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    message.innerHTML = 'Done!';
}
//
//GUI And All the Rest:
//
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

function UpdateFrameDuration(e)
{
    frameDuration = 1000 * parseFloat(e.target.value);
    e.target.labels[0].innerHTML = "Seconds Per Photo: " + (frameDuration/1000).toFixed(2).toString();
     //console.log(frameDuration);});
}

function SortFiles(files)
{
    return [].slice.call(files).sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
    });
}

function AddPlaybackControls()
{
    addControls = false;

    document.getElementById("playbackControls").style.visibility = 'visible';
    document.getElementById("playbackControls").style.pointerEvents = 'auto';

    ShiftAddMoreFilesButton();
    document.getElementById("upload_button").value="Upload A Different Set of Image Files"
}

function ShiftAddMoreFilesButton()
{
    const addMoreFilesButton = document.getElementById('add_button');
    const addMoreFilesInput = document.getElementById('image_appended');
    document.getElementById("UploadDiv").appendChild(addMoreFilesInput);
    document.getElementById("UploadDiv").appendChild(addMoreFilesButton);
}

function CreateImages(files)
{
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

var UploadImageFiles = async ({target: { files } }) => {
    img_urls = [];
    images = [];
    files = SortFiles(files);
    CreateImages(files);
    if(addControls)
    {
        AddPlaybackControls();
    }
}

var AddImageFiles = async ({target: { files } }) => {
    files = SortFiles(files);
    CreateImages(files);
}

function TogglePlay()
{
    isPlaying = !isPlaying;
    document.getElementById("playButton").value = isPlaying ? 'Pause' : 'Play ';
    if(isPlaying)
    {
        frameNum = 0;
        setTimeout(AdvanceFrame, frameDuration);
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
                document.getElementById("playButton").value = isPlaying ? 'Pause' : 'Play ';
            }
        }
        DrawFrame(frameNum);
        setTimeout(AdvanceFrame, frameDuration);
    }
}

const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
canvas.addEventListener("click", TogglePlay);

var frameDuration = 500;
var loopClip = false;

var isPlaying = false;
var frameNum = 0;
var addControls = true;

var img_urls = [];
var images = [];


document.getElementById('upload_button').addEventListener('click', 
    () => document.getElementById('image_uploader').click());
document.getElementById('image_uploader').addEventListener('change', UploadImageFiles);

document.getElementById('add_button').addEventListener('click', 
    () => document.getElementById('image_appended').click());
document.getElementById('image_appended').addEventListener('change', AddImageFiles);

document.getElementById("loopPlayback").addEventListener("change", (e)=>{loopClip = e.target.checked;});
document.getElementById("FrameTime").addEventListener("input", UpdateFrameDuration);
document.getElementById("playButton").addEventListener("click", TogglePlay);

document.getElementById("exportButton").addEventListener("click", CreateVideo)
document.getElementById("exportGIFButton").addEventListener("click", CreateGIF)
