import { useState,useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './All.css'
import pinkPanther from '../PinkPanther30.wav'
import MsgWrapper from './MsgWrapper';
import { v4 as uuidv4 } from 'uuid';

function App2() {

  let [recordingOn,setRecordingOn] = useState<boolean>(false);
  //let recordingOn:boolean = true;
  let myId:string = uuidv4();
  
  type Transcript = {
    transcript:string
  }

  type responseData = Transcript[] |[]
  
  type progressBarType = {
      uploaded:number,
      hidden:boolean 
    }

  const [count, setCount] = useState(0)
  const [audiofile,setAudioFile] = useState<any>("");
  const [progress,setProgress] = useState<progressBarType>({uploaded:0,hidden:true})
  const audioPlayerRef = useRef<HTMLAudioElement>(null!)
  const [url1,setUrl1] = useState<string>("https://d254-182-72-76-34.ngrok.io")
  const [url2,setUrl2] = useState<string>("https://d254-182-72-76-34.ngrok.io") 
  const [msg,setMsg] = useState<responseData>([])

  function selectAudio(e:any){
    console.log(e.target.files[0]);
    let audioElement = audioPlayerRef.current;
    let url = URL.createObjectURL(e.target.files[0])
    
    
    setAudioFile( e.target.files[0] )
    audioElement.src = url 
    

    audioElement.addEventListener("load",()=>{
      URL.revokeObjectURL(url)
    })

    audioElement.play();

  }

  function setPercentage(number:number,total:number){
    number++;
    let percent= (number/total)*100;
    if(percent!=100)
    setProgress({uploaded:Math.round(percent),hidden:false})
    else {
      setProgress({uploaded:100,hidden:false})
      setTimeout(()=>{
        setProgress({uploaded:0,hidden:true})
      },3000)
    }
  }

  
  function sendFileToServer(chunks:BinaryType[],fileName:string,numberOfChunks:number){
    console.log(chunks.length)
    if(chunks.length===0 || chunks.length<0 )
      return;

    let formData = new FormData(); 
    formData.append("file1",chunks[0]);
    formData.append("count",(numberOfChunks-chunks.length).toString());
    formData.append("fileName",fileName);

    let ajax = new XMLHttpRequest();
    //ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", (e)=>{
      let [a,...rest] = chunks 
      console.log("load",e) 
      sendFileToServer([...rest],fileName,numberOfChunks)    
      setPercentage(numberOfChunks-chunks.length,numberOfChunks)
    }, false);
    ajax.onreadystatechange = () => {
      if (ajax.readyState === 4) {
        console.log('ajax response',ajax.response);
      }
    }
    ajax.addEventListener("error", (e)=>{
      
      console.log("error",e)
      setProgress({uploaded:0,hidden:true})
    }, false);
    ajax.addEventListener("abort", (e)=>{console.log("abort error",e)}, false);

    ajax.open("POST", url1); 
    //ajax.timeout = 2000;

    ajax.send(formData);


    // request.onreadystatechange = function()
    // {
    //     if (request.readyState == 4 && request.status == 200)
    //     {
    //         callback(request.responseText); // Another callback here
    //     }
    // }; 
    
  }
  function processingFile(){
    
    let chunks = [];
    let maxChunksSize = 2 //in MB
    let fileSizeInBytes = audiofile.size;
    let byteIndex =0;
    let fileSizeInMb = fileSizeInBytes/1000000
    let nearestDivisibleNumber = Math.floor(fileSizeInMb/maxChunksSize)
    let numberOfChunks = nearestDivisibleNumber;
    
    if(fileSizeInMb % maxChunksSize!=0){
      numberOfChunks+1;
    }


    for (var i = 0; i < numberOfChunks; i += 1) {
      var byteEnd = Math.ceil((fileSizeInBytes / numberOfChunks) * (i + 1));
      chunks.push(audiofile.slice(byteIndex, byteEnd));
      byteIndex += (byteEnd - byteIndex);
    }
    console.log("i am chunks",chunks)
    setProgress({uploaded:0,hidden:false})
    sendFileToServer(chunks,audiofile.name,numberOfChunks)
    
    // chunks.forEach(async (chunk,index)=>{
    //   await 
    //   setPercentage(index,numberOfChunks)
    // })
    //console.log(`i am file`,e.target.files[0])
  }

  function sendToServer(blob:any,url:string){

    let reader = new FileReader()
    reader.onloadend = ()=>{
      let base64data:any = reader.result;
      
      fetch(url,{
        method:'POST',
        headers:{
           'Accept':'application.json',
           'Content-Type':'application/json'
        },
        body:JSON.stringify({
            audio_string:base64data.split(',')[1],
            id:myId,
        }),
        cache:'default',}).then(res=>{
           console.log("res from audio server",res)
           return res.json()
        }).then((result)=>{
          console.log(result)
        })

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
  
  useEffect(()=>{
    let id:number;
    if(recordingOn ===true){
      navigator.mediaDevices.getUserMedia({
        audio:true
      }).then(stream=>{
        
        id = setInterval(()=>{
          console.log('recording is ',recordingOn)
          startMediaRecorder(stream)
        },4000)
        
      })
      
    }
    return()=>clearInterval(id)
  },[recordingOn])

  return (
    <div className="App">
        <h1>File sending & transcription Project</h1>
      
        <div className='player'>
          <audio controls ref={audioPlayerRef}></audio>
          <h4>{audiofile.name}</h4>
        </div>
        <div>
            <input 
              type="text" 
              placeholder="Enter url for big file" 
              value={url1} 
              onChange={(e)=>setUrl1(e.target.value)} 
              />
        </div>
        <div className="fileInputs">
            
            <div>
            
              <label htmlFor="fileInput">Select Audio File</label>
                <input 
                  type="file" 
                  name="fileInput" 
                  id="fileInput" 
                  accept=".mp3,.wav,.aac" 
                  onChange={(e)=>selectAudio(e)} 
                  /> 
                <button disabled={!progress.hidden} onClick={()=>processingFile()}>Upload</button>
            </div>
            
            <div className='progressive' style={{display:progress.hidden?`none`:'block'}}> 

              <progress className="progressBar" value={progress.uploaded} max="100" ></progress>
              <p>{progress.uploaded}%</p>
            </div>
        </div>
        <div>
          <input 
              type="text" 
              placeholder="Enter url for base64" 
              value={url2} 
              onChange={(e)=>setUrl2(e.target.value)} 
            />
        </div>
        <div className='recording'>
          <button className='recordBtn'
            style={{backgroundColor:recordingOn?'red':'rgb(80 31 159)'}} 
            onClick={()=>setRecordingOn((prev)=>!prev) }
            >{recordingOn? `Recording...`:`Start Recording`}
          </button>
        </div>
      <MsgWrapper msg={msg}/>
    </div>
  )
}

export default App2
