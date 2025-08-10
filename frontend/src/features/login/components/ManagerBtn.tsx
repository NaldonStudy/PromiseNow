import React from 'react'

interface Props {
    onLogin1: () => void;
    onLogin2: () => void;
}
const ManagerBtn = ({onLogin1, onLogin2}:Props) => {
  return (
    <div className="flex flex-row gap-10">
        <button className="bg-blue-300 w-20 h-10" onClick={onLogin1}>
          유저 1
        </button>
        <button className="bg-green-300 w-20 h-10" onClick={onLogin2}>
          유저 2
        </button>
      </div>
  )
}

export default ManagerBtn