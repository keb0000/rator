import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Music, Sparkles, Disc, ArrowRight, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSimilarSongs, SongRecommendation } from "./services/gemini";

export default function App() {
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [recommendations, setRecommendations] = useState<SongRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await getSimilarSongs(songTitle, artistName);
      setRecommendations(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-pink-500/30">
      <div className="atmosphere" />
      
      <main className="container mx-auto px-4 py-12 relative z-10 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-pink-600" />
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: '#7d547d' }}>AI Music Discovery</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
            style={{ color: '#65136f' }}
          >
            VibeFinder
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg max-w-xl mx-auto font-light leading-relaxed"
            style={{ color: '#5b5975' }}
          >
            당신이 좋아하는 노래 한 곡으로 시작하세요.<br />
            AI가 그 분위기와 감성을 분석하여 완벽한 다음 곡을 찾아드립니다.
          </motion.p>
        </header>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-3xl p-8 md:p-12 mb-12 shadow-2xl"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest ml-1" style={{ color: '#2f0848' }}>Song Title</label>
                <div className="relative">
                  <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                  <Input
                    placeholder="노래 제목을 입력하세요 (예: Hype Boy)"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="bg-black/5 border-black/10 h-14 pl-12 rounded-2xl focus:ring-pink-500/20 transition-all text-lg text-black placeholder:text-black/30"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest ml-1" style={{ color: '#310a4b' }}>Artist (Optional)</label>
                <div className="relative">
                  <Disc className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                  <Input
                    placeholder="아티스트 이름을 입력하세요"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="bg-black/5 border-black/10 h-14 pl-12 rounded-2xl focus:ring-pink-500/20 transition-all text-lg text-black placeholder:text-black/30"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-black text-white hover:bg-black/90 transition-all text-lg font-semibold group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  비슷한 노래 찾기
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass border-black/5 bg-transparent overflow-hidden rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-black/5 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-black/10 rounded w-1/3 animate-pulse" />
                        <div className="h-3 bg-black/5 rounded w-1/4 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : hasSearched && recommendations.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#65136f' }}>
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  추천 리스트
                </h2>
                <Badge variant="outline" className="border-black/10 text-black/40 font-light">
                  {recommendations.length} Songs Found
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {recommendations.map((song, idx) => (
                  <motion.div
                    key={`${song.title}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass border-black/5 bg-transparent hover:bg-black/[0.02] transition-all group rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold group-hover:text-pink-600 transition-colors" style={{ color: '#000000' }}>{song.title}</h3>
                                <p className="font-medium" style={{ color: '#000000', opacity: 0.7 }}>{song.artist}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge className="bg-black/5 hover:bg-black/10 border-none rounded-lg" style={{ color: idx % 2 === 0 ? '#aa0f0f' : '#4c038b' }}>{song.genre}</Badge>
                                <Badge className="bg-pink-500/5 hover:bg-pink-500/10 border-none rounded-lg" style={{ color: idx % 2 === 0 ? '#b80505' : '#9b0000' }}>{song.mood}</Badge>
                              </div>
                            </div>
                            <Separator className="my-4 bg-black/5" />
                            <div className="flex gap-3 items-start">
                              <Info className="w-4 h-4 text-black/20 mt-1 shrink-0" />
                              <p className="text-sm leading-relaxed italic" style={{ color: '#000000', opacity: 0.6 }}>
                                "{song.reason}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : hasSearched && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass rounded-3xl"
            >
              <Music className="w-12 h-12 text-black/10 mx-auto mb-4" />
              <p className="text-black/40">추천곡을 찾을 수 없습니다. 다른 곡으로 시도해보세요.</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-24 text-center text-black/20 text-xs font-medium tracking-widest uppercase">
          Powered by Gemini AI • VibeFinder v1.0
        </footer>
      </main>
    </div>
  );
}
