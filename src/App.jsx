import { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { Search, Play, Pause, Mic, Radio, Plus, ListMusic, Music2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAudio(url) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [src, setSrc] = useState(url)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
  }, [])

  useEffect(() => {
    if (audioRef.current && src) {
      audioRef.current.src = src
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [src])

  const play = () => {
    audioRef.current?.play()
    setPlaying(true)
  }
  const pause = () => {
    audioRef.current?.pause()
    setPlaying(false)
  }
  const setUrl = (u) => setSrc(u)

  return { playing, play, pause, setUrl }
}

function Header({ onSearch }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="text-2xl font-extrabold tracking-tight text-orange-600">Vibe Music</div>
      <div className="flex items-center gap-3 w-full max-w-xl bg-white/70 backdrop-blur border border-orange-200 rounded-full px-4 py-2 shadow-sm">
        <Search className="w-5 h-5 text-orange-500" />
        <input
          placeholder="Search songs, artists, channels..."
          className="w-full bg-transparent outline-none text-orange-900 placeholder:text-orange-400"
          onKeyDown={(e) => { if (e.key === 'Enter') onSearch(e.target.value) }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition"> <Plus className="w-4 h-4"/> Add Music</button>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-radial from-white/60 via-orange-50/30 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div className="text-sm uppercase tracking-widest text-orange-500 mb-2">AI Voice + Radio</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-900 drop-shadow-sm">Your light-orange Spotify</h1>
        <p className="mt-3 text-orange-700 max-w-2xl">Search, play, and control with your voice. Stream FM channels. Build playlists. Minimal, modern, and fast.</p>
      </div>
    </div>
  )
}

function VoiceBar({ onResult }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const r = new SpeechRecognition()
      r.lang = 'en-US'
      r.continuous = false
      r.interimResults = false
      r.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        fetch(`${API_BASE}/api/ai/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript })
        })
          .then(res => res.json())
          .then(onResult)
          .catch(() => {})
      }
      r.onend = () => setListening(false)
      recognitionRef.current = r
    }
  }, [onResult])

  const toggle = () => {
    if (!recognitionRef.current) return
    if (!listening) {
      setListening(true)
      recognitionRef.current.start()
    } else {
      recognitionRef.current.stop()
      setListening(false)
    }
  }

  return (
    <button onClick={toggle} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition shadow-sm ${listening ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50'}`}>
      <Mic className="w-4 h-4" /> {listening ? 'Listening...' : 'Voice' }
    </button>
  )
}

function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mt-8 mb-3">
      <div className="flex items-center gap-2 text-orange-900 font-bold">
        <Icon className="w-5 h-5 text-orange-500" />
        <span>{title}</span>
      </div>
      {action}
    </div>
  )
}

function SongCard({ song, onPlay }) {
  return (
    <div className="group p-3 rounded-xl bg-white/70 border border-orange-200 hover:border-orange-300 hover:shadow-md transition flex items-center gap-3">
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-200 to-rose-200 overflow-hidden flex items-center justify-center text-orange-700">
        {song.cover_url ? (
          <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <Music2 className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-orange-900">{song.title}</div>
        <div className="text-sm text-orange-600">{song.artist}</div>
      </div>
      <button onClick={() => onPlay(song)} className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition">
        <Play className="w-4 h-4" />
      </button>
    </div>
  )
}

function ChannelCard({ channel, onPlay }) {
  return (
    <div className="group p-3 rounded-xl bg-white/70 border border-orange-200 hover:border-orange-300 hover:shadow-md transition flex items-center gap-3">
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-200 to-orange-200 overflow-hidden flex items-center justify-center text-orange-700">
        <Radio className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-orange-900">{channel.name}</div>
        <div className="text-sm text-orange-600">{channel.description}</div>
      </div>
      <button onClick={() => onPlay(channel)} className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition">
        <Play className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function App() {
  const [songs, setSongs] = useState([])
  const [channels, setChannels] = useState([])
  const [query, setQuery] = useState('')
  const player = useAudio(null)
  const [current, setCurrent] = useState(null)

  const search = (q) => {
    setQuery(q)
    fetch(`${API_BASE}/api/songs?query=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setSongs(data.items || []))
      .catch(() => {})
  }

  const loadChannels = () => {
    fetch(`${API_BASE}/api/channels`)
      .then(res => res.json())
      .then(data => setChannels(data.items || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadChannels()
    // try seeding channels if empty
    setTimeout(() => { fetch(`${API_BASE}/api/channels/seed`, { method: 'POST' }).catch(() => {}) }, 500)
  }, [])

  const onVoiceResult = (res) => {
    if (!res) return
    if (res.action === 'play_channel' && res.items?.length) {
      const c = res.items[0]
      setCurrent({ type: 'channel', item: c })
      player.setUrl(c.stream_url)
    } else if (res.action === 'play_song') {
      setSongs(res.items || [])
    }
  }

  const playSong = (s) => {
    setCurrent({ type: 'song', item: s })
    if (s.audio_url) player.setUrl(s.audio_url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 text-orange-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Header onSearch={search} />
        <Hero />

        <div className="flex items-center gap-3 mt-6">
          <VoiceBar onResult={onVoiceResult} />
          {current ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 border border-orange-200 shadow-sm">
              {player.playing ? (
                <button onClick={player.pause} className="p-2 rounded-full bg-orange-500 text-white"><Pause className="w-4 h-4" /></button>
              ) : (
                <button onClick={player.play} className="p-2 rounded-full bg-orange-500 text-white"><Play className="w-4 h-4" /></button>
              )}
              <div>
                <div className="text-sm uppercase text-orange-500">Now Playing</div>
                <div className="font-semibold">{current.type === 'channel' ? current.item.name : current.item.title}</div>
              </div>
            </div>
          ) : null}
        </div>

        <SectionTitle icon={ListMusic} title={query ? `Results for "${query}"` : 'Top Songs'} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map(s => (
            <SongCard key={s.id || s.title} song={s} onPlay={playSong} />
          ))}
          {songs.length === 0 && (
            <div className="col-span-full text-orange-600 text-sm">Search for songs or use the voice button to find something to play.</div>
          )}
        </div>

        <SectionTitle icon={Radio} title="FM Channels" action={<button onClick={loadChannels} className="text-sm text-orange-700 hover:text-orange-900">Refresh</button>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map(c => (
            <ChannelCard key={c.id || c.name} channel={c} onPlay={(ch) => { setCurrent({ type: 'channel', item: ch }); player.setUrl(ch.stream_url) }} />
          ))}
          {channels.length === 0 && (
            <div className="col-span-full text-orange-600 text-sm">No channels yet. Seeding some defaults...</div>
          )}
        </div>
      </div>
    </div>
  )
}
