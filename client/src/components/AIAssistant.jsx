import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function AIAssistant() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakReply = (text) => {
    if (muted) return;
    try {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.pitch = 1.0;

      // Pick the most natural-sounding voice available
      const voices = speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('emma')) ||
        voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('aria')) ||
        voices.find(v => v.lang === 'en-US' && !v.name.toLowerCase().includes('espeak')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];

      if (preferred) utter.voice = preferred;
      speechSynthesis.speak(utter);
    } catch { }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const data = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      const reply = data.reply || 'No response.';
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      speakReply(reply);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // ─── STT ────────────────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { alert('Speech recognition not supported. Please use Chrome.'); return; }
    speechSynthesis.cancel(); // Stop any AI voice before listening
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (ev) => {
      let transcript = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        transcript += ev.results[i][0].transcript;
      }
      setInput(transcript);
    };
    rec.onend = () => {
      setIsListening(false);
      recognizerRef.current = null;
      // Auto-send after a short delay if text was captured
      setTimeout(() => {
        if (inputRef.current?.value.trim()) sendMessage();
      }, 500);
    };
    rec.onerror = () => setIsListening(false);
    rec.start();
    recognizerRef.current = rec;
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open && messages.length === 0) {
      const greeting = "Hello! I'm your AI Career Assistant. Ask me about career paths, skills, or interview tips!";
      setMessages([{ role: 'ai', text: greeting }]);
      speakReply(greeting);
    }
  };

  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const emeraldHighlight = isLight ? '#006C49' : '#4edea2';
  const panelBg = isLight ? 'rgba(241,246,255,0.97)' : 'rgba(10,16,32,0.97)';
  const headerBg = isLight ? '#4648D4' : 'linear-gradient(90deg, #0a1020, #0d1a35)';
  const onHeader = '#fff';
  const userMsgBg = isLight ? '#4648D4' : '#3d4aaa';
  const aiMsgBg = isLight ? '#EBF0FA' : '#1a2338';
  const borderCol = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';

  return (
    <div className="ai-toggle">
      {/* Launch Button */}
      <div
        className="ai-button"
        onClick={handleOpen}
        title="AI Career Assistant"
        style={{ background: `linear-gradient(135deg, ${strokeColor}, ${isLight ? '#6366F1' : '#7c82ff'})` }}
      >
        {open ? '✕' : 'AI'}
      </div>

      {open && (
        <div
          className="ai-panel"
          style={{
            background: panelBg,
            boxShadow: isLight ? '0 8px 40px rgba(70,72,212,0.2)' : '0 8px 40px rgba(0,0,0,0.6)',
            border: `1px solid ${borderCol}`,
            borderRadius: 18,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            background: headerBg,
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: onHeader, fontSize: 15 }}>🤖 AI Career Assistant</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                {isListening ? '🎤 Listening…' : muted ? '🔇 Voice muted' : '🔊 Voice enabled'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Mute toggle */}
              <button
                onClick={() => { setMuted(m => !m); speechSynthesis.cancel(); }}
                title={muted ? 'Click to unmute' : 'Click to mute voice'}
                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '5px 9px', color: onHeader, cursor: 'pointer', fontSize: 15 }}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              {/* Close */}
              <button
                onClick={handleOpen}
                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '5px 9px', color: onHeader, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-messages" style={{ padding: 14, overflowY: 'auto', maxHeight: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '82%',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? userMsgBg : aiMsgBg,
                  color: m.role === 'user' ? '#fff' : (isLight ? '#111C2D' : '#dee5ff'),
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: aiMsgBg, color: isLight ? '#4648D4' : '#c0c1ff', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', fontSize: 14, fontStyle: 'italic' }}>
                Thinking…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Row */}
          <div style={{
            padding: '12px 14px',
            borderTop: `1px solid ${borderCol}`,
            display: 'flex',
            gap: 8,
            alignItems: 'center'
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={isListening ? 'Listening…' : 'Ask me anything…'}
              style={{
                flex: 1,
                background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${borderCol}`,
                borderRadius: 10,
                padding: '9px 12px',
                color: isLight ? '#111C2D' : '#dee5ff',
                fontSize: 14,
                outline: 'none'
              }}
            />
            {/* Mic button */}
            <button
              onClick={isListening ? stopListening : startListening}
              title={isListening ? 'Stop listening' : 'Speak your question'}
              style={{
                width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isListening ? '#ff6b6b' : (isLight ? 'rgba(70,72,212,0.12)' : 'rgba(255,255,255,0.08)'),
                color: isListening ? '#fff' : strokeColor,
                transition: 'all 0.2s'
              }}
            >
              {isListening ? '⏹' : '🎤'}
            </button>
            {/* Send button */}
            <button
              onClick={sendMessage}
              style={{
                width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${strokeColor}, ${isLight ? '#6366F1' : '#7c82ff'})`,
                color: '#fff'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
