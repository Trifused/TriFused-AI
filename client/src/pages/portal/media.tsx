import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { TermsModal } from "@/components/terms-modal";
import { 
  Video, 
  Music,
  LogOut, 
  ArrowLeft,
  Upload, 
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Crown,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Share2,
  Send,
  Lock,
  Globe,
  X,
  Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "@/components/ObjectUploader";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

function getStatusBadge(status: string) {
  switch (status) {
    case "private":
      return <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3" /> Private</Badge>;
    case "pending":
      return <Badge variant="outline" className="gap-1 text-yellow-500 border-yellow-500"><Clock className="w-3 h-3" /> Pending</Badge>;
    case "public":
      return <Badge variant="default" className="gap-1 bg-green-600"><Globe className="w-3 h-3" /> Public</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function MediaPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [shareItem, setShareItem] = useState<MediaItem | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [uploadDialog, setUploadDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ uploadURL: string; fileName: string; fileSize: number } | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadType, setUploadType] = useState<"video" | "audio">("video");
  const [playItem, setPlayItem] = useState<MediaItem | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access Media.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: myMedia = [], isLoading: myMediaLoading, refetch: refetchMyMedia } = useQuery<MediaItem[]>({
    queryKey: ["my-media"],
    queryFn: async () => {
      const res = await fetch("/api/media/my");
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: sharedMedia = [], isLoading: sharedMediaLoading } = useQuery<MediaItem[]>({
    queryKey: ["shared-media"],
    queryFn: async () => {
      const res = await fetch("/api/media/shared");
      if (!res.ok) throw new Error("Failed to fetch shared media");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete media");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Media deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["my-media"] });
      setDeleteItem(null);
    },
    onError: () => {
      toast({ title: "Failed to delete media", variant: "destructive" });
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/media/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      if (!res.ok) throw new Error("Failed to submit for approval");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Submitted for approval" });
      queryClient.invalidateQueries({ queryKey: ["my-media"] });
    },
    onError: () => {
      toast({ title: "Failed to submit for approval", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const res = await fetch(`/api/media/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to share media");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Media shared successfully" });
      setShareItem(null);
      setShareEmail("");
    },
    onError: () => {
      toast({ title: "Failed to share media", variant: "destructive" });
    },
  });

  const handleGetUploadParameters = async () => {
    const res = await fetch("/api/media/upload-url", { method: "POST" });
    if (!res.ok) throw new Error("Failed to get upload URL");
    const { uploadURL } = await res.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const fileName = file.name || "Untitled";
      const fileSize = file.size || 0;
      const uploadURL = file.uploadURL;
      
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension);
      
      setPendingUpload({ uploadURL, fileName, fileSize });
      setUploadTitle(fileName.replace(/\.[^/.]+$/, ""));
      setUploadType(isAudio ? "audio" : "video");
      setUploadDialog(true);
    }
  };

  const handleFinalizeUpload = async () => {
    if (!pendingUpload) return;
    
    try {
      const res = await fetch("/api/media/upload-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadURL: pendingUpload.uploadURL,
          fileName: pendingUpload.fileName,
          fileSize: pendingUpload.fileSize,
          title: uploadTitle || pendingUpload.fileName,
          description: uploadDescription || null,
          type: uploadType,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to save media");
      
      toast({ title: "Media uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["my-media"] });
      setUploadDialog(false);
      setPendingUpload(null);
      setUploadTitle("");
      setUploadDescription("");
    } catch (error) {
      toast({ title: "Failed to save media", variant: "destructive" });
    }
  };

  const handlePlay = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/media/${item.id}/url`);
      if (!res.ok) throw new Error("Failed to get media URL");
      const { downloadURL } = await res.json();
      setPlayItem(item);
      setPlayUrl(downloadURL);
    } catch (error) {
      toast({ title: "Failed to play media", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Media...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const needsTermsAcceptance = !user?.termsAcceptedAt;

  return (
    <div className="min-h-screen bg-background">
      <TermsModal isOpen={needsTermsAcceptance} userTermsVersion={user?.termsVersion} />
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLocation("/")}
                className="text-xl font-bold font-heading text-white"
                data-testid="link-home"
              >
                TriFused
              </button>
              <span className="text-muted-foreground">/</span>
              <button 
                onClick={() => setLocation("/portal/dashboard")}
                className="text-muted-foreground hover:text-white transition-colors"
                data-testid="link-dashboard"
              >
                Dashboard
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground flex items-center gap-2">
                <Video className="w-4 h-4" />
                Media
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className={`w-8 h-8 rounded-full object-cover border ${user?.role === 'superuser' ? 'border-yellow-500/30' : 'border-white/10'}`}
                    data-testid="img-user-avatar"
                  />
                )}
                <div className="text-sm">
                  <div className="text-white font-medium flex items-center gap-2" data-testid="text-user-name">
                    {user?.firstName || user?.email?.split('@')[0] || 'User'}
                    {user?.role === 'superuser' && <Crown className="w-3 h-3 text-yellow-500" />}
                    {user?.role === 'validated' && <UserCheck className="w-3 h-3 text-green-500" />}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Media</h1>
              <p className="text-muted-foreground">Upload and manage your videos and audio files</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  refetchMyMedia();
                }}
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={524288000}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="bg-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </ObjectUploader>
            </div>
          </div>

          <Tabs defaultValue="uploads" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="uploads" data-testid="tab-uploads">
                <Video className="w-4 h-4 mr-2" />
                My Uploads
              </TabsTrigger>
              <TabsTrigger value="shared" data-testid="tab-shared">
                <Share2 className="w-4 h-4 mr-2" />
                Shared With Me
              </TabsTrigger>
            </TabsList>

            <TabsContent value="uploads" className="mt-6">
              <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
                {myMediaLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading media...</p>
                  </div>
                ) : myMedia.length === 0 ? (
                  <div className="p-8 text-center">
                    <Video className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No media yet</h3>
                    <p className="text-muted-foreground mb-4">Upload your first video or audio file to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myMedia.map((item, index) => (
                        <TableRow key={item.id} data-testid={`row-media-${index}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {item.type === "video" ? (
                                <Video className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Music className="w-4 h-4 text-purple-400" />
                              )}
                              <div>
                                <div>{item.title}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.fileSize ? formatBytes(item.fileSize) : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(item.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlay(item)}
                                data-testid={`button-play-${index}`}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShareItem(item)}
                                data-testid={`button-share-${index}`}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              {item.status === "private" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => submitForApprovalMutation.mutate(item.id)}
                                  title="Submit for public approval"
                                  data-testid={`button-submit-${index}`}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteItem(item)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-${index}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shared" className="mt-6">
              <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
                {sharedMediaLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading shared media...</p>
                  </div>
                ) : sharedMedia.length === 0 ? (
                  <div className="p-8 text-center">
                    <Share2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No shared media</h3>
                    <p className="text-muted-foreground">Media shared with you will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Shared</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sharedMedia.map((item, index) => (
                        <TableRow key={item.id} data-testid={`row-shared-${index}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {item.type === "video" ? (
                                <Video className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Music className="w-4 h-4 text-purple-400" />
                              )}
                              <div>
                                <div>{item.title}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.fileSize ? formatBytes(item.fileSize) : '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(item.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlay(item)}
                              data-testid={`button-play-shared-${index}`}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!shareItem} onOpenChange={() => { setShareItem(null); setShareEmail(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Media</DialogTitle>
            <DialogDescription>
              Share "{shareItem?.title}" with another user by entering their email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-email">Email Address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="user@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                data-testid="input-share-email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShareItem(null); setShareEmail(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => shareItem && shareMutation.mutate({ id: shareItem.id, email: shareEmail })}
              disabled={!shareEmail || shareMutation.isPending}
              data-testid="button-confirm-share"
            >
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialog} onOpenChange={() => { setUploadDialog(false); setPendingUpload(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
            <DialogDescription>
              Add a title and description for your uploaded media.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="upload-title">Title</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter a title"
                data-testid="input-upload-title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upload-description">Description (optional)</Label>
              <Textarea
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Enter a description"
                data-testid="input-upload-description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Media Type</Label>
              <div className="flex gap-4">
                <Button
                  variant={uploadType === "video" ? "default" : "outline"}
                  onClick={() => setUploadType("video")}
                  className="flex-1"
                  data-testid="button-type-video"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button
                  variant={uploadType === "audio" ? "default" : "outline"}
                  onClick={() => setUploadType("audio")}
                  className="flex-1"
                  data-testid="button-type-audio"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Audio
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadDialog(false); setPendingUpload(null); }}>
              Cancel
            </Button>
            <Button
              onClick={handleFinalizeUpload}
              disabled={!uploadTitle}
              data-testid="button-save-upload"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!playItem} onOpenChange={() => { setPlayItem(null); setPlayUrl(null); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{playItem?.title}</DialogTitle>
            {playItem?.description && (
              <DialogDescription>{playItem.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">
            {playUrl && playItem?.type === "video" && (
              <video
                src={playUrl}
                controls
                autoPlay
                className="w-full rounded-lg"
                data-testid="video-player"
              />
            )}
            {playUrl && playItem?.type === "audio" && (
              <div className="flex flex-col items-center gap-4 p-8 bg-muted rounded-lg">
                <Music className="w-16 h-16 text-purple-400" />
                <audio
                  src={playUrl}
                  controls
                  autoPlay
                  className="w-full"
                  data-testid="audio-player"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
