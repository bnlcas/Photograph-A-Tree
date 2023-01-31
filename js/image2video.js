//
//FFMPEG WASM Section
//
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

ffmpeg.setProgress(({ ratio }) => {
    const progressBar = document.getElementById("ProgressSlider");
    progressBar.value = ratio;
});

 const CreateVideo = async () => {
    const message = document.getElementById('VideoProcessingMessage');
    if(!ffmpeg.isLoaded())
    {
        message.innerHTML = 'Loading ffmpeg-core.js';
        await ffmpeg.load();
    }
    message.innerHTML = 'Loading data';

    const targetEncoding = Mode(img_extensions);


    for (let i = 0; i < img_urls.length; i += 1) {
        const frame_filename = 'tmp' + i.toString().padStart(4, '0') + "." + img_extensions[i];
        ffmpeg.FS('writeFile', frame_filename, await fetchFile(img_urls[i]));
    }
    
    for (let i = 0; i < img_urls.length; i += 1) {
        if(img_extensions[i] != targetEncoding)
        {
            const frame_filename_in = 'tmp' + i.toString().padStart(4, '0') + "." + img_extensions[i];
            const frame_filename_out = 'tmp' + i.toString().padStart(4, '0') + "." + targetEncoding;
            await ffmpeg.run('-i', frame_filename_in, frame_filename_out)
        }
    }
    
    message.innerHTML = 'Start transcoding';
    let frameRate = Math.ceil(1000/frameDuration).toString();
    //await ffmpeg.run('-framerate', '10', '-pattern_type', 'glob', '-i', '*.png', 'copy', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4');
    await ffmpeg.run('-framerate', frameRate, '-pattern_type', 'glob', '-i', '*.' + targetEncoding, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4');
    //await ffmpeg.run('-framerate', '30', '-pattern_type', 'glob', '-i', '*.png', 'out.mp4');
    const data = ffmpeg.FS('readFile', 'out.mp4');

    for (let i = 0; i < img_urls.length; i += 1) {
        const frame_filename = 'tmp' + i.toString().padStart(4, '0') + "." + img_extensions[i];
        ffmpeg.FS('unlink', frame_filename);
        if(img_extensions[i] != targetEncoding)
        {
            const reencoded_filename = 'tmp' + i.toString().padStart(4, '0') + "." + targetEncoding;
            ffmpeg.FS('unlink', reencoded_filename);
        }
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

const Mode = (inputArray) =>
inputArray.reduce(
    (a,b,i,arr)=>
     (arr.filter(v=>v===a).length>=arr.filter(v=>v===b).length?a:b),
    null)

const CreateGIF = async () =>{
    const message = document.getElementById('VideoProcessingMessage');
    if(!ffmpeg.isLoaded())
    {
        message.innerHTML = 'Loading ffmpeg-core.js';
        await ffmpeg.load();
    }
    message.innerHTML = 'Loading data';

    for (let i = 0; i < img_urls.length; i += 1) {
      const frame_filename = 'tmp' + i.toString().padStart(4, '0') + "." + img_extensions[i];
      ffmpeg.FS('writeFile', frame_filename, await fetchFile(img_urls[i]));
    }
    console.log('images written')
    
    const targetEncoding = Mode(img_extensions);
    
    for (let i = 0; i < img_urls.length; i += 1) {
        if(img_extensions[i] != targetEncoding)
        {
            const frame_filename_in = 'tmp' + i.toString().padStart(4, '0') + "." + img_extensions[i];
            const frame_filename_out = 'tmp' + i.toString().padStart(4, '0') + "." + targetEncoding;
            await ffmpeg.run('-i', frame_filename_in, frame_filename_out)
        }
    }
    
    message.innerHTML = 'Start transcoding';

    let frameRate = Math.ceil(1000/frameDuration).toString();
    let max_width = 512;
    let scaled_width = (images[0].width > max_width) ? max_width : images[0].width;
    let filterCommand = "scale=" + scaled_width.toString() + ":-1";
    await ffmpeg.run('-framerate', frameRate, '-pattern_type', 'glob', '-i', '*.' + targetEncoding, '-vf', filterCommand, 'out.gif');

    const data = ffmpeg.FS('readFile', 'out.gif');
    
    for (let i = 0; i < img_urls.length; i += 1) {
        const frame_filename = 'tmp' + i.toString().padStart(4, '0') + "." + img_extensions[i];
        ffmpeg.FS('unlink', frame_filename);
        if(img_extensions[i] != targetEncoding)
        {
            const reencoded_filename = 'tmp' + i.toString().padStart(4, '0') + "." + targetEncoding;
            ffmpeg.FS('unlink', reencoded_filename);
        }
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
    let displayAspect = window.innerWidth / window.innerHeight;
    let imageAspect = images[ind].width / images[ind].height;
    let canvasYScale = Math.min(0.9 * displayAspect, 0.7);

    canvas.height = parseInt(canvasYScale * window.innerHeight);
    canvas.width = parseInt(canvas.height * imageAspect);
    ctx.drawImage(images[ind], 0, 0,images[ind].width, images[ind].height, 0, 0, canvas.width, canvas.height);
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
        //console.log(files[i])
        let src_url = URL.createObjectURL(files[i]);

        let extension = files[i]['name'].split('.')[1].toLowerCase();
        extension = (extension == "jpeg") ? "jpg" : extension;
        
        img_extensions.push(extension);
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
    img_extensions = [];
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

var frameDuration = 250;
var loopClip = true;

var isPlaying = false;
var frameNum = 0;
var addControls = true;

var img_urls = [];
var img_extensions = [];
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
