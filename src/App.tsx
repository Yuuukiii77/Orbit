import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Orbit, 
  Compass, 
  Clock, 
  Sparkles, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  Check, 
  Download, 
  Share2, 
  MessageSquare, 
  X, 
  AlertCircle,
  Volume2,
  VolumeX,
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react';

// Tree Interface for Recursive Nesting
interface Node {
  id: string;
  name: string;
  type: 'identity' | 'project' | 'task';
  targetMinutes: number;
  actualMinutes: number;
  children?: Node[];
}

// Initial Identities and Seed Data
const initialTree: Node[] = [
  {
    id: 'build',
    name: 'Build',
    type: 'identity',
    targetMinutes: 120,
    actualMinutes: 45,
    children: [
      {
        id: 'build-p1',
        name: 'Orbit App Development',
        type: 'project',
        targetMinutes: 90,
        actualMinutes: 30,
        children: [
          { id: 'build-t1', name: 'Design core 3D slanted timer', type: 'task', targetMinutes: 45, actualMinutes: 30 },
          { id: 'build-t2', name: 'Implement recursive tree nesting', type: 'task', targetMinutes: 45, actualMinutes: 0 },
        ]
      }
    ]
  },
  {
    id: 'refine',
    name: 'Refine',
    type: 'identity',
    targetMinutes: 90,
    actualMinutes: 60,
    children: [
      {
        id: 'refine-p1',
        name: 'NASA Minimalism UI',
        type: 'project',
        targetMinutes: 90,
        actualMinutes: 60,
        children: [
          { id: 'refine-t1', name: 'Adjust pure high-contrast borders', type: 'task', targetMinutes: 45, actualMinutes: 30 },
          { id: 'refine-t2', name: 'Tune stardust grain overlay SVG', type: 'task', targetMinutes: 45, actualMinutes: 30 },
        ]
      }
    ]
  },
  {
    id: 'explore',
    name: 'Explore',
    type: 'identity',
    targetMinutes: 60,
    actualMinutes: 0,
    children: [
      {
        id: 'explore-p1',
        name: 'Astronomy & Gravitational Fields',
        type: 'project',
        targetMinutes: 60,
        actualMinutes: 0,
        children: [
          { id: 'explore-t1', name: 'Read on orbital resonance mechanics', type: 'task', targetMinutes: 60, actualMinutes: 0 },
        ]
      }
    ]
  },
  {
    id: 'connect',
    name: 'Connect',
    type: 'identity',
    targetMinutes: 60,
    actualMinutes: 15,
    children: [
      {
        id: 'connect-p1',
        name: 'Launch Logistics',
        type: 'project',
        targetMinutes: 60,
        actualMinutes: 15,
        children: [
          { id: 'connect-t1', name: 'Draft TestFlight alpha feedback form', type: 'task', targetMinutes: 60, actualMinutes: 15 },
        ]
      }
    ]
  },
  {
    id: 'restore',
    name: 'Restore',
    type: 'identity',
    targetMinutes: 90,
    actualMinutes: 45,
    children: [
      {
        id: 'restore-p1',
        name: 'Somatic Calibration',
        type: 'project',
        targetMinutes: 90,
        actualMinutes: 45,
        children: [
          { id: 'restore-t1', name: 'Diaphragmatic micro-breathing loops', type: 'task', targetMinutes: 45, actualMinutes: 30 },
          { id: 'restore-t2', name: 'Deep rest solar cycle sleep adjustment', type: 'task', targetMinutes: 45, actualMinutes: 15 },
        ]
      }
    ]
  }
];

// Helper to recursively recalculate aggregated minutes from leaf tasks up to projects and identities
const recalculateMinutes = (nodes: Node[]): Node[] => {
  return nodes.map(node => {
    if (node.children && node.children.length > 0) {
      const updatedChildren = recalculateMinutes(node.children);
      const totalTarget = updatedChildren.reduce((acc, child) => acc + child.targetMinutes, 0);
      const totalActual = updatedChildren.reduce((acc, child) => acc + child.actualMinutes, 0);
      return {
        ...node,
        children: updatedChildren,
        targetMinutes: totalTarget,
        actualMinutes: totalActual
      };
    }
    return node;
  });
};

