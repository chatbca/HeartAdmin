import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Trash2, CheckCircle, Clock, Filter, Search, X, MessageSquare } from 'lucide-react';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, knownv, heartware
  const [selectedMessage, setSelectedMessage] = useState(null);

  const SITES = {
    '47da696a-f827-4e44-a651-4d8905db19b1': 'knowNV',
    '01aa78e5-f988-47c3-9405-934f6bf69952': 'ajja-Heartware'
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await supabase.from('contacts').update({ is_read: true }).eq('id', id);
    fetchMessages();
  };

  const deleteMessage = async (id) => {
    if (confirm('Delete this message?')) {
      await supabase.from('contacts').delete().eq('id', id);
      fetchMessages();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    if (filter === 'knownv') return msg.site_id === '47da696a-f827-4e44-a651-4d8905db19b1';
    if (filter === 'heartware') return msg.site_id === '01aa78e5-f988-47c3-9405-934f6bf69952';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-white/40">Inquiries from your websites.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none"
          >
            <option value="all">All Sites</option>
            <option value="knownv">knowNV</option>
            <option value="heartware">ajja-Heartware</option>
          </select>
          <button onClick={fetchMessages} className="p-2 hover:bg-white/5 rounded-lg">
            <Clock size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        {/* Message List */}
        <div className="lg:col-span-1 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail size={18} /> Inbox
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-white/20">
                <MessageSquare size={48} className="mx-auto mb-2 opacity-10" />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div 
                  key={msg.id} 
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.is_read) markAsRead(msg.id);
                  }}
                  className={`p-4 cursor-pointer hover:bg-white/5 transition-colors relative ${selectedMessage?.id === msg.id ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                >
                  {!msg.is_read && <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50" />}
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">{msg.name}</span>
                    <span className="text-[10px] text-white/30">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-primary/80 mb-1">{SITES[msg.site_id] || 'Unknown Site'}</div>
                  <div className="text-sm text-white/50 line-clamp-1">{msg.subject || msg.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-1">{selectedMessage.subject || 'No Subject'}</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/60">From: <strong className="text-white">{selectedMessage.name}</strong> ({selectedMessage.email})</span>
                    {selectedMessage.phone && <span className="text-white/60">Phone: <strong className="text-white">{selectedMessage.phone}</strong></span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-8 overflow-y-auto text-white/80 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
              <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center text-xs text-white/40">
                <span>Received on {new Date(selectedMessage.created_at).toLocaleString()}</span>
                <span>Source: {SITES[selectedMessage.site_id]}</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-12 text-center">
              <Mail size={64} className="mb-4 opacity-5" />
              <h3 className="text-xl font-bold">No Message Selected</h3>
              <p>Click on an item in the inbox to read the full message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
