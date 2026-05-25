import { useState } from 'react'
import Sidebar from './Sidebar'
import Radar from './Radar'
import Contacts from './Contacts'
import Audits from './Audits'

export default function App() {
  const [screen, setScreen] = useState('radar')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [preselectedBusiness, setPreselectedBusiness] = useState(null)

  const navigate = (name, opts = {}) => {
    setScreen(name)
    if (opts.business) {
      setSelectedBusiness(opts.business)
      setPreselectedBusiness(opts.business)
    } else if (opts.preselect) {
      setPreselectedBusiness(opts.preselect)
      setSelectedBusiness(null)
    } else {
      setSelectedBusiness(null)
      setPreselectedBusiness(null)
    }
  }

  const screens = {
    radar: (
      <Radar
        selectedBusiness={selectedBusiness}
        onSelectBusiness={(b) => setSelectedBusiness(b)}
        onNavigate={navigate}
      />
    ),
    contacts: <Contacts onNavigate={navigate} />,
    audits: (
      <Audits
        preselectedBusiness={preselectedBusiness}
        onNavigate={navigate}
      />
    ),
  }

  return (
    <div className="flex min-h-screen bg-bg text-ink font-sans">
      <Sidebar active={screen} onNavigate={navigate} />
      <div className="flex-1 flex flex-col min-h-screen">
        {screens[screen]}
      </div>
    </div>
  )
}
