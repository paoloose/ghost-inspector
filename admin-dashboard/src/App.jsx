import { useState } from 'react'
import Sidebar from './Sidebar'
import Radar from './Radar'
import Contacts from './Contacts'
import Audits from './Audits'
import GhostShopperTour from './GhostShopperTour'
import AuditsTour from './AuditsTour'

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
      <div id="radar-page">
        <Radar
          selectedBusiness={selectedBusiness}
          onSelectBusiness={(b) => setSelectedBusiness(b)}
          onNavigate={navigate}
        />
      </div>
    ),
    contacts: (
      <div id="contacts-page">
        <Contacts onNavigate={navigate} />
      </div>
    ),
    audits: (
      <div id="audits-page">
        <Audits
          preselectedBusiness={preselectedBusiness}
          onNavigate={navigate}
        />
        <AuditsTour />
      </div>
    ),
  }

  return (
    <div className="flex min-h-screen bg-bg text-ink font-sans">
      <GhostShopperTour />
      <Sidebar active={screen} onNavigate={navigate} />
      <div className="flex-1 flex flex-col min-h-screen">
        {screens[screen]}
      </div>
    </div>
  )
}
