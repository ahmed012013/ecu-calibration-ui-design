'use client'

import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, ChevronDown, ChevronRight, CircleHelp, Crosshair, Database, Download, Gauge, GitBranch, Layers3, Menu, Minus, PanelRight, Play, Plus, RotateCcw, Search, Settings2, SlidersHorizontal, Terminal, Upload, Waves, X } from 'lucide-react'

type MapGroup = { label: string; icon: typeof Activity; children: string[] }

const groups: MapGroup[] = [
  { label: 'Ignition', icon: Activity, children: ['Main Ignition Map', 'Cold Start Advance', 'Knock Retard Limit'] },
  { label: 'Fuel', icon: Waves, children: ['VE Main Fuel', 'Target Lambda', 'Injector Deadtime'] },
  { label: 'Boost', icon: Gauge, children: ['Boost Target', 'Wastegate Duty', 'Overboost Protection'] },
  { label: 'Torque Management', icon: SlidersHorizontal, children: ['Driver Demand', 'Torque Limits'] },
  { label: 'Idle Control', icon: GitBranch, children: ['Idle Base Position', 'Idle Airflow Trim'] },
]

const grid = [
  [0.18, 0.2, 0.22, 0.25, 0.3, 0.34, 0.4, 0.48, 0.55, 0.64, 0.72, 0.78],
  [0.2, 0.23, 0.26, 0.3, 0.37, 0.44, 0.53, 0.62, 0.72, 0.8, 0.86, 0.9],
  [0.25, 0.29, 0.33, 0.39, 0.47, 0.56, 0.66, 0.75, 0.83, 0.9, 0.95, 0.97],
  [0.3, 0.35, 0.4, 0.47, 0.56, 0.65, 0.74, 0.83, 0.9, 0.95, 0.98, 0.99],
  [0.36, 0.41, 0.47, 0.54, 0.63, 0.72, 0.81, 0.89, 0.94, 0.97, 0.99, 1],
  [0.42, 0.48, 0.54, 0.61, 0.7, 0.78, 0.86, 0.92, 0.96, 0.99, 1, 1],
  [0.48, 0.54, 0.6, 0.67, 0.75, 0.82, 0.89, 0.94, 0.98, 1, 1, 1],
  [0.54, 0.6, 0.66, 0.73, 0.8, 0.87, 0.93, 0.97, 1, 1, 1, 1],
]

function heatColor(v: number) {
  const hue = 142 - v * 142
  return `hsl(${hue} 68% ${24 + v * 20}%)`
}

function SurfacePreview() {
  const lines = useMemo(() => Array.from({ length: 12 }, (_, i) => i), [])
  return (
    <div className="surface-panel">
      <div className="surface-toolbar"><span>3D SURFACE / PERSPECTIVE</span><span className="mono">ROTATE <b>RMB</b> · ZOOM <b>SCROLL</b></span></div>
      <div className="surface-canvas" role="img" aria-label="Wireframe surface visualizer for main ignition map">
        <div className="surface-grid plane-a" />
        <div className="surface-grid plane-b" />
        <div className="surface-ribbon">{lines.map((i) => <i key={i} style={{ transform: `translateY(${i * 8}px) rotate(${i * 1.6 - 8}deg)`, opacity: 0.24 + i * 0.045 }} />)}</div>
        <div className="axis axis-x">RPM →</div><div className="axis axis-y">LOAD ↑</div><div className="axis axis-z">ADVANCE °</div>
        <div className="surface-crosshair"><Crosshair /></div>
        <div className="surface-readout"><span>CURSOR</span><strong>4,250 RPM</strong><strong>68 kPa</strong><em>18.4°</em></div>
      </div>
      <div className="surface-status"><span><span className="dot green" />LIVE PREVIEW</span><span>V-AXIS: 0° → 40°</span><span>VERTEX COUNT: 96</span></div>
    </div>
  )
}