export default function App() {
  // Core States
  const [tree, setTree] = useState<Node[]>(() => recalculateMinutes(initialTree));
  const [selectedTaskId, setSelectedTaskId] = useState<string>('build-t1');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'build': true, 'build-p1': true, 'refine': true, 'refine-p1': true
  });
  
  // Timer states
  const [focusDuration, setFocusDuration] = useState<number>(25 * 60); // 25 mins in seconds
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [orbitActive, setOrbitActive] = useState<boolean>(false); // Focus overlay view state
  const [abortConfirmation, setAbortConfirmation] = useState<boolean>(false);
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Node Creation modal state
  const [isAddingNode, setIsAddingNode] = useState<boolean>(false);
  const [parentNodeId, setParentNodeId] = useState<string | null>(null);
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeType, setNewNodeType] = useState<'project' | 'task'>('project');
  const [newNodeTarget, setNewNodeTarget] = useState<number>(45);

  // AI Co-pilot Chat State
  const [aiChatOpen, setAiChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Monetization / Pro state
  const [isPro, setIsPro] = useState<boolean>(false);
  const [trialsUsed, setTrialsUsed] = useState<number>(0);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutCard, setCheckoutCard] = useState<string>('');
  const [checkoutExpiry, setCheckoutExpiry] = useState<string>('');
  const [checkoutCvv, setCheckoutCvv] = useState<string>('');
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  
  // Export states
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Find active node in the tree
  const activeTask = useMemo(() => {
    const findNode = (nodes: Node[], id: string): Node | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(tree, selectedTaskId);
  }, [tree, selectedTaskId]);

  // Recursively calculate Alignment Index
  // Formula: average of alignment ratio of the 5 main identities
  const alignmentIndex = useMemo(() => {
    let sum = 0;
    const identities = tree.filter(n => n.type === 'identity');
    identities.forEach(id => {
      if (id.targetMinutes === 0) {
        sum += id.actualMinutes > 0 ? 100 : 100;
      } else {
        sum += Math.min(100, (id.actualMinutes / id.targetMinutes) * 100);
      }
    });
    return Math.round(sum / (identities.length || 1));
  }, [tree]);

  // Handle timer countdown tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      handleOrbitCompleted();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Gravity-assist chime sound generator via Web Audio API
  const playGravityChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // High clean cosmic pitch sequence
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      osc.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.35); // G6
      osc.frequency.exponentialRampToValueAtTime(2093.00, ctx.currentTime + 0.6); // C7
      
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (err) {
      console.warn("Web Audio chime failed", err);
    }
  };

  // Timer Completion Handler
  const handleOrbitCompleted = () => {
    setTimerRunning(false);
    playGravityChime();
    
    // Log actual minutes to the active task
    const completedMinutes = Math.round(focusDuration / 60);
    
    const updateTaskMinutes = (nodes: Node[]): Node[] => {
      return nodes.map(node => {
        if (node.id === selectedTaskId) {
          return {
            ...node,
            actualMinutes: node.actualMinutes + completedMinutes
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateTaskMinutes(node.children)
          };
        }
        return node;
      });
    };

    const updatedTree = updateTaskMinutes(tree);
    setTree(recalculateMinutes(updatedTree));
    
    // Show a small micro-vibration visual bounce & complete state
    alert(`Orbit Completed! Logged ${completedMinutes} mins to "${activeTask?.name}". Aligning gravity vectors.`);
    setOrbitActive(false);
    setTimeLeft(focusDuration);
  };

  // Safe Exit with double confirmation
  const initiateAbortOrbit = () => {
    setAbortConfirmation(true);
    setTimerRunning(false);
  };

  const confirmAbortOrbit = () => {
    setAbortConfirmation(false);
    setOrbitActive(false);
    setTimerRunning(false);
    setTimeLeft(focusDuration);
  };

  const cancelAbortOrbit = () => {
    setAbortConfirmation(false);
    setTimerRunning(true);
  };

  // Toggle node expansion in recursive list
  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursively add node to tree
  const handleAddNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !parentNodeId) return;

    const newNode: Node = {
      id: `${newNodeType}-${Date.now()}`,
      name: newNodeName,
      type: newNodeType,
      targetMinutes: newNodeTarget,
      actualMinutes: 0,
      children: newNodeType === 'project' ? [] : undefined
    };

    const insertNode = (nodes: Node[]): Node[] => {
      return nodes.map(node => {
        if (node.id === parentNodeId) {
          return {
            ...node,
            children: [...(node.children || []), newNode]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: insertNode(node.children)
          };
        }
        return node;
      });
    };

    const updatedTree = insertNode(tree);
    setTree(recalculateMinutes(updatedTree));
    setExpandedNodes(prev => ({ ...prev, [parentNodeId]: true }));
    setIsAddingNode(false);
    setNewNodeName('');
  };

  // Delete node recursively
  const handleDeleteNode = (id: string) => {
    if (confirm("Are you sure you want to dissolve this orbit element? All child tasks and logs will be permanently deleted.")) {
      const deleteNode = (nodes: Node[]): Node[] => {
        return nodes
          .filter(node => node.id !== id)
          .map(node => {
            if (node.children) {
              return {
                ...node,
                children: deleteNode(node.children)
              };
            }
            return node;
          });
      };
      
      const updatedTree = deleteNode(tree);
      setTree(recalculateMinutes(updatedTree));
      if (selectedTaskId === id) {
        setSelectedTaskId('');
      }
    }
  };

  // AI Reflection server request handler (Co-pilot)
  const triggerAiReflection = async (customPrompt?: string) => {
    if (!isPro && trialsUsed >= 5) {
      setCheckoutModalOpen(true);
      return;
    }

    setAiChatOpen(true);
    setAiLoading(true);
    setAiError(null);

    const promptMessage = customPrompt || "Hello Warm Observer, reflect on my current alignment and state of focus. Suggest a path of resonance.";
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: promptMessage }];
    setChatMessages(updatedMessages);
    setUserInput('');

    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alignmentIndex,
          identities: tree.map(id => ({ name: id.name, target: id.targetMinutes, actual: id.actualMinutes })),
          history: [], // Completed focus sessions can go here
          message: promptMessage,
          chatHistory: chatMessages
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setChatMessages([...updatedMessages, { role: 'assistant', content: data.text }]);
      if (!isPro) {
        setTrialsUsed(prev => prev + 1);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to establish gravity link with Co-pilot. Please check your network or secrets configurations.");
    } finally {
      setAiLoading(false);
    }
  };

  // Simulated Pro Purchase Setup
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutCard || !checkoutExpiry || !checkoutCvv) {
      alert("Please configure all credit card vectors.");
      return;
    }
    setPurchaseLoading(true);
    setTimeout(() => {
      setPurchaseLoading(false);
      setPurchaseSuccess(true);
      setTimeout(() => {
        setIsPro(true);
        setCheckoutModalOpen(false);
        setPurchaseSuccess(false);
        setCheckoutName('');
        setCheckoutCard('');
        setCheckoutExpiry('');
        setCheckoutCvv('');
        alert("Transaction complete. Orbit Pro Unlimited Gravity unlocked.");
      }, 1500);
    }, 2000);
  };

  // Format seconds to monospace MM:SS string
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3D Orbital ring coordinate calculation (Rotated Ellipse)
  const calculateOrbiterCoords = (percent: number) => {
    const cx = 150;
    const cy = 150;
    const rx = 120;
    const ry = 42;
    const rotationRad = -30 * Math.PI / 180; // Rotated slanted orbit
    
    // Calculate unrotated local orbital angle
    const theta = (2 * Math.PI * percent) - Math.PI / 2;
    const xLocal = rx * Math.cos(theta);
    const yLocal = ry * Math.sin(theta);
    
    // Rotate 2D coordinate vector
    const xRotated = xLocal * Math.cos(rotationRad) - yLocal * Math.sin(rotationRad);
    const yRotated = xLocal * Math.sin(rotationRad) + yLocal * Math.cos(rotationRad);
    
    return {
      x: cx + xRotated,
      y: cy + yRotated
    };
  };

  // Render recursion for Project Hub Tree
  const renderTreeItem = (node: Node, depth: number = 0) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedTaskId === node.id;
    
    const alignmentRatio = node.targetMinutes > 0 
      ? Math.min(100, Math.round((node.actualMinutes / node.targetMinutes) * 100))
      : 100;

    return (
      <div key={node.id} className="select-none text-xs">
        {/* Row element */}
        <div 
          className={`flex items-center justify-between py-1.5 px-3 border border-white/5 my-1 transition-all group ${
            isSelected 
              ? 'bg-white text-black border-white' 
              : 'hover:bg-white/5 text-white/80 hover:text-white'
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 16)}px` }}
        >
          <div className="flex items-center gap-2 flex-1 cursor-pointer min-w-0" onClick={() => {
            if (node.type === 'task') {
              setSelectedTaskId(node.id);
            } else {
              toggleExpand(node.id);
            }
          }}>
            {node.type !== 'task' ? (
              <span className="opacity-50">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ) : (
              <Clock className={`w-3 h-3 ${isSelected ? 'text-black' : 'text-white/40'}`} />
            )}
            <span className={`truncate ${node.type === 'identity' ? 'font-semibold tracking-wider uppercase' : ''}`}>
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            {/* Target/Actual duration pill */}
            <span className={`font-mono text-[10px] opacity-60`}>
              {node.actualMinutes}/{node.targetMinutes}m
            </span>

            {/* Micro progress line */}
            <div className={`w-10 h-1 bg-white/10 rounded-full overflow-hidden hidden sm:block`}>
              <div 
                className={`h-full ${isSelected ? 'bg-black' : 'bg-white'}`} 
                style={{ width: `${alignmentRatio}%` }} 
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {node.type !== 'task' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setParentNodeId(node.id);
                    setNewNodeType(node.type === 'identity' ? 'project' : 'task');
                    setIsAddingNode(true);
                  }}
                  title={`Add ${node.type === 'identity' ? 'Project' : 'Task'}`}
                  className={`p-1 hover:bg-white/10 ${isSelected ? 'text-black hover:bg-black/10' : 'text-white/60 hover:text-white'}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
              {node.type !== 'identity' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                  title="Dissolve node"
                  className={`p-1 hover:bg-white/10 ${isSelected ? 'text-black hover:bg-black/10' : 'text-white/60 hover:text-white'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children render */}
        {isExpanded && node.children && (
          <div className="border-l border-white/5 ml-3">
            {node.children.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Swiss style stardust PNG canvas drawing export
  const exportSwissCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-resolution context size (Swiss Typography style)
    const size = 800;
    canvas.width = size;
    canvas.height = size;

    // Draw dark space background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    // Draw stardust grain noise
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const opacity = Math.random() * 0.4;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }

    // Draw subtle grid guides (NASA Minimalism details)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    const gridSize = 80;
    for (let x = gridSize; x < size; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = gridSize; y < size; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Draw Border Frames
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, size - 80, size - 80);

    // Draw Branding & Swiss-Style Headers
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic bold 36px Georgia, serif';
    ctx.fillText('O R B I T', 80, 110);

    ctx.font = '12px Courier New, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('NASA SYSTEM INTERFACE v3.1', 80, 140);
    ctx.fillText(`UTC TIMESTAMP: ${new Date().toISOString().substring(0, 10)}`, 80, 160);

    // Alignment Index display
    ctx.font = '300 24px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('REALITY VS. INTENTION ALIGNMENT', 80, 240);
    
    ctx.font = 'bold 96px -apple-system, sans-serif';
    ctx.fillText(`${alignmentIndex}%`, 80, 340);

    // 3D Slanted Orbital graphical simulation on card
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.save();
    ctx.translate(560, 280);
    ctx.rotate(-25 * Math.PI / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 40, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Actual aligned state ring glow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 110 * (alignmentIndex / 100), 40 * (alignmentIndex / 100), 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0; // reset

    // Draw identities statistics
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    let startY = 440;
    
    tree.filter(n => n.type === 'identity').forEach((node) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px Courier New, monospace';
      ctx.fillText(node.name.toUpperCase(), 80, startY + 5);

      const ratio = node.targetMinutes > 0 ? Math.min(100, Math.round((node.actualMinutes / node.targetMinutes) * 100)) : 100;
      
      // Background bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(200, startY - 8, 400, 10);
      
      // Aligned bar
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(200, startY - 8, 400 * (ratio / 100), 10);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Courier New, monospace';
      ctx.fillText(`${node.actualMinutes}/${node.targetMinutes} MIN`, 620, startY + 5);

      startY += 40;
    });

    // Branding Slogan
    ctx.font = 'italic 14px Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('"Control your life. Own your future."', 80, 680);

    // Watermark check
    ctx.font = '9px Courier New, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    if (!isPro) {
      ctx.fillText('PRODUCED VIA ORBIT AD-SUPPORTED FREE ENGINE • WATERMARKED SYSTEM', 80, 720);
      ctx.fillText('UPGRADE FOR $4.99 TO UNLOCK THE LIFETIME CLEAN GRAVITY ARCHIVE', 80, 735);
    } else {
      ctx.fillText('ORBIT PRO SYSTEM SEALS • ALIGNMENT CERTIFIED • ZERO AD-NOISE', 80, 720);
    }

    // Trigger download
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `orbit_alignment_${new Date().toISOString().substring(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      
      setExportSuccessMessage("Swiss-style stardust card generated and saved to your device gravity archive.");
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Canvas extraction failed. Please reload or test in a separate tab.");
    }
  };

  // Helper values for active timer tracking percent
  const percentComplete = (timeLeft / focusDuration);
  const orbitalPosition = calculateOrbiterCoords(1 - percentComplete);

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col font-sans noise-overlay selection:bg-white selection:text-black">
      
      {/* Offscreen Canvas for High-Resolution Swiss Typography Exports */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Top Banner Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Neon Logo */}
          <div className="relative w-9 h-9 flex items-center justify-center border border-white rounded-full">
            <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '40s' }} />
            <div className="absolute inset-0 border border-white/20 rounded-full scale-110 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif italic text-xl tracking-wider font-semibold">Orbit</span>
              <span className="text-[9px] font-mono border border-white/30 px-1 py-0.5 rounded uppercase opacity-60">Control Your Future</span>
            </div>
            <p className="text-[10px] font-mono text-white/50 tracking-tight">Control your life. Own your future.</p>
          </div>
        </div>

        {/* Global Stats and Action Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2 border border-white/15 hover:bg-white/5 rounded text-white/60 hover:text-white"
            title={soundEnabled ? "Mute chimes" : "Enable chimes"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Alignment Index Pill */}
          <div className="px-3 py-1.5 border border-white/20 bg-white/5 rounded flex items-center gap-2">
            <Compass className="w-4 h-4 text-white animate-pulse" />
            <span className="text-[10px] font-mono text-white/60 uppercase">Alignment</span>
            <span className="font-mono font-bold text-white text-sm">{alignmentIndex}%</span>
          </div>

          {/* Trials Used Badge / Pro buyout button */}
          {!isPro ? (
            <div className="flex items-center">
              <button 
                onClick={() => setCheckoutModalOpen(true)}
                className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3 py-1.5 border border-white flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Upgrade Pro</span>
              </button>
              <span className="text-[10px] font-mono text-white/40 ml-2">
                Trials: {trialsUsed}/5
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-mono border border-white/20 text-white/80 px-2 py-1 bg-white/10 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white" />
              Pro License Active
            </span>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        
        {/* LEFT COLUMN: Infinite Recursive Project Hub (Span 4) */}
        <section id="project-hub" className="lg:col-span-4 border border-white/10 bg-black/40 backdrop-blur px-5 py-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white/70" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-white/90">Project Hub</h2>
            </div>
            <span className="text-[9px] font-mono text-white/40 uppercase">Identity &gt; Project &gt; Task</span>
          </div>

          <p className="text-[11px] text-white/50 mb-3 leading-relaxed">
            Time management is about alignment, not restriction. Expand identity blocks and select a focus task.
          </p>

          {/* Tree Component List Container */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {tree.map(node => renderTreeItem(node))}
          </div>

          {/* Active selection feedback */}
          <div className="mt-4 pt-3 border-t border-white/10 bg-white/5 p-2.5 border border-white/10">
            <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">Active Target Selected</span>
            {activeTask ? (
              <div>
                <h3 className="text-xs font-bold text-white truncate">{activeTask.name}</h3>
                <p className="text-[10px] font-mono text-white/50 mt-0.5">
                  Goal: {activeTask.targetMinutes} min | Completed: {activeTask.actualMinutes} min
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-white/40 italic">Select a leaf task to engage focus orbit.</p>
            )}
          </div>
        </section>

        {/* MIDDLE COLUMN: Focus Orbit Mode (Span 4) */}
        <section id="timer-orbit" className="lg:col-span-4 border border-white/10 bg-black/40 backdrop-blur p-6 flex flex-col items-center justify-between h-[650px] relative overflow-hidden">
          
          <div className="text-center w-full">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Core Gravitational Loop</span>
            <h2 className="text-sm font-serif italic text-white/90 mt-1">Focus Orbit Timer</h2>
            
            {/* Active task in center */}
            <div className="mt-2 text-xs py-1 px-3 border border-white/5 bg-white/5 rounded-full inline-block max-w-full truncate">
              {activeTask ? `Active Task: ${activeTask.name}` : "No task engaged"}
            </div>
          </div>

          {/* Interactive Glowing Slanted 3D Orbital Ring */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            
            {/* Outer space starry context surrounding the ring */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-white rounded-full" />
              <div className="absolute bottom-12 left-16 w-1 h-1 bg-white rounded-full animate-pulse-slow" />
              <div className="absolute top-20 right-12 w-0.5 h-0.5 bg-white rounded-full" />
              <div className="absolute bottom-24 right-8 w-1 h-1 bg-white rounded-full" />
            </div>

            {/* Glowing variable stroke ellipses representing Orbit path */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Glowing Outer Neon Ring */}
              <ellipse 
                cx="150" 
                cy="150" 
                rx="120" 
                ry="42" 
                transform="rotate(-30, 150, 150)" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.08)" 
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />

              {/* Dynamic Path tracking percentage left */}
              <ellipse 
                cx="150" 
                cy="150" 
                rx="120" 
                ry="42" 
                transform="rotate(-30, 150, 150)" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="2.5"
                strokeDasharray={740} // Approx ellipse perimeter
                strokeDashoffset={740 * (1 - percentComplete)}
                filter="url(#glow)"
                className="transition-all duration-1000 ease-linear"
              />

              {/* Math calculated 3D Rotated Orbiter Dot representing time passage */}
              {timeLeft < focusDuration && (
                <circle 
                  cx={orbitalPosition.x} 
                  cy={orbitalPosition.y} 
                  r="6" 
                  fill="#ffffff" 
                  className="shadow-2xl shadow-white"
                  filter="url(#glow)"
                />
              )}
            </svg>

            {/* Central Time Typography: San Francisco Mono (Thin) */}
            <div className="z-10 text-center select-none">
              <div className="font-mono text-5xl font-extralight tracking-widest text-white">
                {formatTime(timeLeft)}
              </div>
              <span className="text-[10px] font-mono text-white/40 tracking-wider block mt-1">MONO_TIMER_DATA</span>
            </div>
          </div>

          {/* Bottom Timer Controller Bar */}
          <div className="w-full space-y-4">
            
            {/* Standard Focus Length Selection */}
            <div className="flex justify-center gap-2">
              {[15, 25, 45, 60].map(mins => (
                <button
                  key={mins}
                  disabled={timerRunning || orbitActive}
                  onClick={() => {
                    setFocusDuration(mins * 60);
                    setTimeLeft(mins * 60);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono border transition-all ${
                    focusDuration === mins * 60
                      ? 'border-white text-white bg-white/10'
                      : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {mins}M
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {activeTask ? (
                <button
                  onClick={() => {
                    setOrbitActive(true);
                    setTimerRunning(true);
                  }}
                  className="w-full bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase tracking-widest py-3 border border-white transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4.5 h-4.5" />
                  Enter Focus Orbit
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-neutral-900 text-white/30 text-xs font-mono py-3 border border-white/5 cursor-not-allowed"
                >
                  Select a Task to Enter Orbit
                </button>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Navigator Dashboard & Social Export (Span 4) */}
        <section id="navigator" className="lg:col-span-4 border border-white/10 bg-black/40 backdrop-blur p-5 flex flex-col justify-between h-[650px]">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-white/70" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-white/90">Navigator</h2>
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase">Twin Orbits</span>
            </div>

            <p className="text-[11px] text-white/50 mb-4 leading-relaxed">
              Comparison vectors: Intention Orbit vs. Reality Orbit. Perfect overlap causes alignment resonance.
            </p>

            {/* Twin Orbits Graphical Comparison Screen */}
            <div className="border border-white/10 bg-black/60 p-4 flex flex-col items-center justify-center relative my-3">
              <div className="absolute top-2 left-3 text-[8px] font-mono text-white/30">TWIN_ORBITAL_RESONANCE_RADAR</div>
              
              <svg className="w-48 h-36" viewBox="0 0 200 150">
                {/* Intention / Target Orbit Ring */}
                <ellipse 
                  cx="100" 
                  cy="75" 
                  rx="75" 
                  ry="25" 
                  transform="rotate(-15, 100, 75)" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.25)" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                
                {/* Reality / Actual Orbit Ring */}
                <ellipse 
                  cx="100" 
                  cy="75" 
                  rx={75 * (alignmentIndex / 100)} 
                  ry={25 * (alignmentIndex / 100)} 
                  transform="rotate(-15, 100, 75)" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth={alignmentIndex >= 90 ? "2.5" : "1.5"} 
                  className={alignmentIndex >= 90 ? 'animate-resonance' : ''}
                />

                {/* Overlap resonance indicator */}
                {alignmentIndex >= 95 && (
                  <circle cx="100" cy="75" r="4" fill="#ffffff" className="animate-ping" />
                )}
              </svg>

              {/* Alignment Feedback HUD */}
              <div className="text-center w-full mt-2 border-t border-white/5 pt-2">
                <div className="font-mono text-[10px] text-white/60">
                  {alignmentIndex >= 90 
                    ? "RESONANCE STATE: LOCKED" 
                    : alignmentIndex >= 50 
                    ? "RESONANCE STATE: ALIGNING" 
                    : "RESONANCE STATE: SCATTERED"}
                </div>
                <div className={`text-xs mt-1 font-serif ${alignmentIndex >= 90 ? 'text-white font-semibold' : 'text-white/60'}`}>
                  {alignmentIndex >= 90 
                    ? "Gravity vectors are in stellar alignment." 
                    : "Gentle alignment steps advised today."}
                </div>
              </div>
            </div>
          </div>

          {/* AI Navigator Reflection Link */}
          <div className="border border-white/10 p-3 bg-white/5 flex flex-col gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white">AI Co-pilot Reflect</h3>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Query the "Warm Observer" to process current focus history and retrieve encouraging insights.
            </p>
            <button
              onClick={() => triggerAiReflection()}
              className="w-full mt-1 border border-white/20 bg-white/5 hover:bg-white text-white hover:text-black transition-all text-xs font-mono uppercase py-2.5 tracking-wider flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Reflect with Navigator
            </button>
          </div>

          {/* Social Share / PNG Card Export Block */}
          <div className="border border-white/10 p-3 bg-black/60">
            <div className="flex items-center justify-between pb-1 border-b border-white/5 mb-2">
              <span className="text-[9px] font-mono text-white/40 uppercase">Card Export Hub</span>
              <span className="text-[8px] font-mono text-white/30">SWISS TYPOGRAPHY</span>
            </div>
            <p className="text-[10px] text-white/50 mb-2 leading-tight">
              Export high-res B&W stardust card showing daily alignment indexes.
            </p>

            <button
              onClick={exportSwissCard}
              className="w-full border border-white hover:bg-white text-white hover:text-black text-xs font-mono py-2 flex items-center justify-center gap-2 transition-all uppercase"
            >
              <Download className="w-3.5 h-3.5" />
              Download Swiss Card
            </button>
            {exportSuccessMessage && (
              <span className="text-[9px] font-mono text-green-400 mt-1 block text-center">
                {exportSuccessMessage}
              </span>
            )}
          </div>
        </section>
      </main>

      {/* FULLSCREEN IMMERSIVE FOCUS OVERLAY (Option B: Slide down landing) */}
      {orbitActive && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-between p-8 animate-slide-down">
          
          {/* Top telemetry lines */}
          <div className="w-full flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-mono tracking-widest uppercase">Orbit Engaged // Zero Distraction</span>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-mono text-white/40 uppercase">Active Gravitational Target</span>
              <h3 className="text-xs font-semibold text-white tracking-wider">{activeTask?.name || "System loop"}</h3>
            </div>
          </div>

          {/* Center Immersive Orbiting Ring */}
          <div className="flex flex-col items-center justify-center flex-1 my-12">
            
            {/* Huge Slanted Ring */}
            <div className="relative w-96 h-96 flex items-center justify-center">
              
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                {/* Slanted trajectory */}
                <ellipse 
                  cx="150" 
                  cy="150" 
                  rx="135" 
                  ry="48" 
                  transform="rotate(-30, 150, 150)" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.05)" 
                  strokeWidth="1.5"
                />
                
                {/* Glowing trajectory trail */}
                <ellipse 
                  cx="150" 
                  cy="150" 
                  rx="135" 
                  ry="48" 
                  transform="rotate(-30, 150, 150)" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="3" 
                  strokeDasharray={840}
                  strokeDashoffset={840 * (1 - percentComplete)}
                  filter="url(#glow)"
                  className="transition-all duration-1000 ease-linear"
                />

                {/* Math calculated 3D Rotated Orbiter Dot */}
                <circle 
                  cx={calculateOrbiterCoords(1 - percentComplete).x} 
                  cy={calculateOrbiterCoords(1 - percentComplete).y} 
                  r="7" 
                  fill="#ffffff" 
                  filter="url(#glow)"
                />
              </svg>

              {/* Giant Digital Monospace Timer */}
              <div className="text-center z-10">
                <span className="text-[10px] font-mono text-white/40 tracking-widest block uppercase mb-2">Remaining Gravity Path</span>
                <div className="font-mono text-7xl font-thin tracking-widest text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button 
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="p-3 border border-white hover:bg-white text-white hover:text-black rounded-full transition-colors"
                  >
                    {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Abort Buttons */}
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            
            {!abortConfirmation ? (
              <button
                onClick={initiateAbortOrbit}
                className="text-xs font-mono text-white/40 hover:text-white border border-white/15 hover:border-white/40 px-6 py-2.5 transition-colors uppercase tracking-widest"
              >
                Break Orbit (Abort)
              </button>
            ) : (
              <div className="border border-white/30 bg-black p-4 text-center space-y-3 w-full">
                <p className="text-[11px] font-mono text-white tracking-wider uppercase">
                  DISSOLVING ORBIT? Breaking orbit breaks focus momentum. Keep aiming for alignment.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={cancelAbortOrbit}
                    className="bg-white text-black px-4 py-2 text-xs font-mono uppercase font-bold"
                  >
                    Maintain Momentum
                  </button>
                  <button
                    onClick={confirmAbortOrbit}
                    className="border border-white/20 text-white/60 hover:text-white px-4 py-2 text-xs font-mono uppercase"
                  >
                    Dissolve Orbit
                  </button>
                </div>
              </div>
            )}

            <div className="text-[10px] font-mono text-white/30 uppercase tracking-tight">
              Orbit Navigation system locked in deep focus protocol.
            </div>
          </div>
        </div>
      )}

      {/* AI CO-PILOT CHAT SHEET PANEL */}
      {aiChatOpen && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-black border-l border-white/20 z-50 flex flex-col shadow-2xl shadow-white/10">
          
          {/* Side sheet Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neutral-950">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse-slow" />
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-white">AI Co-pilot: Warm Observer</h3>
                <span className="text-[9px] font-mono text-white/40 block">Wise • Poetic • Non-Judgmental</span>
              </div>
            </div>
            <button 
              onClick={() => setAiChatOpen(false)}
              className="p-1 text-white/60 hover:text-white border border-white/10 hover:border-white/30"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-serif text-sm leading-relaxed">
            
            {chatMessages.length === 0 && (
              <div className="text-center py-12 text-white/30 text-xs font-mono italic">
                Establish conversation with the Navigator above to receive gravity insights.
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3 border ${
                  msg.role === 'assistant' 
                    ? 'border-white/10 bg-white/5 text-white/90 font-serif' 
                    : 'border-white/20 bg-neutral-900 text-white font-mono text-xs'
                }`}
              >
                <div className="text-[9px] font-mono text-white/40 uppercase mb-1">
                  {msg.role === 'assistant' ? "Observer Reflection" : "User Reflection Input"}
                </div>
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            ))}

            {aiLoading && (
              <div className="border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-white/40 uppercase animate-pulse">Engaging gravity vectors...</span>
                <p className="text-xs font-serif text-white/50 italic">The Observer is interpreting your alignment ratios...</p>
              </div>
            )}

            {aiError && (
              <div className="border border-red-500/30 bg-red-950/20 text-red-300 p-3 flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono uppercase font-bold text-red-200">Gravity Connection Error</h4>
                  <p className="text-[11px] mt-1 font-serif">{aiError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input field */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (userInput.trim()) {
                triggerAiReflection(userInput);
              }
            }} 
            className="p-4 border-t border-white/10 bg-neutral-950 flex gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Express a feeling, query focus, or state intent..."
              className="flex-1 bg-black border border-white/20 text-xs py-2.5 px-3 focus:border-white focus:outline-none font-mono"
              disabled={aiLoading}
            />
            <button
              type="submit"
              disabled={aiLoading || !userInput.trim()}
              className="bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold px-4 py-2.5 flex items-center gap-1 border border-white"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Trial info bar */}
          {!isPro && (
            <div className="p-3 bg-white/5 border-t border-white/10 text-[9px] font-mono text-white/50 flex justify-between items-center">
              <span>REFLECTIONS ENGAGED: {trialsUsed}/5 FREE TRIALS USED</span>
              <button 
                onClick={() => setCheckoutModalOpen(true)} 
                className="text-white underline hover:text-white"
              >
                UPGRADE
              </button>
            </div>
          )}
        </div>
      )}

      {/* NODE ADDITION MODAL DIALOG */}
      {isAddingNode && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form 
            onSubmit={handleAddNodeSubmit}
            className="bg-black border border-white/20 p-5 max-w-sm w-full space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-widest">Add Orbit Node</h3>
              <button 
                type="button" 
                onClick={() => setIsAddingNode(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-white/50 uppercase block">Node Name</label>
              <input
                type="text"
                required
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="e.g. Visual styling loop"
                className="w-full bg-black border border-white/20 py-1.5 px-2.5 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-white/50 uppercase block">Node Level Type</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as 'project' | 'task')}
                  className="w-full bg-black border border-white/20 py-1.5 px-2 text-xs text-white focus:border-white focus:outline-none"
                >
                  <option value="project">Project Container</option>
                  <option value="task">Focus Task Leaf</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-white/50 uppercase block">Target Time (Minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newNodeTarget}
                  onChange={(e) => setNewNodeTarget(parseInt(e.target.value) || 45)}
                  className="w-full bg-black border border-white/20 py-1.5 px-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddingNode(false)}
                className="border border-white/10 hover:border-white/30 text-white/60 hover:text-white text-xs font-mono py-1.5 px-3 uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-white text-black hover:bg-neutral-200 text-xs font-mono py-1.5 px-3 font-bold uppercase"
              >
                Insert Node
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MONETIZATION PREMIUM BUYOUT MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-black border border-white/20 max-w-md w-full overflow-hidden">
            
            {/* Header branding */}
            <div className="p-6 bg-white/5 border-b border-white/10 text-center space-y-2">
              <div className="flex justify-center">
                <div className="relative w-12 h-12 flex items-center justify-center border border-white rounded-full">
                  <Orbit className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 border border-white/20 rounded-full scale-110 animate-pulse-slow" />
                </div>
              </div>
              <h3 className="font-serif italic text-2xl font-bold tracking-wider text-white">Orbit Pro</h3>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                Lifetime Access Upgrade • One-time Buyout $4.99
              </p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-white/70 leading-relaxed font-serif text-center">
                Release your focus limitations. Reclaim the gravity of your personal universe with lifetime unlimited features.
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono uppercase text-white/80">
                <div className="p-2 border border-white/10 bg-white/5 rounded">
                  ✓ Unlimited AI Reflections
                </div>
                <div className="p-2 border border-white/10 bg-white/5 rounded">
                  ✓ Swiss-style Clean Exports
                </div>
                <div className="p-2 border border-white/10 bg-white/5 rounded">
                  ✓ Pro Resonance Graphics
                </div>
                <div className="p-2 border border-white/10 bg-white/5 rounded">
                  ✓ Zero Ad-noise Watermarks
                </div>
              </div>

              {/* Purchase form */}
              {!purchaseSuccess ? (
                <form onSubmit={handlePurchaseSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-white/50 uppercase block">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-black border border-white/20 py-1.5 px-2.5 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-white/50 uppercase block">Credit Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-2.5 top-2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={checkoutCard}
                        onChange={(e) => setCheckoutCard(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-black border border-white/20 py-1.5 pl-9 pr-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-white/50 uppercase block">Expiration Date</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={checkoutExpiry}
                        onChange={(e) => setCheckoutExpiry(e.target.value)}
                        className="w-full bg-black border border-white/20 py-1.5 px-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-white/50 uppercase block">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={checkoutCvv}
                        onChange={(e) => setCheckoutCvv(e.target.value)}
                        className="w-full bg-black border border-white/20 py-1.5 px-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <button
                      type="button"
                      disabled={purchaseLoading}
                      onClick={() => setCheckoutModalOpen(false)}
                      className="text-white/60 hover:text-white text-xs font-mono uppercase"
                    >
                      Dismiss
                    </button>
                    <button
                      type="submit"
                      disabled={purchaseLoading}
                      className="bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase py-2 px-6 border border-white tracking-widest flex items-center gap-1.5"
                    >
                      {purchaseLoading ? "Calibrating..." : "Unlock Pro Now"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-xs font-mono uppercase tracking-widest font-bold">Transaction Confirmed</h4>
                  <p className="text-[11px] font-serif text-white/60">
                    Sealing digital telemetry. Your lifetime license keys are being injected into orbit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minimal Outer Footer Margin */}
      <footer className="border-t border-white/10 py-4 text-center text-[9px] font-mono text-white/30 uppercase tracking-widest z-10 bg-black/80 backdrop-blur-sm mt-auto">
        Orbit Applet • Swiss-style NASA Minimalism Choice A • Build Alpha Version v3.1.25 • 2026 Space Dynamics
      </footer>
    </div>
  );
}
