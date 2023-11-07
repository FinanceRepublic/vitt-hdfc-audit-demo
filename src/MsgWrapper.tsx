import React from 'react'
import Msg from './Msg'
import TableMsg from './TableMsg'

// type Props = {
//   msg:[{transcript:string}]
// }

type Transcript={
  transcript:string
}
type responseData = Transcript[] |[]

export default function MsgWrapper({msg}:{msg:any}) {
    console.log(msg)
  return (
    <div className="msg-wrapper">
        {/* {
        props.msg && props.msg.map((e:Transcript,index:number)=>{
          // console.log(props.msg);
          if(e.transcript.length>0)
          return <Msg text={e.transcript} incoming={true} key={index}/>
        })
        }
         */}
    {msg?.Summary?<TableMsg msg={msg}/>:null}

    </div>
  )
}
