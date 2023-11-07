import React, { useEffect } from 'react'
import Recorder from 'recordmp3js/js/recordmp3.js'
//import lamejs from 'lamejs';
//import Lame from './js/Lame'

export default function ConvertAudio() {

  
  function sendToServer(blob:any,url:string){

    let reader = new FileReader()
    reader.onloadend = ()=>{
      let base64data:any = reader.result;
      
      console.log('base64',base64data)
    }
    reader.readAsDataURL(blob)
  }

  function startMediaRecorder(stream:MediaStream){
    let arrayofChunks:any = []
      let mediaRecorder = new MediaRecorder(stream,{
        audioBitsPerSecond:32000
        })
    
    mediaRecorder.ondataavailable = (e)=>{ 
      arrayofChunks.push(e.data)
    }
    
    mediaRecorder.onstop = ()=>{
    
    //let url = `https://asia-south1-utility-range-375005.cloudfunctions.net/save_b64_1`
    //let url = `https://0455-182-72-76-34.ngrok.io`
    sendToServer( new Blob(arrayofChunks,{type:'audio/wav'}),url2 ) 
     arrayofChunks = []
    }
    setTimeout(()=>mediaRecorder.stop(),4000)
    mediaRecorder.start()
    
  }
  function convertSingleChannel({channels, sampleRate},blob){
        
    let reader = new FileReader();
    reader.onload = ()=>{
      var buffer = [];
      let arrayBuffer = reader.result;
      var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      var maxSamples = 1152;
      let samples = new Int16Array(arrayBuffer,0, Math.floor(arrayBuffer.byteLength / 2))
      var remaining = samples.length;

      for (var i = 0; remaining >= maxSamples; i += maxSamples) {
        var mono = samples.subarray(i, i + maxSamples);
        var mp3buf = mp3enc.encodeBuffer(mono);
        if (mp3buf.length > 0) {
            buffer.push(new Int8Array(mp3buf));
        }
        remaining -= maxSamples;
    }
      var d = mp3enc.flush();
      if(d.length > 0){
        buffer.push(new Int8Array(d));
      }

      let localBlob = new Blob(buffer,{type:'audio/mp3'})
      let url = URL.createObjectURL(localBlob);
      
      let a = document.createElement('a')
      a.href= url;
      a.innerText = 'download mp3'
      a.setAttribute('download','')
      document.body.appendChild(a)

      console.log("mp3 url",url)
    }

    reader.readAsArrayBuffer(blob)
   
  }       
  async function convertDoubleChannel({channels, sampleRate},file:File){

    let arrBuf= await file.arrayBuffer()
    let audioctx = new AudioContext()
    var buffer:BinaryData[] = [];
    //let arrayBuffer = reader.result;
    var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
    var maxSamples = 1152;
    

    audioctx.decodeAudioData(arrBuf).then(AudioBuffer=>{
      //let left =  Int16Array.from(AudioBuffer.getChannelData(0))
      //let right = Int16Array.from(AudioBuffer.getChannelData(1))

      var left = AudioBuffer.getChannelData(0);
      var right = AudioBuffer.getChannelData(1);

      var leftInt16Buffer = new Int16Array(left.length);
      var rightInt16Buffer = new Int16Array(right.length);

      for (var i = 0, len = left.length; i < len; i++) {
        if (left[i] < 0) {
            leftInt16Buffer[i] = 0x8000 * left[i];
        } else {
            leftInt16Buffer[i] = 0x7FFF * left[i];
        }

        if (right[i] < 0) {
          rightInt16Buffer[i] = 0x8000 * right[i];
        } else {
          rightInt16Buffer[i] = 0x7FFF * right[i];
        }
      }

      //let left =  Int8Array.from()
      //let right = Int8Array.from(AudioBuffer.getChannelData(1))
      
      console.log("left len",left.length,"right len",right.length);

      let remaining = leftInt16Buffer.length;

      for (var i = 0; remaining >= maxSamples; i += maxSamples) {
        var leftChunk = leftInt16Buffer.subarray(i, i + maxSamples);
        var rightChunk =rightInt16Buffer.subarray(i, i + maxSamples);
        var mp3buf = mp3enc.encodeBuffer(leftChunk,rightChunk);
        
        if (mp3buf.length > 0) {
            buffer.push(mp3buf);
        }
        remaining -= maxSamples;
      }
      var d = mp3enc.flush();
      if(d.length > 0){
        buffer.push(d);
      }

      let blob = new Blob(buffer,{type:'audio/mp3'})
      let url = URL.createObjectURL(blob);
      
      let a = document.createElement('a')
      a.href= url;
      a.innerText = 'download mp3'
      a.setAttribute('download','')
      document.body.appendChild(a)

      console.log("mp3 url",url)

    })
   
  }

  async function getAudioDetails(file:File){
    let buffer= await file.arrayBuffer()
  
    console.log("buffer",buffer) 
    const wavData = lamejs.WavHeader.readHeader(new DataView(buffer));
    console.log(wavData)
    
    if(wavData.channels===1)
    convertSingleChannel(wavData,file)
    else if(wavData.channels===2)
    convertDoubleChannel(wavData,file) 

  }
  async function getChannels(file){
    //let buffer = await file.arrayBuffer();
    //console.log(buffer.getChannelData(0))
    let arrBuf=await file.arrayBuffer()
    let audioctx = new AudioContext()
    
    audioctx.decodeAudioData(arrBuf).then(AudioBuffer=>{
    //  console.log("aud buf 1",Int16Array.from(AudioBuffer.getChannelData(0)))
    //  console.log("aud buf 2",Int16Array.from( AudioBuffer.getChannelData(1) ))
    let left =  Int16Array.from(AudioBuffer.getChannelData(0))
    let right = Int16Array.from(AudioBuffer.getChannelData(1))


    })
  }

  function convertToMp3(audioChunks){
    console.log("function is triggered")
    const audioBlob = new Blob(audioChunks,{ type: 'audio/wav' });
    const reader = new FileReader();


    reader.onload = ()=>{
      const buffer = new Int8Array(reader.result);
      

      const mp3Encoder = new lamejs.Mp3Encoder(1,44100,128);

      const mp3Data = [];
      let remaining = buffer.length;

      const blockSize = 1152; // Can be adjusted for quality/performance tradeoff

      for (let i = 0; remaining >= blockSize; i += blockSize) {
      const left = buffer.subarray(i, i + blockSize);
      const mp3buf = mp3Encoder.encodeBuffer(left);
      mp3Data.push(mp3buf);
      remaining -= blockSize;
      }

    const mp3buf = mp3Encoder.flush();
    mp3Data.push(mp3buf);

    const blob = new Blob(mp3Data, { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    // Perform further actions with the MP3 file (e.g., download or play)
    // Example: create a download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recording.mp3';
    link.innerHTML = 'Download MP3';
    document.body.appendChild(link);
  

  
    }

    reader.readAsArrayBuffer(audioBlob);
  
  }
  function encodeMp3(arrayBuffer) {
    
    const wav = lamejs.WavHeader.readHeader(new DataView(arrayBuffer));
    console.log("i am wav", wav);
    const dataView = new Int16Array(arrayBuffer, wav.dataOffset, wav.dataLen / 2);
    const mp3Encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128);
    const maxSamples = 1152;
  
    console.log("wav", wav);
  
    const samplesLeft =
      wav.channels === 1
        ? dataView
        : new Int16Array(wav.dataLen / (2 * wav.channels));
  
    const samplesRight =
      wav.channels === 2
        ? new Int16Array(wav.dataLen / (2 * wav.channels))
        : undefined;
  
    if (wav.channels > 1) {
      for (var j = 0; j < samplesLeft.length; i++) {
        samplesLeft[j] = dataView[j * 2];
        samplesRight[j] = dataView[j * 2 + 1];
      }
    }
  
    let dataBuffer = [];
    let remaining = samplesLeft.length;
    for (var i = 0; remaining >= maxSamples; i += maxSamples) {
      var left = samplesLeft.subarray(i, i + maxSamples);
      var right;
      if (samplesRight) {
        right = samplesRight.subarray(i, i + maxSamples);
      }
      var mp3buf = mp3Encoder.encodeBuffer(left, right);
      dataBuffer.push(new Int8Array(mp3buf));
      remaining -= maxSamples;
    }
  
    const mp3Lastbuf = mp3Encoder.flush();
    dataBuffer.push(new Int8Array(mp3Lastbuf));
    return dataBuffer;
  }
  function createDownloableLink(blob){
    let url = URL.createObjectURL(blob)

    const link = document.createElement('a');
    link.href = url;
    link.download = 'recording.mp3';
    link.innerHTML = 'Download MP3';
    document.body.appendChild(link);
    
}

  function bufferToWav(abuffer, len) {
    console.log("abuffer", abuffer, len);
    var numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      i,
      sample,
      offset = 0,
      pos = 0;
  
    // write WAVE header
    console.log("pos", pos, length);
    setUint32(0x46464952); // "RIFF"
    console.log("pos", pos, length);
    setUint32(length - 8); // file length - 8
    console.log("pos", pos, length);
    setUint32(0x45564157); // "WAVE"
    console.log("pos", pos, length);
    setUint32(0x20746d66); // "fmt " chunk
    console.log("pos", pos, length);
    setUint32(16); // length = 16
    console.log("pos", pos, length);
    setUint16(1); // PCM (uncompressed)
    console.log("pos", pos, length);
    setUint16(numOfChan);
    console.log("pos", pos, length);
    setUint32(abuffer.sampleRate);
    console.log("pos", pos, length);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    console.log("pos", pos, length);
    setUint16(numOfChan * 2); // block-align
    console.log("pos", pos, length);
    setUint16(16); // 16-bit (hardcoded in this demo)
    console.log("pos", pos, length);
    setUint32(0x61746164); // "data" - chunk
    console.log("pos", pos, length);
    setUint32(length - pos - 4); // chunk length
    console.log("pos", pos, length);
    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));
  
    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }
  
    return buffer;
  
    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }
  
    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }
  function downsampleToWav(file, callback) {
    //Browser compatibility
    // https://caniuse.com/?search=AudioContext
    const AudioContext =
      window.AudioContext || window.webkitAudioContext || AudioContext;
    const audioCtx = new AudioContext();
    const fileReader1 = new FileReader();
    fileReader1.onload = function (ev) {
      // Decode audio
      audioCtx.decodeAudioData(ev.target.result, (buffer) => {
        // this is where you down sample the audio, usually is 44100 samples per second
        const usingWebkit = !window.OfflineAudioContext;
        console.log("usingWebkit", usingWebkit);
        const OfflineAudioContext =
          window.OfflineAudioContext || window.webkitOfflineAudioContext;
        // {
        //   numberOfChannels: 1,
        //   length: 16000 * buffer.duration,
        //   sampleRate: 16000
        // }
        var offlineAudioCtx = new OfflineAudioContext(
          1,
          16000 * buffer.duration,
          16000
        );
  
        let soundSource = offlineAudioCtx.createBufferSource();
        soundSource.buffer = buffer;
        soundSource.connect(offlineAudioCtx.destination);
  
        const reader2 = new FileReader();
        reader2.onload = function (ev) {
          const renderCompleteHandler = function (evt) {
            console.log("renderCompleteHandler", evt, offlineAudioCtx);
            let renderedBuffer = usingWebkit ? evt.renderedBuffer : evt;
            const buffer = bufferToWav(renderedBuffer, renderedBuffer.length);
            if (callback) {
              callback(buffer);
            }
          };
          if (usingWebkit) {
            offlineAudioCtx.addEventListener("complete", renderCompleteHandler);
            offlineAudioCtx.startRendering();
          } else {
            offlineAudioCtx
              .startRendering()
              .then(renderCompleteHandler)
              .catch(function (err) {
                console.log(err);
              });
          }
        };
        reader2.readAsArrayBuffer(file);
  
        soundSource.start(0);
      });
    };
  
    fileReader1.readAsArrayBuffer(file);
  }
  useEffect(()=>{
    let id ;
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream=>{
      const mediaRecorder = new MediaRecorder(stream,{
        audioBitsPerSecond: 128000
      });
      const audioChunks:Blob[] = [];

      mediaRecorder.ondataavailable=(e)=>{
        audioChunks.push(e.data);
      }

      mediaRecorder.onstop=()=>{
        downsampleToWav(new Blob(audioChunks,{type:"audio/ogg"}),buffer=>{
          const mp3Buffer = encodeMp3(buffer)
          const blob = new Blob(mp3Buffer,{type:"audio/mp3"});
          
          createDownloableLink(blob)
        })


      }
      
      setTimeout(()=>{
        mediaRecorder.stop();
      },10000)

      mediaRecorder.start()
    }).catch(err=>{
      console.log(err);
    })

    return 
  },[])

  useEffect(()=>{
    function getAudioInfo() {
      let mimeType;
      let ext;
      if (window.MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
        ext = "ogg";
      } else if (window.MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
        ext = "webm";
      } else if (window.MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
        ext = "m4a";
      }
    
      return { mimeType, ext };
    }
    console.log("browser support",getAudioInfo())
  },[])
  return (
    <>
    <input 
                  type="file" 
                  name="fileInput" 
                  id="fileInput" 
                  accept=".mp3,.wav,.aac" 
                  onChange={(e)=>getAudioDetails(e.target.files[0])} 
                  /> 
    <button >Push blob</button>
    </>
  )
}
