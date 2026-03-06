import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  GraduationCap, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Lightbulb, 
  Accessibility, 
  ExternalLink, 
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { curriculumData } from './data';
import { Habilidade, AnoEscolar } from './types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [selectedAno, setSelectedAno] = useState<number>(6);
  const [selectedBimestre, setSelectedBimestre] = useState<number>(1);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const currentAnoData = useMemo(() => 
    curriculumData.anos.find(a => a.ano === selectedAno), 
    [selectedAno]
  );

  const currentBimestreData = useMemo(() => 
    currentAnoData?.bimestres.find(b => b.numero === selectedBimestre),
    [currentAnoData, selectedBimestre]
  );

  const filteredHabilidades = useMemo(() => {
    if (!currentBimestreData) return [];
    return currentBimestreData.habilidades.filter(h => 
      h.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentBimestreData, searchQuery]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "Você é o 'Tutor EducaTocantins', um assistente virtual especializado no currículo de Ciências da Natureza do Tocantins para o Ensino Fundamental. Ajude alunos e professores com explicações simples, exemplos práticos e curiosidades científicas baseadas na Matriz de Recomposição 2026. Seja encorajador, didático e use uma linguagem acessível para crianças de 11 a 15 anos."
        }
      });
      
      setChatHistory(prev => [...prev, { role: 'model', text: response.text || 'Desculpe, tive um problema ao processar sua pergunta.' }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', text: 'Erro ao conectar com o tutor. Verifique sua conexão.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isAccessibilityMode ? 'bg-zinc-900 text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md ${isAccessibilityMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">
                EducaTocantins <span className="text-indigo-600">Ciências</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsAccessibilityMode(!isAccessibilityMode)}
                className={`p-2 rounded-full transition-colors ${isAccessibilityMode ? 'bg-zinc-800 text-yellow-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title="Modo Acessibilidade"
              >
                <Accessibility className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsTeacherMode(!isTeacherMode)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isTeacherMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isTeacherMode ? 'Modo Professor' : 'Modo Aluno'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[6, 7, 8, 9].map(ano => (
              <button
                key={ano}
                onClick={() => setSelectedAno(ano)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedAno === ano ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
              >
                {ano}º Ano
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {[1, 2, 3, 4].map(bim => (
              <button
                key={bim}
                onClick={() => setSelectedBimestre(bim)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedBimestre === bim ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {bim}º Bim
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Pesquisar habilidades, temas ou códigos (ex: EF06CI01)..."
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 ${isAccessibilityMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Tips / Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isAccessibilityMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-100'}`}>
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Habilidades</p>
              <p className="text-lg font-bold">{filteredHabilidades.length}</p>
            </div>
          </div>
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isAccessibilityMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-100'}`}>
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Acessibilidade</p>
              <p className="text-lg font-bold">{isAccessibilityMode ? 'Ativado' : 'Desativado'}</p>
            </div>
          </div>
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isAccessibilityMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-100'}`}>
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Modo</p>
              <p className="text-lg font-bold">{isTeacherMode ? 'Professor' : 'Aluno'}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="wait">
            {filteredHabilidades.length > 0 ? (
              filteredHabilidades.map((h, idx) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isAccessibilityMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-200'}`}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        {h.id}
                      </span>
                      {h.conexoes && h.conexoes.map(c => (
                        <span key={c} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>

                    <h3 className={`text-xl sm:text-2xl font-bold mb-6 leading-tight ${isAccessibilityMode ? 'text-white' : 'text-slate-900'}`}>
                      {h.descricao}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Knowledge Objects */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
                          <BookOpen className="w-4 h-4" /> Objetos de Conhecimento
                        </h4>
                        <ul className="space-y-3">
                          {h.objetosConhecimento.map((obj, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Teacher/Student Specific Content */}
                      <div>
                        {isTeacherMode ? (
                          <div className="space-y-6">
                            <div>
                              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-600 mb-4">
                                <Lightbulb className="w-4 h-4" /> Sugestões Pedagógicas
                              </h4>
                              <ul className="space-y-3">
                                {h.sugestoesPedagogicas.map((sug, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm italic text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    <span>{sug}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">
                              <Award className="w-4 h-4" /> Recursos de Aprendizagem
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {h.linksSugeridos.map((link, i) => (
                                <a 
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${isAccessibilityMode ? 'bg-zinc-700 border-zinc-600 hover:bg-zinc-600' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'}`}
                                >
                                  <span className="text-sm font-medium">{link.titulo}</span>
                                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inclusion Section */}
                    <div className={`mt-8 p-6 rounded-2xl border-l-4 border-indigo-500 ${isAccessibilityMode ? 'bg-zinc-900/50 border-zinc-700' : 'bg-indigo-50/50 border-indigo-100'}`}>
                      <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">
                        <Accessibility className="w-4 h-4" /> Inclusão e Adaptação (DUA)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {h.inclusaoAdaptacao.map((inc, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-400 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-600">Nenhuma habilidade encontrada</h3>
                <p className="text-slate-400">Tente mudar o bimestre ou ajustar sua pesquisa.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* AI Tutor Floating Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-300 hover:scale-110 transition-transform z-50 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Falar com o Tutor IA
        </span>
      </button>

      {/* AI Tutor Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-8 w-full max-w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold">Tutor EducaTocantins</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-indigo-500 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">Olá! Eu sou o tutor de Ciências. Como posso te ajudar hoje?</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                placeholder="Pergunte sobre Ciências..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isTyping}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`py-12 border-t ${isAccessibilityMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium mb-2">Governo do Estado do Tocantins - Secretaria da Educação</p>
          <p className="text-xs">Matriz de Recomposição das Aprendizagens 2026 - Ciências da Natureza</p>
          <div className="mt-6 flex justify-center gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Sobre</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
