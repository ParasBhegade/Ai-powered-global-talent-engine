import { useState, useRef, useEffect, useCallback } from 'react';
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

  // ── Natural voice (same logic as InterviewLivePage) ────────────────────────
  const getVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find(v => v.name === 'Google UK English Female') ||
      voices.find(v => v.name === 'Google US English') ||
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('emma')) ||
      voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('aria')) ||
      voices.find(v => v.lang === 'en-US' && !v.name.toLowerCase().includes('espeak')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    );
  }, []);

  const speakReply = useCallback((text) => {
    if (muted) return;
    try {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.pitch = 1.0;

      const doSpeak = () => {
        const voice = getVoice();
        if (voice) utter.voice = voice;
        speechSynthesis.speak(utter);
      };

      // If voices not loaded yet, wait for them
      if (speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        speechSynthesis.onvoiceschanged = () => { doSpeak(); };
      }
    } catch { /* ignore */ }
  }, [muted, getVoice]);

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

  // ── Speech recognition ────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { alert('Speech recognition not supported. Please use Chrome.'); return; }
    speechSynthesis.cancel();
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
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && messages.length === 0) {
      const greeting = "Hello! I'm your AI Career Assistant. Ask me about career paths, skills, or interview tips!";
      setMessages([{ role: 'ai', text: greeting }]);
      speakReply(greeting);
    }
    if (!willOpen) {
      speechSynthesis.cancel();
    }
  };

  const strokeColor = isLight ? '#4648D4' : '#c0c1ff';
  const panelBg = isLight ? 'var(--surface-container-low)' : 'var(--surface-container-low)';
  const headerBg = isLight
    ? 'linear-gradient(90deg, #4648D4, #6366F1)'
    : 'linear-gradient(90deg, #0d1430, #1a2246)';
  const userMsgBg = isLight ? '#4648D4' : '#3d4aaa';
  const aiMsgBg = isLight ? 'var(--surface-container-highest)' : 'var(--surface-container-high)';
  const borderCol = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  const inputBg = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';

  return (
    <div className="ai-toggle">
      {/* Launch button — always shows "AI", panel has its own close */}
      <div
        className="ai-button"
        onClick={handleOpen}
        title={open ? 'Close assistant' : 'Open AI Career Assistant'}
        style={{ background: `linear-gradient(135deg, ${strokeColor}, ${isLight ? '#6366F1' : '#7c82ff'})` }}
      >
        {open ? '✕' : 'AI'}
      </div>

      {open && (
        <div
          className="ai-panel"
          style={{
            background: 'var(--surface-container)',
            boxShadow: isLight ? '0 8px 40px rgba(70,72,212,0.18)' : '0 8px 40px rgba(0,0,0,0.55)',
            border: `1px solid ${borderCol}`,
            borderRadius: 16,
            overflow: 'hidden'
          }}
        >
          {/* Header — no extra ✕ here, launch button is the toggle */}
          <div style={{
            background: headerBg,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>AI Career Assistant</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
                {isListening ? 'Listening...' : muted ? 'Voice muted' : 'Voice enabled'}
              </div>
            </div>
            {/* Mute toggle only */}
            <button
              onClick={() => { setMuted(m => !m); speechSynthesis.cancel(); }}
              title={muted ? 'Unmute voice' : 'Mute voice'}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8,
                padding: '5px 9px', color: '#fff', cursor: 'pointer', fontSize: 14
              }}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Messages */}
          <div
            className="ai-messages"
            style={{ padding: '12px 14px', overflowY: 'auto', maxHeight: 320, display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '82%',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? userMsgBg : aiMsgBg,
                  color: m.role === 'user' ? '#fff' : 'var(--on-surface)',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.07)'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: aiMsgBg, color: isLight ? '#4648D4' : '#c0c1ff', padding: '9px 13px', borderRadius: '14px 14px 14px 4px', fontSize: 13, fontStyle: 'italic' }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Row */}
          <div style={{
            padding: '10px 12px',
            borderTop: `1px solid ${borderCol}`,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: 'var(--surface-container-low)'
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={isListening ? 'Listening...' : 'Ask me anything...'}
              style={{
                flex: 1,
                background: inputBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 10,
                padding: '8px 11px',
                color: 'var(--on-surface)',
                fontSize: 13.5,
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            {/* Mic button */}
            <button
              onClick={isListening ? stopListening : startListening}
              title={isListening ? 'Stop' : 'Speak'}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isListening ? '#ff6b6b' : (isLight ? 'rgba(70,72,212,0.1)' : 'rgba(255,255,255,0.07)'),
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
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
