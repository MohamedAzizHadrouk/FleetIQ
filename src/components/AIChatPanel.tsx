import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Sparkles,
  User,
  Bot,
  Loader2,
  MapPin,
  AlertCircle,
  FileText,
  TrendingUp,
  Fuel,
  Activity } from
'lucide-react';
import { ModalHeader } from '@/components/ui/modal-header';
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}
interface PredefinedQuestion {
  id: string;
  question: string;
  icon: any;
  response: string;
}
interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
const PREDEFINED_QUESTIONS: PredefinedQuestion[] = [
{
  id: '1',
  question: 'Où se trouvent mes véhicules actuellement ?',
  icon: MapPin,
  response:
  'Vous avez 23 véhicules en mouvement, 18 en arrêt et 14 en circulation lente. Je peux vous montrer leur position exacte sur la carte. Voulez-vous voir un véhicule spécifique ?'
},
{
  id: '2',
  question: 'Quelles sont les alertes actives ?',
  icon: AlertCircle,
  response:
  "Vous avez actuellement 3 alertes critiques : 1 excès de vitesse (Fleet-001), 1 niveau de carburant bas (Fleet-003), et 1 sortie de zone (Fleet-002). Voulez-vous plus de détails sur l'une d'elles ?"
},
{
  id: '3',
  question: 'Comment générer un rapport de trajets ?',
  icon: FileText,
  response:
  'Pour générer un rapport de trajets : 1) Allez dans la section Rapports, 2) Sélectionnez "Rapport des trajets", 3) Choisissez vos véhicules et la période, 4) Cliquez sur Générer. Je peux vous y rediriger si vous voulez.'
},
{
  id: '4',
  question: 'Quelle est la consommation moyenne de ma flotte ?',
  icon: Fuel,
  response:
  'La consommation moyenne de votre flotte est de 8.2 L/100km ce mois-ci. Vos meilleurs véhicules consomment 7.8 L/100km. Voulez-vous voir le détail par véhicule ?'
},
{
  id: '5',
  question: 'Comment suivre la performance de mes conducteurs ?',
  icon: TrendingUp,
  response:
  'Vous pouvez suivre la performance via le rapport "Qualité de conduite" qui analyse : excès de vitesse, freinages brusques, accélérations, et temps de ralenti. Voulez-vous que je génère ce rapport ?'
},
{
  id: '6',
  question: 'Comment configurer une alerte de géofence ?',
  icon: Activity,
  response:
  'Pour configurer une alerte de géofence : 1) Allez dans Paramètres, 2) Sélectionnez "Alertes", 3) Choisissez "Géofence", 4) Dessinez votre zone sur la carte, 5) Définissez le type d\'alerte (entrée/sortie). Besoin d\'aide pour le faire ?'
}];

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    type: 'ai',
    content:
    'Bonjour ! Je suis votre assistant GPS. Sélectionnez une question ci-dessous ou posez-moi votre question.',
    timestamp: new Date()
  }]
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  const handlePredefinedQuestion = (question: PredefinedQuestion) => {
    // Add user question
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question.question,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setShowQuestions(false);
    setIsTyping(true);
    // Add AI response after delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: question.response,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setShowQuestions(false);
    setIsTyping(true);
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Simulate voice message
      const voiceMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'Message vocal envoyé',
        timestamp: new Date(),
        isVoice: true
      };
      setMessages((prev) => [...prev, voiceMessage]);
      setShowQuestions(false);
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content:
          "J'ai bien reçu votre message vocal. Comment puis-je vous aider ?",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };
  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    if (input.includes('véhicule') || input.includes('fleet')) {
      return 'Je peux vous aider à localiser vos véhicules, consulter leur statut, ou générer des rapports. Que souhaitez-vous savoir ?';
    } else if (input.includes('alerte') || input.includes('alert')) {
      return 'Vous avez actuellement 3 alertes non lues. Voulez-vous que je vous montre les détails ?';
    } else if (input.includes('rapport') || input.includes('report')) {
      return 'Je peux générer différents types de rapports : détaillé, statistique, trajets, vitesse, carburant. Quel type de rapport vous intéresse ?';
    } else if (input.includes('position') || input.includes('localisation')) {
      return 'Je peux vous montrer la position en temps réel de vos véhicules sur la carte. Voulez-vous voir un véhicule spécifique ?';
    } else {
      return 'Je suis là pour vous aider avec la gestion de votre flotte GPS. Vous pouvez me poser des questions sur les véhicules, les alertes, les rapports, ou la localisation.';
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }}
        transition={{
          duration: 0.2
        }}
        className="absolute bottom-24 right-4 w-[420px] h-[650px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">
        
        <ModalHeader
          title="Assistant GPS"
          subtitle="En ligne"
          icon={<MessageSquare className="w-5 h-5 text-primary-foreground shrink-0" />}
          onClose={onClose}
        />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((message, index) =>
          <motion.div
            key={message.id}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.05
            }}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            
              {/* Avatar */}
              <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-blue-600' : 'bg-blue-600'}`}>
              
                {message.type === 'user' ?
              <User className="w-4 h-4 text-white" /> :

              <Bot className="w-4 h-4 text-white" />
              }
              </div>

              {/* Message Bubble */}
              <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-200 shadow-sm'}`}>
              
                {message.isVoice &&
              <div className="flex items-center gap-2 mb-1">
                    <Mic className="w-3 h-3" />
                    <span className="text-xs opacity-75">Message vocal</span>
                  </div>
              }
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                </p>
              </div>
            </motion.div>
          )}

          {/* Predefined Questions */}
          {showQuestions && messages.length === 1 &&
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.3
            }}
            className="space-y-2 pt-2">
            
              <p className="text-xs font-semibold text-slate-600 px-2">
                Questions fréquentes :
              </p>
              {PREDEFINED_QUESTIONS.map((q, index) => {
              const Icon = q.icon;
              return (
                <motion.button
                  key={q.id}
                  initial={{
                    opacity: 0,
                    x: -10
                  }}
                  animate={{
                    opacity: 1,
                    x: 0
                  }}
                  transition={{
                    delay: 0.4 + index * 0.05
                  }}
                  onClick={() => handlePredefinedQuestion(q)}
                  className="w-full flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left group">
                  
                    <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm text-slate-700 group-hover:text-blue-700 font-medium">
                      {q.question}
                    </span>
                  </motion.button>);

            })}
            </motion.div>
          }

          {/* Typing Indicator */}
          {isTyping &&
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="flex gap-3">
            
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '0.1s'
                  }} />
                
                  <div
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: '0.2s'
                  }} />
                
                </div>
              </div>
            </motion.div>
          }

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-end gap-2">
            {/* Voice Button */}
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-rose-500 hover:bg-rose-600 animate-pulse' : 'bg-slate-100 hover:bg-slate-200'}`}>
              
              {isRecording ?
              <MicOff className="w-5 h-5 text-white" /> :

              <Mic className="w-5 h-5 text-slate-600" />
              }
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isRecording} />
              
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isRecording}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors">
              
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {isRecording &&
          <motion.p
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            className="text-xs text-rose-600 mt-2 flex items-center gap-2">
            
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              Enregistrement en cours... Cliquez à nouveau pour arrêter
            </motion.p>
          }
        </div>
      </motion.div>
    </AnimatePresence>);

}