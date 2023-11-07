import React from 'react'

export default function Popup({popupBox,setPopupBox}:{popupBox:any,setPopupBox:any}) {
    //green rgb(0, 214, 0)
    // red rgb(255, 80, 11);
     // console.log(popupBox)
  return (
    <div className='popup' 
        style={{
            display:popupBox.display?"flex":"none",
            backgroundColor: popupBox.error?"rgb(255, 80, 11)":"white"
            }}>
            <p 
            style={{color:popupBox.error?'white':'black'}}
            >
                {popupBox.msg} 
            </p>
            <button 
                onClick={()=>setPopupBox({...popupBox,display:false})}
                //style={{borderColor:popupBox.error?'rgb(255, 80, 11)':'rgb(0, 214, 0)'}}
                >Ok
            </button>
        
    </div>
  )
}
