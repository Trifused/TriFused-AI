import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Terminal, 
  Play, 
  Wifi, 
  WifiOff, 
  Clock, 
  Wrench, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Loader2,
  Zap,
  Heart,
  Info,
  Send,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface ConsoleEntry {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'info';
  method?: string;
  content: string;
  responseTime?: number;
  success?: boolean;
  collapsed?: boolean;
}

interface ServerStats {
  connected: boolean;
  responseTime: number;
  toolCount: number;
  resourceCount: number;
  lastPing: Date | null;
  errorRate: number;
  requestCount: number;
  errorCount: number;
}

const COMMAND_TEMPLATES = [
  { name: "Ping", method: "ping", params: {} },
  { name: "List Tools", method: "tools/list", params: {} },
  { name: "Initialize", method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {} } },
  { name: "Check Health (example)", method: "tools/call", params: { name: "check_website_health", arguments: { url: "https://example.com" } } },
  { name: "Get About", method: "tools/call", params: { name: "get_about", arguments: {} } },
];

export default function MCPToolbox() {
  const [serverUrl, setServerUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [customCommand, setCustomCommand] = useState('{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "ping",\n  "params": {}\n}');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState<ServerStats>({
    connected: false,
    responseTime: 0,
    toolCount: 0,
    resourceCount: 0,
    lastPing: null,
    errorRate: 0,
    requestCount: 0,
    errorCount: 0,
  });
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleEntries]);

  const addConsoleEntry = (entry: Omit<ConsoleEntry, 'id' | 'timestamp'>) => {
    setConsoleEntries(prev => [...prev, {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }]);
  };

  const getFullUrl = () => {
    let url = serverUrl.trim();
    if (!url) return "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // Use http for localhost/127.0.0.1, https for everything else
      if (url.startsWith("localhost") || url.startsWith("127.0.0.1")) {
        url = "http://" + url;
      } else {
        url = "https://" + url;
      }
    }
    return url;
  };

  const sendMcpRequest = async (method: string, params: any = {}, showInConsole = true) => {
    const baseUrl = getFullUrl();
    if (!baseUrl) {
      toast({ title: "Error", description: "Please enter a server URL", variant: "destructive" });
      return null;
    }

    const endpoint = baseUrl.endsWith('/mcp/v1') ? baseUrl : `${baseUrl}/mcp/v1`;
    const requestId = Date.now();
    const requestBody = {
      jsonrpc: "2.0",
      id: requestId,
      method,
      params,
    };

    if (showInConsole) {
      addConsoleEntry({
        type: 'request',
        method,
        content: JSON.stringify(requestBody, null, 2),
      });
    }

    const startTime = performance.now();
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseTime = Math.round(performance.now() - startTime);
      const data = await response.json();

      setStats(prev => ({
        ...prev,
        responseTime: Math.round((prev.responseTime * prev.requestCount + responseTime) / (prev.requestCount + 1)),
        requestCount: prev.requestCount + 1,
        errorRate: Math.round((prev.errorCount / (prev.requestCount + 1)) * 100),
      }));

      if (showInConsole) {
        addConsoleEntry({
          type: 'response',
          method,
          content: JSON.stringify(data, null, 2),
          responseTime,
          success: !data.error,
        });
      }

      return { data, responseTime };
    } catch (error: any) {
      const responseTime = Math.round(performance.now() - startTime);
      
      setStats(prev => ({
        ...prev,
        requestCount: prev.requestCount + 1,
        errorCount: prev.errorCount + 1,
        errorRate: Math.round(((prev.errorCount + 1) / (prev.requestCount + 1)) * 100),
      }));

      if (showInConsole) {
        addConsoleEntry({
          type: 'error',
          method,
          content: error.message || 'Connection failed',
          responseTime,
          success: false,
        });
      }

      return null;
    }
  };

  const handleConnect = async () => {
    if (!serverUrl.trim()) {
      toast({ title: "Error", description: "Please enter a server URL", variant: "destructive" });
      return;
    }

    setIsConnecting(true);
    addConsoleEntry({
      type: 'info',
      content: `Connecting to ${getFullUrl()}...`,
    });

    const initResult = await sendMcpRequest("initialize", { 
      protocolVersion: "2024-11-05", 
      capabilities: {} 
    });

    if (initResult?.data && !initResult.data.error) {
      const toolsResult = await sendMcpRequest("tools/list", {}, false);
      const toolCount = toolsResult?.data?.result?.tools?.length || 0;

      setStats(prev => ({
        ...prev,
        connected: true,
        toolCount,
        resourceCount: 0,
        lastPing: new Date(),
      }));

      addConsoleEntry({
        type: 'info',
        content: `Connected! Server has ${toolCount} tools available.`,
      });
    } else {
      setStats(prev => ({ ...prev, connected: false }));
      addConsoleEntry({
        type: 'error',
        content: 'Connection failed. Check the server URL and try again.',
        success: false,
      });
    }

    setIsConnecting(false);
  };

  const handlePing = async () => {
    const result = await sendMcpRequest("ping");
    if (result) {
      setStats(prev => ({ ...prev, lastPing: new Date() }));
    }
  };

  const handleListTools = async () => {
    const result = await sendMcpRequest("tools/list");
    if (result?.data?.result?.tools) {
      setStats(prev => ({ ...prev, toolCount: result.data.result.tools.length }));
    }
  };

  const handleListResources = async () => {
    const result = await sendMcpRequest("resources/list");
    if (result?.data?.result?.resources) {
      setStats(prev => ({ ...prev, resourceCount: result.data.result.resources.length }));
    }
  };

  const handleHealthCheck = async () => {
    const baseUrl = getFullUrl();
    if (!baseUrl) return;

    addConsoleEntry({
      type: 'request',
      method: 'GET /health',
      content: `Fetching ${baseUrl}/health`,
    });

    const startTime = performance.now();
    try {
      const response = await fetch(`${baseUrl}/health`);
      const responseTime = Math.round(performance.now() - startTime);
      const text = await response.text();
      
      addConsoleEntry({
        type: 'response',
        method: 'GET /health',
        content: `Status: ${response.status}\n${text}`,
        responseTime,
        success: response.ok,
      });
    } catch (error: any) {
      addConsoleEntry({
        type: 'error',
        method: 'GET /health',
        content: error.message,
        success: false,
      });
    }
  };

  const handleServerInfo = async () => {
    await sendMcpRequest("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
  };

  const handleSendCustom = async () => {
    try {
      const parsed = JSON.parse(customCommand);
      setCommandHistory(prev => [customCommand, ...prev.slice(0, 19)]);
      
      addConsoleEntry({
        type: 'request',
        method: parsed.method || 'custom',
        content: customCommand,
      });

      const baseUrl = getFullUrl();
      const endpoint = baseUrl.endsWith('/mcp/v1') ? baseUrl : `${baseUrl}/mcp/v1`;
      const startTime = performance.now();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: customCommand,
      });

      const responseTime = Math.round(performance.now() - startTime);
      const data = await response.json();

      addConsoleEntry({
        type: 'response',
        method: parsed.method || 'custom',
        content: JSON.stringify(data, null, 2),
        responseTime,
        success: !data.error,
      });
    } catch (error: any) {
      addConsoleEntry({
        type: 'error',
        content: `Invalid JSON: ${error.message}`,
        success: false,
      });
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
  };

  const handleClearConsole = () => {
    setConsoleEntries([]);
  };

  const toggleCollapse = (id: string) => {
    setConsoleEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, collapsed: !entry.collapsed } : entry
    ));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const useTemplate = (template: typeof COMMAND_TEMPLATES[0]) => {
    const cmd = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: template.method,
      params: template.params,
    };
    setCustomCommand(JSON.stringify(cmd, null, 2));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Terminal className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-white">MCP Toolbox</h1>
            </div>
            <p className="text-muted-foreground">
              Test and debug Model Context Protocol servers with this interactive console
            </p>
          </motion.div>

          {/* Server Connection */}
          <div className="glass-panel p-4 rounded-xl mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Server URL (e.g., https://trifused.com or localhost:5000)"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="bg-black/50 border-white/10 font-mono text-sm"
                  data-testid="input-server-url"
                />
              </div>
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !serverUrl.trim()}
                className="bg-primary hover:bg-primary/90"
                data-testid="btn-connect"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : stats.connected ? (
                  <Wifi className="w-4 h-4 mr-2" />
                ) : (
                  <WifiOff className="w-4 h-4 mr-2" />
                )}
                {stats.connected ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {stats.connected ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                Status
              </div>
              <div className={`font-semibold ${stats.connected ? 'text-green-500' : 'text-red-500'}`}>
                {stats.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                Avg Response
              </div>
              <div className="font-semibold text-white">{stats.responseTime}ms</div>
            </div>
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Wrench className="w-3 h-3" />
                Tools
              </div>
              <div className="font-semibold text-white">{stats.toolCount}</div>
            </div>
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Database className="w-3 h-3" />
                Resources
              </div>
              <div className="font-semibold text-white">{stats.resourceCount}</div>
            </div>
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Heart className="w-3 h-3" />
                Last Ping
              </div>
              <div className="font-semibold text-white text-sm">
                {stats.lastPing ? formatTime(stats.lastPing) : '--:--:--'}
              </div>
            </div>
            <div className="glass-panel p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <AlertCircle className="w-3 h-3" />
                Error Rate
              </div>
              <div className={`font-semibold ${stats.errorRate > 20 ? 'text-red-500' : stats.errorRate > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                {stats.errorRate}%
              </div>
            </div>
          </div>

          {/* Command Buttons */}
          <div className="glass-panel p-4 rounded-xl mb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePing}
                disabled={!stats.connected}
                className="border-primary/30 hover:bg-primary/10"
                data-testid="btn-ping"
              >
                <Zap className="w-4 h-4 mr-2" />
                Ping
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleListTools}
                disabled={!stats.connected}
                className="border-primary/30 hover:bg-primary/10"
                data-testid="btn-list-tools"
              >
                <Wrench className="w-4 h-4 mr-2" />
                List Tools
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleListResources}
                disabled={!stats.connected}
                className="border-primary/30 hover:bg-primary/10"
                data-testid="btn-list-resources"
              >
                <Database className="w-4 h-4 mr-2" />
                List Resources
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHealthCheck}
                disabled={!serverUrl.trim()}
                className="border-primary/30 hover:bg-primary/10"
                data-testid="btn-health"
              >
                <Heart className="w-4 h-4 mr-2" />
                Health Check
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleServerInfo}
                disabled={!stats.connected}
                className="border-primary/30 hover:bg-primary/10"
                data-testid="btn-server-info"
              >
                <Info className="w-4 h-4 mr-2" />
                Server Info
              </Button>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearConsole}
                className="text-muted-foreground hover:text-white"
                data-testid="btn-clear-console"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Console Output */}
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-white">Console Output</span>
                </div>
                <span className="text-xs text-muted-foreground">{consoleEntries.length} entries</span>
              </div>
              <div 
                ref={consoleRef}
                className="h-[400px] overflow-y-auto p-4 bg-black/80 font-mono text-sm space-y-3"
                data-testid="console-output"
              >
                {consoleEntries.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">
                    Connect to a server and run commands to see output here
                  </div>
                ) : (
                  consoleEntries.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-white/10 pl-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span className="text-primary/70">[{formatTime(entry.timestamp)}]</span>
                        {entry.type === 'request' && <span className="text-blue-400">REQUEST</span>}
                        {entry.type === 'response' && (
                          entry.success ? (
                            <span className="text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> SUCCESS
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> ERROR
                            </span>
                          )
                        )}
                        {entry.type === 'error' && (
                          <span className="text-red-400 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> ERROR
                          </span>
                        )}
                        {entry.type === 'info' && <span className="text-cyan-400">INFO</span>}
                        {entry.method && <span className="text-yellow-400">{entry.method}</span>}
                        {entry.responseTime !== undefined && (
                          <span className="text-muted-foreground">({entry.responseTime}ms)</span>
                        )}
                        <button
                          onClick={() => handleCopy(entry.content)}
                          className="ml-auto text-muted-foreground hover:text-white"
                          title="Copy"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {entry.content.length > 100 && (
                          <button
                            onClick={() => toggleCollapse(entry.id)}
                            className="text-muted-foreground hover:text-white"
                          >
                            {entry.collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      <pre className={`text-white/90 whitespace-pre-wrap break-all ${entry.collapsed ? 'line-clamp-3' : ''}`}>
                        {entry.content}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Custom Command */}
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-white">Custom Command</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="text-xs bg-black/50 border border-white/10 rounded px-2 py-1 text-white"
                    onChange={(e) => {
                      const template = COMMAND_TEMPLATES.find(t => t.name === e.target.value);
                      if (template) useTemplate(template);
                    }}
                    defaultValue=""
                    data-testid="select-template"
                  >
                    <option value="" disabled>Templates...</option>
                    {COMMAND_TEMPLATES.map(t => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-1 rounded ${showHistory ? 'text-primary' : 'text-muted-foreground'} hover:text-white`}
                    title="Command History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {showHistory && commandHistory.length > 0 && (
                <div className="border-b border-white/10 p-2 bg-black/50 max-h-32 overflow-y-auto">
                  <div className="text-xs text-muted-foreground mb-1">Recent Commands:</div>
                  {commandHistory.slice(0, 5).map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => setCustomCommand(cmd)}
                      className="block w-full text-left text-xs font-mono text-white/70 hover:text-white truncate py-1 px-2 hover:bg-white/5 rounded"
                    >
                      {cmd.substring(0, 80)}...
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 bg-black/80">
                <textarea
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  className="w-full h-64 bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-sm text-white resize-none focus:outline-none focus:border-primary/50"
                  placeholder='{"jsonrpc": "2.0", "id": 1, "method": "ping"}'
                  data-testid="textarea-custom-command"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    JSON-RPC 2.0 format required
                  </span>
                  <Button
                    onClick={handleSendCustom}
                    disabled={!serverUrl.trim()}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="btn-send-custom"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 glass-panel p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-2">Quick Tips</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-muted-foreground">
              <div>
                <span className="text-primary">Test our server:</span> Enter <code className="bg-black/50 px-1 rounded">trifused.com</code>
              </div>
              <div>
                <span className="text-primary">Local testing:</span> Use <code className="bg-black/50 px-1 rounded">localhost:5000</code>
              </div>
              <div>
                <span className="text-primary">MCP endpoint:</span> <code className="bg-black/50 px-1 rounded">/mcp/v1</code> is auto-appended
              </div>
              <div>
                <span className="text-primary">Protocol:</span> JSON-RPC 2.0 over HTTP POST
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
