import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  HardDrive, 
  LogOut, 
  ArrowLeft,
  Upload, 
  Download,
  Trash2,
  RefreshCw,
  FileIcon,
  FolderIcon,
  Clock,
  Crown,
  UserCheck,
  FileUp,
  FileDown,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
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

interface StorageFile {
  name: string;
  size: number;
  updated: string;
  contentType: string;
}

interface FileTransfer {
  id: string;
  fileName: string;
  fileSize: number;
  operation: string;
  status: string;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function MFTPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteFile, setDeleteFile] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access MFT.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: files = [], isLoading: filesLoading, refetch: refetchFiles } = useQuery<StorageFile[]>({
    queryKey: ["mft-files"],
    queryFn: async () => {
      const res = await fetch("/api/mft/files");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access denied");
        }
        throw new Error("Failed to fetch files");
      }
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: transfers = [], isLoading: transfersLoading } = useQuery<FileTransfer[]>({
    queryKey: ["mft-transfers"],
    queryFn: async () => {
      const res = await fetch("/api/mft/transfers");
      if (!res.ok) throw new Error("Failed to fetch transfers");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (path: string) => {
      const res = await fetch(`/api/mft/files/${encodeURIComponent(path)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete file");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "File deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["mft-files"] });
      queryClient.invalidateQueries({ queryKey: ["mft-transfers"] });
      setDeleteFile(null);
    },
    onError: () => {
      toast({ title: "Failed to delete file", variant: "destructive" });
    },
  });

  const handleDownload = async (fileName: string) => {
    try {
      const res = await fetch(`/api/mft/download/${encodeURIComponent(fileName)}`);
      if (!res.ok) throw new Error("Failed to get download URL");
      const { downloadURL } = await res.json();
      window.open(downloadURL, "_blank");
      queryClient.invalidateQueries({ queryKey: ["mft-transfers"] });
    } catch (error) {
      toast({ title: "Failed to download file", variant: "destructive" });
    }
  };

  const handleGetUploadParameters = async () => {
    const res = await fetch("/api/mft/upload-url", { method: "POST" });
    if (!res.ok) throw new Error("Failed to get upload URL");
    const { uploadURL } = await res.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      for (const file of result.successful) {
        await fetch("/api/mft/upload-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadURL: file.uploadURL,
            fileName: file.name,
            fileSize: file.size,
          }),
        });
      }
      toast({ title: "File uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["mft-files"] });
      queryClient.invalidateQueries({ queryKey: ["mft-transfers"] });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading MFT...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasFtpAccess = user?.ftpAccess === 1 || user?.role === "superuser";

  if (!hasFtpAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the Managed File Transfer service. 
            Please contact your administrator to request access.
          </p>
          <Button onClick={() => setLocation("/portal/dashboard")} data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                <HardDrive className="w-4 h-4" />
                MFT
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
              <h1 className="text-3xl font-bold text-white mb-2">Managed File Transfer</h1>
              <p className="text-muted-foreground">Securely upload, download, and manage your files</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => refetchFiles()}
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <ObjectUploader
                maxNumberOfFiles={5}
                maxFileSize={104857600}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="bg-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </ObjectUploader>
            </div>
          </div>

          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="files" data-testid="tab-files">
                <FolderIcon className="w-4 h-4 mr-2" />
                Files
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                <Clock className="w-4 h-4 mr-2" />
                Transfer History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="mt-6">
              <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
                {filesLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading files...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center">
                    <FolderIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No files yet</h3>
                    <p className="text-muted-foreground mb-4">Upload your first file to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file, index) => (
                        <TableRow key={file.name} data-testid={`row-file-${index}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileIcon className="w-4 h-4 text-muted-foreground" />
                              {file.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.contentType}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatBytes(file.size)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(file.updated), "MMM d, yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(file.name)}
                                data-testid={`button-download-${index}`}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteFile(file.name)}
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

            <TabsContent value="history" className="mt-6">
              <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
                {transfersLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading transfer history...</p>
                  </div>
                ) : transfers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Clock className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No transfer history</h3>
                    <p className="text-muted-foreground">Your file transfer activity will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operation</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers.map((transfer, index) => (
                        <TableRow key={transfer.id} data-testid={`row-transfer-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transfer.operation === "upload" && <FileUp className="w-4 h-4 text-green-500" />}
                              {transfer.operation === "download" && <FileDown className="w-4 h-4 text-blue-500" />}
                              {transfer.operation === "delete" && <Trash2 className="w-4 h-4 text-red-500" />}
                              <span className="capitalize">{transfer.operation}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{transfer.fileName}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {transfer.fileSize > 0 ? formatBytes(transfer.fileSize) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transfer.status === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={transfer.status === "success" ? "text-green-500" : "text-red-500"}>
                                {transfer.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(transfer.createdAt), "MMM d, yyyy HH:mm")}
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

      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteFile}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFile && deleteMutation.mutate(deleteFile)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