export default function Page() {
  const [open, setOpen] = useState<Record<string, boolean>>({ Ignition: true, Fuel: true, Boost: true })
  const [selected, setSelected] = useState('Main Ignition Map')
  const [sidebar, setSidebar] = useState(true)
  const [edited, setEdited] = useState(false)
  const [activeCell, setActiveCell] = useState('4-8')
  const [activeView, setActiveView] = useState<'surface' | 'table' | 'hex'>('surface')
  const [activeTab, setActiveTab] = useState<'calibration' | 'diagnosis'>('calibration')
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [logs, setLogs] = useState([
    { time: '14:22:08.421', level: 'INFO', tone: 'event-ok', text: 'Map loaded successfully · checksum 0xA31C' },
    { time: '14:21:54.102', level: 'WARN', tone: 'event-warn', text: 'Unsaved changes detected in Main Ignition Map' },
    { time: '14:20:11.890', level: 'SYNC', tone: 'event-cyan', text: 'ECU handshake complete · 1.2 Mbps' },
  ])
  const [cellValue, setCellValue] = useState('24.2')

  const logEvent = (text: string, level = 'INFO', tone = 'event-ok') => {
    const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLogs((current) => [{ time: `${now}.000`, level, tone, text }, ...current].slice(0, 8))
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark">M</div><div><div className="brand-name">MOTEC<span>LAB</span></div><div className="brand-sub">CALIBRATION WORKSPACE <span className="status-live">● ONLINE</span></div></div></div>
        <div className="project-path"><span>PROJECT / S15_SR20DET</span><ChevronRight /><strong>MAPS / IGNITION</strong><ChevronRight /><strong>MAIN IGNITION MAP</strong></div>
        <div className="top-actions"><button aria-label="Search"><Search /></button><button aria-label="Upload file"><Upload /></button><button aria-label="Download file"><Download /></button><button className="avatar">AK</button></div>
      </header>
      <div className={`workspace ${activeTab === 'diagnosis' ? 'diagnosis-mode' : 'calibration-mode'}`}>
        {sidebar && <aside className="sidebar">
          <div className="side-heading"><span>ECU MAPS</span><button onClick={() => setSidebar(false)} aria-label="Collapse sidebar"><Menu /></button></div>
          <div className="ecu-card"><div className="ecu-icon"><Database /></div><div><strong>HALTECH ELITE 2500</strong><span>CONNECTED · CAN 2.0B</span></div><span className="dot green" /></div>
          <div className="side-tabs" role="tablist" aria-label="Workspace views"><button role="tab" aria-selected={activeTab === 'calibration'} className={activeTab === 'calibration' ? 'side-tab active' : 'side-tab'} onClick={() => setActiveTab('calibration')}><Layers3 /> CALIBRATION</button><button role="tab" aria-selected={activeTab === 'diagnosis'} className={activeTab === 'diagnosis' ? 'side-tab active' : 'side-tab'} onClick={() => { setActiveTab('diagnosis'); logEvent('Diagnosis workspace opened', 'DIAG', 'event-cyan') }}><Activity /> DIAGNOSIS</button></div>
          <div className="tree">
            {groups.map((group) => { const Icon = group.icon; return <div key={group.label} className="tree-group"><button className="tree-row group-row" onClick={() => setOpen({ ...open, [group.label]: !open[group.label] })}>{open[group.label] ? <ChevronDown /> : <ChevronRight />}<Icon /><span>{group.label}</span><small>{group.children.length}</small></button>{open[group.label] && <div className="tree-children">{group.children.map((child, index) => <button key={child} className={`tree-row child-row ${selected === child ? 'selected' : ''}`} onClick={() => setSelected(child)}><span className="tree-branch">{index === group.children.length - 1 ? '└' : '├'}</span><span>{child}</span></button>)}</div>}</div> })}
          </div>
          <div className="side-footer"><button><Plus /> NEW MAP</button><button><Settings2 /> ECU SETTINGS</button></div>
        </aside>}
        {!sidebar && <button className="sidebar-reopen" onClick={() => setSidebar(true)} aria-label="Expand sidebar"><Menu /></button>}
        <section className="main-stage">
          <div className="stage-header"><div><span className="eyebrow">IGNITION / TABLE 01</span><h1>{selected}</h1></div><div className="stage-controls"><button className={activeView === 'surface' ? 'tool-active' : ''} onClick={() => setActiveView('surface')}><Layers3 /> SURFACE</button><button className={activeView === 'table' ? 'tool-active' : ''} onClick={() => setActiveView('table')}><Database /> TABLE</button><button className={activeView === 'hex' ? 'tool-active' : ''} onClick={() => setActiveView('hex')}><Terminal /> HEX</button><span className="divider" /><button aria-label="Undo" onClick={() => { setEdited(false); logEvent('Pending edits reverted', 'UNDO', 'event-cyan') }}><RotateCcw /></button><button aria-label="Reset" onClick={() => { setActiveCell('4-8'); setCellValue('24.2'); setEdited(false); logEvent('Cursor reset to default cell', 'INFO', 'event-ok') }}><X /></button><button className="primary-action" onClick={() => { setEdited(!edited); logEvent(edited ? 'Edit mode disabled' : 'Edit mode enabled', 'INFO', 'event-ok') }}>{edited ? 'CHANGES QUEUED' : 'EDIT MODE'}</button></div></div>
          {activeTab === 'calibration' ? <>
          <SurfacePreview />
          <section className="data-panel"><div className="panel-header"><div><span className="eyebrow">CALIBRATION DATA GRID</span><strong>ADVANCE ANGLE <span className="muted">/ DEGREES BTDC</span></strong></div><div className="legend"><span><i style={{ background: '#23864a' }} />LOW</span><span><i style={{ background: '#c89a32' }} />NOMINAL</span><span><i style={{ background: '#b94838' }} />HIGH</span><button><Minus /></button><button><Plus /></button></div></div><div className="heat-grid"><div className="corner-label">LOAD<br /><span>kPa</span></div>{[1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500].map(x => <div className="axis-label" key={x}>{x}</div>)}{grid.map((row, ri) => <div className="grid-row" key={ri}><div className="axis-label row-label">{ri * 10 + 30}</div>{row.map((value, ci) => <button key={ci} className={`cell ${activeCell === `${ri}-${ci}` ? 'active' : ''}`} style={{ background: heatColor(value) }} onClick={() => { setActiveCell(`${ri}-${ci}`); setEdited(true) }}>{(10 + value * 25).toFixed(1)}</button>)}</div>)}</div><div className="grid-footer"><span>8 × 12 MATRIX</span><span>SELECTED <b>{activeCell.replace('-', ' / ')}</b></span><span className="mono">SHIFT + CLICK TO SELECT RANGE</span></div></section>
          </> : <section className="diagnosis-panel"><div className="diagnosis-workspace-header"><div><span className="eyebrow">DIAGNOSTICS / WORKSPACE 02</span><h1>ECU Diagnosis</h1></div><div className="diagnosis-header-actions"><span className="live-pill"><span className="dot green" />LIVE MONITORING</span><button className="tool-button" onClick={() => logEvent('Diagnostic stream paused', 'PAUSE', 'event-cyan')}><X /> PAUSE STREAM</button></div></div><div className="diagnosis-hero"><div><span className="eyebrow">LIVE ECU DIAGNOSIS</span><h2>System health overview</h2><p>Monitor sensors, faults, and communication status before writing calibration changes.</p></div><button className="primary-action" onClick={() => logEvent('Diagnostic scan completed', 'SCAN', 'event-ok')}><Play /> RUN SCAN</button></div><div className="diagnosis-cards"><div className="diagnosis-card healthy"><span className="diagnosis-icon"><Activity /></span><div><span>ECU CONNECTION</span><strong>STABLE</strong><small>CAN 2.0B · 500 KBPS</small></div></div><div className="diagnosis-card healthy"><span className="diagnosis-icon"><Gauge /></span><div><span>BATTERY VOLTAGE</span><strong>13.8 V</strong><small>Normal operating range</small></div></div><div className="diagnosis-card warning"><span className="diagnosis-icon"><AlertTriangle /></span><div><span>ACTIVE WARNINGS</span><strong>1 NOTICE</strong><small>Unsaved map changes</small></div></div></div><div className="diagnosis-grid"><div className="diag-section"><div className="panel-header"><span className="eyebrow">SENSOR TELEMETRY</span><span className="live-pill"><span className="dot green" />LIVE</span></div>{[['Coolant temp','86 °C','Normal'],['Intake air temp','34 °C','Normal'],['Throttle position','18.4 %','Normal'],['Lambda 1','0.98 λ','Target']].map(([label,value,state]) => <div className="telemetry-row" key={label}><span>{label}</span><strong>{value}</strong><em>{state}</em></div>)}</div><div className="diag-section"><div className="panel-header"><span className="eyebrow">FAULT MEMORY</span><button className="text-button" onClick={() => logEvent('Fault memory cleared', 'CLEAR', 'event-cyan')}>CLEAR</button></div><div className="fault-row"><AlertTriangle /><div><strong>Calibration pending</strong><span>Main Ignition Map has unsaved edits</span></div><b className="event-warn">NOTICE</b></div><div className="fault-row muted-row"><Database /><div><strong>No stored DTCs</strong><span>Last scan 14:22:08</span></div><b className="event-ok">CLEAR</b></div></div></div></section>}
        </section>
        {inspectorOpen && <aside className="inspector"><div className="inspector-title"><span>INSPECTOR</span><button aria-label="Close inspector" onClick={() => setInspectorOpen(false)}><PanelRight /></button></div><div className="inspector-block"><span className="eyebrow">AXIS METADATA</span><div className="meta-row"><span>X AXIS</span><strong>ENGINE SPEED</strong></div><div className="meta-row"><span>MIN / MAX</span><strong>1000 — 6500 RPM</strong></div><div className="meta-row"><span>STEPS</span><strong>500 RPM</strong></div><div className="meta-row"><span>Y AXIS</span><strong>ENGINE LOAD</strong></div><div className="meta-row"><span>MIN / MAX</span><strong>30 — 100 kPa</strong></div><div className="meta-row"><span>STEPS</span><strong>10 kPa</strong></div></div><div className="inspector-block"><span className="eyebrow">QUICK MATH</span><div className="math-actions"><button onClick={() => { setEdited(true); logEvent('Added +1.0° to selected cell') }}><Plus /> ADD VALUE</button><button onClick={() => { setEdited(true); logEvent('Subtracted 1.0° from selected cell') }}><Minus /> SUBTRACT</button><button onClick={() => { setEdited(true); logEvent('Scaled selected range × 1.05') }}><SlidersHorizontal /> SCALE ×</button><button onClick={() => { setEdited(true); logEvent('Smoothed selected range') }}><Activity /> SMOOTH</button></div></div><div className="inspector-block"><span className="eyebrow">CELL DETAILS</span><div className="selected-cell"><span>SELECTED CELL</span><strong>4500 RPM <em>/</em> 70 kPa</strong><div><b>24.2°</b><span>RAW: 0x3C</span></div></div><label className="field-label">VALUE <input value={cellValue} onChange={(event) => { setCellValue(event.target.value); setEdited(true) }} onBlur={() => logEvent(`Cell ${activeCell} changed to ${cellValue}`, 'EDIT', 'event-cyan')} /></label></div><div className="inspector-bottom"><div className="sync-state"><span className="dot green" /><span>{edited ? 'PENDING ECU WRITE' : 'SYNCED WITH ECU'}</span><small>LAST WRITE 00:14:22 AGO</small></div><button className="write-button" onClick={() => { setEdited(false); logEvent('Calibration written to ECU', 'WRITE', 'event-ok') }}><Play /> WRITE TO ECU</button></div></aside>}
      </div>
      <section className="bottom-dock"><div className="dock-panel hex-panel"><div className="dock-heading"><span><Terminal /> RAW HEX VIEWER</span><span className="mono">OFFSET 0x001A40</span></div><div className="hex-content"><span className="hex-offset">001A40</span><span>3C 40 44 47 4B 4F 52 55 58 5B 5E 61</span><span className="hex-ascii">&lt;@DGKORUX[^a</span></div><div className="hex-content dim"><span className="hex-offset">001A4C</span><span>64 67 6A 6D 70 73 76 79 7C 7F 82 85</span><span className="hex-ascii">dgjmpsvy|</span></div></div><div className="dock-panel event-panel"><div className="dock-heading"><span><Activity /> EVENT LOG</span><button onClick={() => setLogs([])}><X /> CLEAR</button></div><div className="events">{logs.map((event) => <div key={`${event.time}-${event.text}`}><span className="event-time">{event.time}</span><b className={event.tone}>{event.level}</b><span>{event.text}</span></div>)}</div></div></section>
      <footer className="statusbar"><span><span className="dot green" />CONNECTED</span><span>CAN 2.0B · 500 KBPS</span><span>BATTERY 13.8V</span><span>FIRMWARE 3.7.12</span><span className="status-spacer" /><span>FPS 60</span><span>MEM 42%</span><span><CircleHelp /> HELP</span></footer>
    </main>
  )
}
