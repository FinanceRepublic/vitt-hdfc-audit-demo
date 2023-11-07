import React from 'react'


type Incoming ={
    incoming:boolean
}
type Outgoing = {
    outgoing:boolean 
}
type IncomingMsg ={
    text:string,
}& Incoming 

type OutgoingMsg = {
    text:string,
}& Outgoing

type Msg = OutgoingMsg | IncomingMsg


export default function Msg(props:Msg) {
  return (
    <div className='msg'>
        {props.text}
    </div>
  )
}
