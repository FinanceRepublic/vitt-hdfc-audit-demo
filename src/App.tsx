import { useState,useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './All.css'
import pinkPanther from '../PinkPanther30.wav'
import MsgWrapper from './MsgWrapper';
import { v4 as uuidv4 } from 'uuid';
import TableMsg from './TableMsg';
import hdfcLogo from './assets/hdfc-copy.png'
import vittLogo from './assets/vitt-logo2.png'
import Popup from './Popup';
//import { createFFmpeg} from '@ffmpeg/ffmpeg';


function App() {


  let [msg,setMsg] = useState<any>();
  
  type progressBarType = {
      uploaded:number,
      hidden:boolean 
    }

  let popupBoxInitials = {
    display:false,
    msg:'An Error has been happened',
    error:false
  }
  
  const [audiofile,setAudioFile] = useState<any>("");
  const [pocFile,setPocFile] = useState<any>("")
  const [progress,setProgress] = useState<progressBarType>({uploaded:0,hidden:true});
  const audioPlayerRef = useRef<HTMLAudioElement>(null!);
  const [url1,setUrl1] = useState<string>("")
  
  const [transcriptFileUrl,setTranscriptFileUrl] = useState<{filename:string,url:string}|null>(null)
  const [auditFileUrl,setAuditFileUrl] = useState<{filename:string,url:string}|null>(null)
  const [error,setError] = useState<string|null>(null);
  const [popupBox,setPopupBox] = useState<any>(popupBoxInitials)

  async function base64ToBufferAsync(base64:string,cb:CallableFunction) {
    //console.log(base64)

    var dataUrl = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + base64;
    let data 
    await fetch(dataUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        //console.log("base64 to buffer: " + new Uint8Array(buffer));
       data = new Uint8Array(buffer)
      })
    cb(data)
  }
  function s2ab(s:string,cb:CallableFunction) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    cb(buf)
  }

  function selectAudio(e:any){
    console.log(e.target.files[0]);
    //let audioElement = audioPlayerRef.current;
    //let url = URL.createObjectURL(e.target.files[0])
    
    
    setAudioFile( e.target.files[0] )
    //audioElement.src = url 
    

    // audioElement.addEventListener("load",()=>{
    //   URL.revokeObjectURL(url)
    // })

    //audioElement.play();

  }
  function selectPocFile(e:any){
    console.log("poc file")
    setPocFile(e.target.files[0])
  }
  function setPercentage(event:any){
  
    let percent= (event.loaded/event.total)*100;
    if(percent!=100)
    setProgress({uploaded:Math.round(percent),hidden:false})
    else {
      setProgress({uploaded:100,hidden:false})
      setTimeout(()=>{
        setProgress({uploaded:0,hidden:true})
      },3000)
    }
  }

  function sendToServer(formData:FormData,route:string,cb:CallableFunction){

    if(url1===''){
      setError("Server link cannot be empty")
      return;
    }
    
    // if url contains slash at end 
    let baseUrl = url1[url1.length-1] ==="/" ? url1.substring(0,url1.length-1):url1 
    let url = `${baseUrl}/${route}`
    
    let ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", setPercentage, false);
    ajax.addEventListener("load", (e)=>{
      
      console.log("load",e) 
          
      //setPercentage(numberOfChunks-chunks.length,numberOfChunks)
    }, false);
    ajax.onreadystatechange = () => {
      if (ajax.readyState === 4) {
        //let tempData= JSON.parse(ajax.response)
        //console.log(JSON.parse(ajax.response))
        //return ajax.response;
        cb(ajax.response)
        //console.log('ajax response',tempData);
      }
    }
    ajax.addEventListener("error", (e)=>{
      console.log("error",e)
     // setProgress({uploaded:0,hidden:true})
      setError('Error in sending file')
    }, false);
    ajax.addEventListener("abort", (e)=>{console.log("abort error",e)}, false); 
    console.log(baseUrl,url)
    ajax.open("POST", url); 
    //ajax.timeout = 2000;
    ajax.send(formData);

  }
  async function processAudioFile(audit:boolean,transcript:boolean){
   
    if(!audiofile){
      setError("first select the file")
      return;  
    }
    if(audit===true)
    setAuditFileUrl(null)
    if(transcript===true)
    setTranscriptFileUrl(null)

    console.log(audit,transcript)
    let formData = new FormData(); 
    formData.append("file1",audiofile);
    formData.append("fileName",audiofile.name);
    //@ts-ignore
    formData.append("audit",audit);
    //@ts-ignore
    formData.append("transcript",transcript)

    sendToServer(formData,'send_audio',(result:any)=>{
      // let tempObj = JSON.parse(result)
      
      // tempObj['audit']=audit 
      console.log(result)
      // setMsg(tempObj)
      let parseData = JSON.parse(result)
      setPopupBox({
        display:true,
        msg:parseData.Message,
        error:parseData.Error
      })
      
    })
    
    
  }

  async function processPocFile(){
    
    console.log("passed")
    if(!pocFile){
      setError("first select the file")
      return;  
    }

    let formData = new FormData(); 
    formData.append("file1",pocFile);
    formData.append("fileName",pocFile.name);
    
    sendToServer(formData,'send_excel',(result:any)=>{
      console.log(result)

    })
    
  }

  function checkApplicationFileResult(audit:boolean){
   
    let baseUrl = url1[url1.length-1] ==="/" ? url1.substring(0,url1.length-1):url1 
    let url = `${baseUrl}/send_audio`
     
    fetch(url,{
      method:'POST',
      headers:{
         'Accept':'application.json',
         'Content-Type':'application/json'
      },
      body:JSON.stringify({
          //:base64data.split(',')[1],
          //id:myId,
        filename:audiofile.name,
        audit:audit,
        transcript:!audit,
        check:true,

      }),
      cache:'default',}).then(res=>{
       //  console.log("res from audio server",res)
         return res.json()
      }).then((result)=>{
        
        //setMsg((prev)=>[...prev,...result])
        let msg = {
          data:result.data,
          output_filename:result.output_filename,
          audit:audit,
          Summary:result.Summary
        }
        let popup = {
          display:true,
          msg:result.Message,
          error:result.Error
        }
        
        setPopupBox(popup)
        setMsg(msg)
        console.log(result)
      })

  }
  useEffect(()=>{
    console.log(popupBox)
  },[popupBox])

  useEffect(()=>{
    if(!msg?.data)
      return ;
    //console.log(msg)
      


     base64ToBufferAsync(msg.data,(arrayBuf:ArrayBuffer)=>{
      let blob = new Blob([arrayBuf])
      //console.log(blob)
      let url = URL.createObjectURL(blob)
      //console.log(url)
      if(msg.audit===true)
        setAuditFileUrl({url:url,filename:msg.output_filename})
      else 
        setTranscriptFileUrl({url:url,filename:msg.output_filename})
    });
  },[msg])

  useEffect(()=>{
    if(!audiofile)
      return;
    setMsg(undefined);
    setTranscriptFileUrl(null);
    setAuditFileUrl(null);
  },[audiofile])
  // useEffect(()=>{
  //   var scrolled = false;
  //   function updateScroll(){
  //       if(!scrolled){
  //           var element = document.getElementById("yourDivID");
  //           element.scrollTop = element.scrollHeight;
  //       }
  //   }
  //   $("#yourDivID").on('scroll', function(){
  //     scrolled=true;
  //   });
  // },[])

  useEffect(()=>{
    console.log(audiofile)
  },[audiofile])
  
  useEffect(()=>{
    console.log(url1)
  },[url1])
  
  
  return (
    <div className="App">
        <Popup popupBox={popupBox} setPopupBox={setPopupBox}/>
        <div className='header'>
          <img src={hdfcLogo} className="hdfc"/>
          
          <img src={vittLogo} className="vitt"/>
        </div>
        <h1>PCVC Audit Platform</h1>
      
        <div className='player'>
          {/* <audio controls ref={audioPlayerRef}></audio> */}
          
        </div>
        <p style={{color:"tomato",fontSize:"1.2rem"}}>{error}</p>
        <div>
            <input 
              type="text" 
              placeholder="Enter Server Link" 
              value={url1} 
              onChange={(e)=>{setError("");setUrl1(e.target.value);}} 
            />  
        </div>
        

        <div className="fileInputs">
            <div className='progressive' style={{display:progress.hidden?`none`:'block'}}> 

              <progress className="progressBar" value={progress.uploaded} max="100" ></progress>
              <p>{progress.uploaded}%</p>
            </div>
        </div>
        
        <h4> {audiofile?`Filename :${audiofile.name}`:''}</h4>
        
        <div className='inline'>
                <label htmlFor="fileInput" className='Btn orange'>Select Audio File</label>
                <input 
                  type="file"
                  name="fileInput"
                  id="fileInput"
                  accept=".mp3,.wav,.aac"
                  onChange={(e)=>{selectAudio(e)}} 
                  /> 
              
        </div>
        

        <div className='inline'>
                <button 
                  className={`Btn green ${!audiofile?'disabled':''}`}
                  //disabled={!progress.hidden} 
                  disabled={!audiofile?true:false}
                  onClick={()=>{setError("");processAudioFile(false,true)}}>
                    {/* Perform Transcription */}
                     Upload Audio
                </button>
                <button 
                  className={`Btn purple ${!audiofile?'disabled':''}`}
                  onClick={()=>{setError("");checkApplicationFileResult(false)}} 
                  // style={{color:"black"}}
                  disabled={!audiofile?true:false}
                >
                Check Transcript File

            </button>
                <a className={`Btn downloadBtn ${transcriptFileUrl?'':'disabled'}`}
                    href={transcriptFileUrl?.url}
                    download={!transcriptFileUrl?false:transcriptFileUrl.filename}
                    // style={{backgroundColor:"#4733ff"}} 
                    // disabled={transcriptFile?false:true}
                    
                    >Download Transcript 
                </a>
        </div>
       
        <div className='inline'>
            
            <button 
              className={`Btn green ${!audiofile?'disabled':''}`}
              onClick={()=>{setError("");processAudioFile(true,false)}} 
              // style={{color:"black"}}
              disabled={!audiofile?true:false}
               >
                Perform Audit
            </button>
            <button 
              className={`Btn purple ${!audiofile?'disabled':''}`}
              onClick={()=>{setError("");checkApplicationFileResult(true)}}
              // style={{color:"black"}}
              disabled={!audiofile?true:false}
               >
                Check Audit File

            </button>
            <a
              //Btn downloadBtn ${auditFileUrl?'':'disabled
              className={`Btn downloadBtn ${auditFileUrl?'':'disabled'}`}
              href={auditFileUrl?.url}
              download={!auditFileUrl?false:auditFileUrl.filename}
              // style={{backgroundColor:"#4733ff"}} 
              //disabled={auditFileUrl?auditFileUrl?.filename:true}
              >
                Download Audit Report
            </a>
        </div>
       
        <hr style={{width:"60%",margin:"0 auto"}}/>
        <br/>
        <h4> {pocFile?`Filename :${pocFile.name}`:''}</h4>
        <div className='inline ' >

                <label htmlFor="excelInput" className='Btn orange'>Select POC Application Data</label>
                <input 
                  type="file"
                  name="excelInput"
                  id="excelInput"
                  accept=".xlsx,.xls"
                  onChange={(e)=>{selectPocFile(e)}}
                /> 
                
                <button 
                  className={`Btn green ${pocFile?'':'disabled'}`} 
                  onClick={()=>processPocFile()}>
                    Upload POC data
                </button>
        </div>
        <MsgWrapper msg={msg}/> 
    </div>
  )
}

export default App
