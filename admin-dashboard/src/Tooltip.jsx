import { useState } from 'react'

export default function Tooltip({ content, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 ${positions[position]} w-64 px-3 py-2.5 bg-bg-card border border-line rounded-md2 shadow-card`}>
          <p className="text-[12px] leading-relaxed text-ink-2">{content}</p>
          <div className={`absolute w-2 h-2 bg-bg-card border-line transform rotate-45 ${
            position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r' :
            position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l' :
            position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
            'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
          }`} />
        </div>
      )}
    </div>
  )
}
