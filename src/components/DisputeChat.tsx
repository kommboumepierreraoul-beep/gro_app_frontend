'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { storageUrl } from '@/lib/storage';
import { Send, Upload, X, FileText } from 'lucide-react';

interface Message {
  id: number;
  user_id: number;
  message: string;
  attachments: string[] | null;
  created_at: string;
  user: { firstname: string; lastname: string; role?: string; profile?: { avatar_url?: string } };
}
interface DisputeChatProps {
  disputeId: number;
  currentUserId: number;
  isAdmin?: boolean;
}

function isImageUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|svg)$/i.test(url);
}

function avatarFor(user?: { firstname?: string; lastname?: string; profile?: { avatar_url?: string } }) {
  const real = user?.profile?.avatar_url;
  if (real && !real.includes('default-avatar')) return real;
  const name = encodeURIComponent(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || '?');
  return `https://ui-avatars.com/api/?background=0D9488&color=fff&bold=true&size=64&name=${name}`;
}

export default function DisputeChat({ disputeId, currentUserId, isAdmin = false }: DisputeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/disputes/${disputeId}/messages`);
      const data = res.data.data || [];
      setMessages(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [disputeId]);

  // Ne scrolle que si le nombre de messages a réellement augmenté (nouveau message),
  // jamais sur un simple refresh silencieux du polling.
  useEffect(() => {
    if (messages.length > lastCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastCountRef.current = messages.length;
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const send = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('message', newMessage);
      attachments.forEach(f => fd.append('attachments[]', f));
      await api.post(`/disputes/${disputeId}/messages`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewMessage('');
      setAttachments([]);
      setPreviews([]);
      fetchMessages();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally { setSending(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
      Chargement de la discussion...
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Zone messages — scrollbar masquée, scroll au swipe/molette conservé */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-emerald-50/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
            <span className="text-3xl">💬</span>
            Aucun message pour l'instant. Commencez la discussion.
          </div>
        ) : messages.map(msg => {
          const isMine = msg.user_id === currentUserId;
          const name = `${msg.user?.firstname || ''} ${msg.user?.lastname || ''}`.trim();
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <img src={avatarFor(msg.user)} className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm" alt="" />
              )}
              <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%]`}>
                <div className={`rounded-2xl overflow-hidden shadow-sm ${
                  isMine
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-md'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md'
                }`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`grid gap-1 ${msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {msg.attachments.map((url, i) => (
                        isImageUrl(url) ? (
                          <img
                            key={i}
                            src={storageUrl(url)}
                            onClick={() => window.open(storageUrl(url), '_blank')}
                            className="w-full max-h-64 object-cover cursor-zoom-in hover:opacity-90 transition"
                          />
                        ) : (
                          <a key={i} href={storageUrl(url)} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium ${isMine ? 'text-white' : 'text-emerald-700'}`}>
                            <FileText size={14} /> Document joint
                          </a>
                        )
                      ))}
                    </div>
                  )}
                  {msg.message && (
                    <p className="text-sm leading-relaxed px-4 pt-3 pb-1.5">
                      {msg.message}
                    </p>
                  )}
                  <p className={`text-[10px] px-4 pb-2 ${isMine ? 'text-emerald-100/80' : 'text-slate-400'}`}>
                    {isMine ? 'Vous' : name} · {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {isMine && (
                <img src={avatarFor(msg.user)} className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow-sm" alt="" />
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t border-emerald-100/60 p-4 bg-white/70 backdrop-blur-xl flex-shrink-0">
        {previews.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-16 h-16">
                <img src={src} className="w-full h-full object-cover rounded-xl border border-slate-200" />
                <button onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <label className="cursor-pointer p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition flex-shrink-0">
            <Upload size={17} className="text-emerald-600" />
            <input type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
          </label>
          <textarea
            rows={1}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            className="flex-1 bg-slate-50 border-2 border-transparent rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button onClick={send} disabled={sending || (!newMessage.trim() && attachments.length === 0)}
            className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 hover:shadow-lg disabled:opacity-40 text-white rounded-xl transition-all flex-shrink-0">
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
