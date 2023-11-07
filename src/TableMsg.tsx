import React, { useEffect } from 'react'

export default function TableMsg({msg}:{msg:any}) {

//    useEffect(()=>{
//     if(!msg)
//     return ;
//     console.log(msg)
//    },[msg])
  return (
    <div className='tableMsg'>
        <h4>{}</h4>
        <table>
        
            <thead>
             <tr>
                <th>
                     <p>Application number</p>
                </th>
                {Object.keys(msg.Summary).map((e:string,i:number)=>{
                    return <th key={i}><p>{e}</p> </th>
                })}
                
            </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>{msg?.output_filename.split('_')[0]}</p>
                    </td>
            {Object.keys(msg.Summary).map((e:string,i:number)=>{
                    return <td key={i*219}>
                            <p>{msg.Summary[e]}</p>
                        </td>
                })}
                </tr>
            </tbody>
        </table>
    </div>
  )
}
