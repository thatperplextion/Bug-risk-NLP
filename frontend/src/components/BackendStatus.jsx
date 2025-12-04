import React, { useEffect, useState } from 'react'

export default function BackendStatus(){
  const [status, setStatus] = useState('Checking...')

  useEffect(()=>{
    const check = async () => {
      try{
        const res = await fetch('http://localhost:8000/')
        const json = await res.json()
        if(json && json.status === 'ok') setStatus('Backend OK')
        else setStatus('Backend unreachable')
      }catch(e){
        setStatus('Backend unreachable')
      }
    }
    check()
  },[])

  return (<span className="text-xs text-gray-600">{status}</span>)
}
