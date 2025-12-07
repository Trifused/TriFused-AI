import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Video, Music, Play, Loader2, Terminal, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  type: "video" | "audio";
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  fileSize: number | null;
  status: "private" | "pending" | "public";
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function PublicMedia() {
  const [playItem, setPlayItem] = useState<MediaItem | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [loadingPlay, setLoadingPlay] = useState(false);

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["public-media"],
    queryFn: async () => {
      const res = await fetch("/api/media/public");
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
  });

  const handlePlay = async (item: MediaItem) => {
    setLoadingPlay(true);
    try {
      const res = await fetch(`/api/media/${item.id}/public-url`);
      if (!res.ok) throw new Error("Failed to get media URL");
      const { downloadURL } = await res.json();
      setPlayItem(item);
      setPlayUrl(downloadURL);
    } catch (error) {
      console.error("Failed to play media:", error);
    } finally {
      setLoadingPlay(false);
    }
  };

  const closePlayer = () => {
    setPlayItem(null);
    setPlayUrl(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-6">
                <Terminal className="w-3 h-3" />
                Media Gallery
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                Public <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Media</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Explore our collection of approved videos and audio content from the TriFused community.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-mono text-sm text-muted-foreground animate-pulse">Loading media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Video className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No public media yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                There is no approved public media to display at this time. Check back later for new content.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {media.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                  data-testid={`card-media-${item.id}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  <div className="glass-panel h-full p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      {item.type === "video" ? (
                        <Video className="w-20 h-20 text-blue-400 transform rotate-12" />
                      ) : (
                        <Music className="w-20 h-20 text-purple-400 transform rotate-12" />
                      )}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`text-xs font-mono px-2 py-1 rounded border ${
                          item.type === "video" 
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}>
                          {item.type === "video" ? (
                            <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>
                          ) : (
                            <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Audio</span>
                          )}
                        </span>
                        {item.fileSize && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatBytes(item.fileSize)}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold font-heading mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h2>
                      
                      {item.description && (
                        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-white/5 pt-4 mt-auto">
                        <span className="text-xs">
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlay(item)}
                          disabled={loadingPlay}
                          className="flex items-center gap-1 text-primary hover:text-primary/80"
                          data-testid={`button-play-${item.id}`}
                        >
                          <Play className="w-4 h-4" />
                          Play
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={!!playItem} onOpenChange={closePlayer}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-white/10">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closePlayer}
              data-testid="button-close-player"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{playItem?.title}</h3>
              {playItem?.description && (
                <p className="text-muted-foreground text-sm mb-4">{playItem.description}</p>
              )}
              
              {playUrl && playItem?.type === "video" && (
                <video
                  src={playUrl}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                  data-testid="video-player"
                >
                  Your browser does not support the video element.
                </video>
              )}
              
              {playUrl && playItem?.type === "audio" && (
                <div className="bg-white/5 rounded-lg p-8 flex flex-col items-center">
                  <Music className="w-24 h-24 text-purple-400 mb-6" />
                  <audio
                    src={playUrl}
                    controls
                    autoPlay
                    className="w-full"
                    data-testid="audio-player"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
