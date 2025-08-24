import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { Event } from '@/types';

import { Topbar } from '@/components/ui/Topbar';
import { ChatPane } from '@/components/Chat/ChatPane';
import { Composer } from '@/components/Chat/Composer';
import { ParticipantsDrawer } from '@/components/Participants/ParticipantsDrawer';

export default function Chat() {
  const { isAuthenticated } = useAuth();
  const { messages, isLoading, recentPrompts, sendMessage } = useChat();
  const navigate = useNavigate();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participantsOpen, setParticipantsOpen] = useState(false);

  const [propagatedMessage, setPropagatedMessage] = useState<string>("");

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setParticipantsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Chat Area */}
        <ChatPane
          messages={messages}
          isLoading={isLoading}
          onEventClick={handleEventClick}
          onCardClick={(message)=>{setPropagatedMessage(message)}}
        />

        {/* Message Composer */}
        <Composer
          onSendMessage={sendMessage}
          isLoading={isLoading}
          recentPrompts={recentPrompts}
          propagatedMessage={propagatedMessage}
        />
      </div>

      {/* Participants Drawer */}
      <ParticipantsDrawer
        open={participantsOpen}
        onOpenChange={setParticipantsOpen}
        eventTitle={selectedEvent?.title || ''}
      />
    </div>
  );
}