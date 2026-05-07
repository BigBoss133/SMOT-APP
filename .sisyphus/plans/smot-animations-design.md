# Animazioni & Design — SMOT Desktop

> Catalogo di animazioni CSS/React per l'app SMOT, dal caricamento file alla chat testuale.
> Palette: Navy `#0a1a3b` · Indaco `#4338f5` · Viola `#894df8` · Oliva `#bcc41c`

---

## 📐 Principi di Design

| Principio | Regola |
|-----------|--------|
| **Durata** | 200-400ms per micro-interazioni, 500-800ms per transizioni pagina |
| **Easing** | `cubic-bezier(0.4, 0, 0.2, 1)` per naturalezza |
| **Performance** | Solo `transform` + `opacity` (GPU-accelerated, no layout thrashing) |
| **Accessibilità** | Rispettare `prefers-reduced-motion` |
| **Coerenza** | Stessa animazione = stesso significato in tutta l'app |

```css
/* Utility globale */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 1. Caricamento App / Splash Screen

### 1a. Logo Pulse (all'avvio)

```css
@keyframes logo-pulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50%      { transform: scale(1.05); opacity: 1; }
}

.smot-logo {
  animation: logo-pulse 2s ease-in-out infinite;
}
```

### 1b. Fade In Progressivo

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.splash-title  { animation: fade-in-up 0.6s 0.2s both; }
.splash-sub    { animation: fade-in-up 0.6s 0.5s both; }
.splash-loader { animation: fade-in-up 0.6s 0.8s both; }
```

---

## 2. Dashboard

### 2a. Stat Cards — Count Up

```css
@keyframes count-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-card {
  animation: count-up 0.4s ease-out both;
}
.stat-card:nth-child(1) { animation-delay: 0.0s; }
.stat-card:nth-child(2) { animation-delay: 0.1s; }
.stat-card:nth-child(3) { animation-delay: 0.2s; }
.stat-card:nth-child(4) { animation-delay: 0.3s; }
```

### 2b. Quick Actions — Hover Glow

```css
.quick-action {
  transition: transform 0.2s, box-shadow 0.3s;
}
.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(67, 56, 245, 0.3);
}
```

---

## 3. Upload / Caricamento File

### 3a. Dropzone — Bordo Pulsante

```css
@keyframes border-dance {
  0%, 100% { border-color: #4338f5; }
  50%      { border-color: #894df8; }
}

.dropzone-active {
  animation: border-dance 1.5s ease-in-out infinite;
  border-width: 2px;
  border-style: dashed;
}
```

### 3b. File Appear — Slide In

```css
@keyframes file-slide-in {
  from { opacity: 0; transform: translateX(-20px); max-height: 0; }
  to   { opacity: 1; transform: translateX(0); max-height: 60px; }
}

.file-item {
  animation: file-slide-in 0.35s ease-out both;
  overflow: hidden;
}
```

### 3c. Progress Bar — Shimmer

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.upload-progress-bar {
  background: linear-gradient(
    90deg,
    #4338f5 0%,
    #894df8 30%,
    #4338f5 60%,
    #894df8 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
```

### 3d. Upload Complete — Checkmark

```css
@keyframes check-draw {
  to { stroke-dashoffset: 0; }
}

.upload-check {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: check-draw 0.4s ease-out 0.2s forwards;
}
```

---

## 4. Indicizzazione Documenti

### 4a. Chunk Particles

```css
@keyframes chunk-fly {
  0%   { opacity: 0; transform: translateY(10px) scale(0.8); }
  50%  { opacity: 1; }
  100% { opacity: 0.6; transform: translateY(-5px) scale(1); }
}

.chunk-particle {
  width: 6px; height: 6px;
  background: #bcc41c;
  border-radius: 50%;
  animation: chunk-fly 1s ease-out infinite;
}
.chunk-particle:nth-child(2n) { animation-delay: 0.3s; }
.chunk-particle:nth-child(3n) { animation-delay: 0.6s; }
```

### 4b. Progress Ring

```css
@keyframes ring-fill {
  to { stroke-dashoffset: 0; }
}

.progress-ring-circle {
  stroke: url(#gradient-primary);
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  transition: stroke-dashoffset 0.5s ease;
}
```

---

## 5. Chat Testuale

### 5a. Messaggio Entrante (AI) — Typewriter

```css
@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

.ai-typing::after {
  content: "▊";
  color: #bcc41c;
  animation: blink-cursor 0.8s infinite;
}
```

### 5b. Messaggio Utente — Slide Right

```css
@keyframes msg-slide-right {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.user-message {
  animation: msg-slide-right 0.3s ease-out;
}
```

### 5c. Messaggio AI — Slide Left

```css
@keyframes msg-slide-left {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}

.ai-message {
  animation: msg-slide-left 0.35s ease-out;
}
```

### 5d. Thinking Dots

```css
@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-6px); }
}

.thinking-dot {
  width: 6px; height: 6px;
  background: #8a9bb5;
  border-radius: 50%;
  display: inline-block;
  animation: dot-bounce 1.2s ease-in-out infinite;
}
.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }
```

### 5e. Sources Panel — Expand

```css
.sources-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, opacity 0.3s;
  opacity: 0;
}
.sources-panel.open {
  max-height: 300px;
  opacity: 1;
}
```

### 5f. Source Citation — Highlight Pulse

```css
@keyframes source-highlight {
  0%   { box-shadow: 0 0 0 0 rgba(188, 196, 28, 0.4); }
  70%  { box-shadow: 0 0 0 8px rgba(188, 196, 28, 0); }
  100% { box-shadow: 0 0 0 0 rgba(188, 196, 28, 0); }
}

.source-citation:hover {
  animation: source-highlight 0.6s ease-out;
}
```

---

## 6. Viewer Documenti

### 6a. Pagina — Slide

```css
.viewer-page-enter {
  animation: fade-in-up 0.3s ease-out;
}
.viewer-page-exit {
  animation: fade-in-up 0.3s ease-out reverse;
}
```

### 6b. Highlight — Glow Reveal

```css
@keyframes highlight-reveal {
  from { background-color: rgba(188, 196, 28, 0); }
  to   { background-color: rgba(188, 196, 28, 0.25); }
}

.keyword-highlight {
  animation: highlight-reveal 0.5s ease-out 0.1s both;
  border-radius: 2px;
}
```

---

## 7. Navigazione / Sidebar

### 7a. Active Tab Indicator

```css
.nav-item::after {
  content: "";
  position: absolute;
  left: 0; bottom: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, #4338f5, #894df8);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}
.nav-item.active::after {
  transform: scaleX(1);
}
```

### 7b. Hover Ripple

```css
@keyframes nav-ripple {
  to { transform: scale(4); opacity: 0; }
}

.nav-item {
  position: relative;
  overflow: hidden;
}
.nav-item .ripple {
  position: absolute;
  width: 10px; height: 10px;
  background: rgba(67, 56, 245, 0.3);
  border-radius: 50%;
  transform: scale(0);
  animation: nav-ripple 0.6s ease-out;
}
```

---

## 8. Settings / Interazioni UI

### 8a. Toggle Switch

```css
.toggle-track {
  transition: background 0.3s ease;
}
.toggle-thumb {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toggle-on .toggle-thumb {
  transform: translateX(20px);
}
.toggle-on .toggle-track {
  background: linear-gradient(135deg, #4338f5, #894df8);
}
```

### 8b. Select Dropdown

```css
.select-option {
  transition: background 0.2s, color 0.2s;
}
.select-option:hover {
  background: rgba(67, 56, 245, 0.15);
}
.select-option.selected {
  background: rgba(67, 56, 245, 0.25);
  color: #ffffff;
}
```

### 8c. Save Button — Success Pulse

```css
@keyframes save-success {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); background: #bcc41c; }
  100% { transform: scale(1); background: #4338f5; }
}

.btn-saved {
  animation: save-success 0.6s ease;
}
```

---

## 9. Notifiche / Toast

### 9a. Slide In from Top-Right

```css
@keyframes toast-in {
  from { opacity: 0; transform: translateX(100%) translateY(-10px); }
  to   { opacity: 1; transform: translateX(0) translateY(0); }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(100%); }
}

.toast {
  animation: toast-in 0.4s ease-out;
}
.toast.hiding {
  animation: toast-out 0.3s ease-in forwards;
}
```

### 9b. Error Shake

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-4px); }
  40%      { transform: translateX(4px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(2px); }
}

.error-shake {
  animation: shake 0.4s ease-out;
}
```

---

## 10. Empty State / Loading

### 10a. Skeleton Loader

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(138, 155, 181, 0.15) 0%,
    rgba(138, 155, 181, 0.3) 50%,
    rgba(138, 155, 181, 0.15) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

### 10b. Empty State Illustration

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

.empty-state-icon {
  animation: float 3s ease-in-out infinite;
  opacity: 0.5;
}
```

---

## 11. Status Bar Inferiore

### 11a. Status Indicator

```css
@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.status-dot.active   { background: #bcc41c; }
.status-dot.indexing { background: #bcc41c; animation: status-blink 1.5s infinite; }
.status-dot.idle     { background: #8a9bb5; }
.status-dot.error    { background: #ff6b6b; }
```

### 11b. Mode Badge

```css
.mode-badge {
  transition: background 0.3s, color 0.3s;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}
.mode-performance { background: rgba(67, 56, 245, 0.2); color: #894df8; }
.mode-balanced    { background: rgba(137, 77, 248, 0.15); color: #c084fc; }
.mode-lite        { background: rgba(138, 155, 181, 0.15); color: #8a9bb5; }
```

---

## 12. AI Status / Ollama Detection

### 12a. AI Badge — Glow

```css
@keyframes ai-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(188, 196, 28, 0.3); }
  50%      { box-shadow: 0 0 12px rgba(188, 196, 28, 0.6); }
}

.ai-badge.ready {
  background: rgba(188, 196, 28, 0.1);
  border: 1px solid rgba(188, 196, 28, 0.3);
  color: #bcc41c;
  animation: ai-glow 2s ease-in-out infinite;
}
.ai-badge.offline {
  background: rgba(138, 155, 181, 0.1);
  border: 1px solid rgba(138, 155, 181, 0.2);
  color: #8a9bb5;
}
```

---

## 🎯 Priorità Implementazione

| Priorità | Animazione | Impatto UX |
|----------|-----------|------------|
| 🔴 P0 | Chat: slide messaggi + thinking dots | Core experience |
| 🔴 P0 | Upload: dropzone pulse + progress bar | Feedback immediato |
| 🟡 P1 | Dashboard: stat cards stagger | First impression |
| 🟡 P1 | Indicizzazione: progress ring + chunk particles | Feedback processo |
| 🟢 P2 | Viewer: page transitions + highlight reveal | Polish |
| 🟢 P2 | Navigazione: active tab + ripple | Micro-interactions |
| ⚪ P3 | Notifiche: toast slide + error shake | Edge cases |
| ⚪ P3 | Skeleton loaders + empty states | Perceived performance |

---

## 🛠️ Implementazione React (Quick Start)

```tsx
// src/hooks/useAnimation.ts
import { useEffect, useState } from 'react';

export function useStaggerAnimation(count: number, delay: number = 80) {
  const [visible, setVisible] = useState<boolean[]>(
    Array(count).fill(false)
  );
  
  useEffect(() => {
    const timers = visible.map((_, i) =>
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [count]);
  
  return visible;
}

// Esempio: Dashboard stat cards
function DashboardStats({ stats }: Props) {
  const visible = useStaggerAnimation(stats.length, 100);
  
  return (
    <div className="stat-grid">
      {stats.map((stat, i) => (
        <div
          key={stat.id}
          className={`stat-card ${visible[i] ? 'visible' : ''}`}
        >
          {stat.label}
        </div>
      ))}
    </div>
  );
}
```

```tsx
// src/components/ChatMessage.tsx
function ChatMessage({ message }: Props) {
  const isAI = message.role === 'ai';
  
  return (
    <div
      className={`message ${isAI ? 'ai-message' : 'user-message'}`}
      style={{
        background: isAI ? 'rgba(67, 56, 245, 0.08)' : 'rgba(137, 77, 248, 0.12)',
        animationDelay: '0s',
      }}
    >
      {message.content}
      {message.streaming && (
        <span className="ai-typing" />
      )}
    </div>
  );
}
```

---

## 13. 🕸️ Graph View — Visualizzazione a Grafo (Tipo Obsidian)

> Mappa interattiva delle relazioni tra documenti. Ogni nodo è un documento,
> ogni arco una connessione (similarità, tag, citazioni, categoria).

### 13a. Concept Visivo

```
┌──────────────────────────────────────────────────┐
│  [🔍 Cerca]  [🎯 Filtra]  [📐 Reset]    [⚙️]   │
├──────────────────────────────────────────────────┤
│                                                  │
│         ●───────●                                │
│        /          \        LEGENDA              │
│       ●            ●      🟣 Lavoro            │
│       │     ●      │      🟢 Studio            │
│       ●────●───────●      🟡 Personale         │
│        \          /       🔵 Indexed           │
│         ●────────●        ⚪ Non indexed        │
│                                                  │
├──────────────────────────────────────────────────┤
│  🟣 Contratto_2024.pdf  │  Connessioni: 4      │
└──────────────────────────────────────────────────┘
```

### 13b. Architettura Tecnica

**Scelta libreria:** `d3-force` (leggero, ~15KB gzipped, senza dipendenze)

```bash
npm install d3-force d3-selection d3-zoom
# Totale: ~25KB gzipped — molto più leggero di Cytoscape (80KB) o vis.js (200KB)
```

**Struttura componenti:**

```
src/
├── components/
│   └── GraphView/
│       ├── GraphView.tsx          # Container principale
│       ├── GraphCanvas.tsx        # SVG/Canvas renderer
│       ├── GraphNode.tsx          # Singolo nodo documento
│       ├── GraphEdge.tsx          # Arco tra nodi
│       ├── GraphControls.tsx      # Zoom, pan, fit, reset
│       ├── GraphLegend.tsx        # Legenda colori
│       ├── GraphTooltip.tsx       # Tooltip al hover
│       └── GraphSidebar.tsx       # Pannello dettaglio nodo selezionato
├── hooks/
│   ├── useGraphData.ts           # Hook per dati + relazioni
│   ├── useForceGraph.ts          # Hook per simulazione d3-force
│   └── useGraphLayout.ts         # Hook per layout calcoli
└── services/
    └── graphRelations.ts         # Calcolo similarità/relazioni
```

### 13c. Algoritmo Relazioni

```typescript
// src/services/graphRelations.ts

interface GraphRelation {
  source: string;      // document ID
  target: string;      // document ID
  strength: number;    // 0-1, forza della relazione
  type: 'category' | 'tag' | 'content' | 'citation';
}

function computeRelations(documents: Document[]): GraphRelation[] {
  const relations: GraphRelation[] = [];
  
  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const a = documents[i];
      const b = documents[j];
      
      // 1. Stessa categoria → forza 0.6
      if (a.category === b.category) {
        relations.push({
          source: a.id, target: b.id,
          strength: 0.6, type: 'category'
        });
      }
      
      // 2. Parole chiave in comune → forza 0.4
      const commonKeywords = intersect(a.keywords, b.keywords);
      if (commonKeywords.length > 0) {
        relations.push({
          source: a.id, target: b.id,
          strength: Math.min(0.4 * commonKeywords.length, 1),
          type: 'tag'
        });
      }
      
      // 3. Similarità contenuto (cosine su embedding) → forza 0.8
      if (a.embedding && b.embedding) {
        const similarity = cosineSimilarity(a.embedding, b.embedding);
        if (similarity > 0.3) {
          relations.push({
            source: a.id, target: b.id,
            strength: similarity * 0.8,
            type: 'content'
          });
        }
      }
    }
  }
  
  // Mantieni solo top N relazioni per nodo (evita grafo troppo denso)
  return keepTopPerNode(relations, 5);
}
```

### 13d. Simulazione Force-Directed (d3-force)

```typescript
// src/hooks/useForceGraph.ts
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: string;
  indexed: boolean;
  size: number;       // dimensione documento
  connections: number; // grado del nodo
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  strength: number;
  type: string;
}

function createSimulation(nodes: GraphNode[], links: GraphLink[]) {
  return forceSimulation<GraphNode>(nodes)
    .force('link', forceLink<GraphNode, GraphLink>(links)
      .id(d => d.id)
      .distance(link => 150 - link.strength * 100) // Relazioni forti = più vicine
      .strength(link => link.strength)
    )
    .force('charge', forceManyBody()
      .strength(node => -200 - node.connections * 30) // Repulsione proporzionale
    )
    .force('center', forceCenter(width / 2, height / 2))
    .force('collision', forceCollide()
      .radius(node => 20 + node.size * 5) // Evita overlap
    )
    .alphaDecay(0.02)               // Decadimento lento per animazione fluida
    .velocityDecay(0.3)             // Attrito
    .on('tick', () => {
      // Aggiorna posizioni SVG/CSS
      updateNodePositions(nodes);
      updateEdgePositions(links);
    });
}
```

### 13e. Rendering SVG

```tsx
// src/components/GraphView/GraphCanvas.tsx
function GraphCanvas({ nodes, links, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{
        background: 'radial-gradient(ellipse at center, #132444 0%, #0a1a3b 100%)',
      }}
    >
      <defs>
        {/* Gradiente per archi */}
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4338f5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#894df8" stopOpacity="0.4" />
        </linearGradient>
        
        {/* Glow filter per nodi */}
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Archi */}
      <g className="edges">
        {links.map(link => (
          <line
            key={`${link.source.id}-${link.target.id}`}
            x1={link.source.x} y1={link.source.y}
            x2={link.target.x} y2={link.target.y}
            stroke="url(#edge-gradient)"
            strokeWidth={link.strength * 3}
            strokeOpacity={0.5}
          />
        ))}
      </g>
      
      {/* Nodi */}
      <g className="nodes">
        {nodes.map(node => (
          <GraphNode
            key={node.id}
            node={node}
            onClick={() => onNodeClick(node)}
          />
        ))}
      </g>
    </svg>
  );
}
```

### 13f. Nodo Animato

```tsx
function GraphNode({ node, onClick }: Props) {
  const color = getCategoryColor(node.category);
  const radius = 8 + node.size * 3; // 8-20px
  
  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Halo glow */}
      <circle
        r={radius + 4}
        fill={color}
        opacity={0.15}
        filter="url(#node-glow)"
      />
      
      {/* Nodo principale */}
      <circle
        r={radius}
        fill={node.indexed ? color : '#8a9bb5'}
        stroke={color}
        strokeWidth={2}
        style={{
          transition: 'r 0.3s ease, fill 0.3s ease',
        }}
        // Animazione hover
        onMouseEnter={e => {
          e.currentTarget.setAttribute('r', String(radius + 4));
        }}
        onMouseLeave={e => {
          e.currentTarget.setAttribute('r', String(radius));
        }}
      />
      
      {/* Label */}
      <text
        dy={radius + 14}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="11"
        fontFamily="-apple-system, sans-serif"
        opacity={0.8}
        style={{
          transition: 'opacity 0.2s',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {node.name.length > 20 
          ? node.name.slice(0, 18) + '…'
          : node.name}
      </text>
    </g>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Lavoro':    '#4338f5',
    'Studio':    '#894df8',
    'Personale': '#bcc41c',
    'Progetti':  '#c084fc',
    'default':   '#8a9bb5',
  };
  return colors[category] || colors.default;
}
```

### 13g. Animazioni Graph View

**Nodo Appear (quando il grafo si carica):**

```css
@keyframes node-appear {
  from { opacity: 0; transform: scale(0); }
  to   { opacity: 1; transform: scale(1); }
}

.graph-node {
  animation: node-appear 0.5s ease-out both;
}
.graph-node:nth-child(1n)  { animation-delay: 0.05s; }
.graph-node:nth-child(2n)  { animation-delay: 0.1s; }
/* stagger in base all'indice */
```

**Arco Fade In:**

```css
@keyframes edge-draw {
  from { stroke-dashoffset: 100%; opacity: 0; }
  to   { stroke-dashoffset: 0; opacity: 0.6; }
}

.graph-edge {
  stroke-dasharray: 100%;
  animation: edge-draw 1.5s ease-out both;
}
```

**Nodo Hover — Glow Pulse:**

```css
@keyframes node-hover-glow {
  0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
  50%      { filter: drop-shadow(0 0 12px currentColor); }
}

.graph-node:hover circle:first-of-type {
  animation: node-hover-glow 1s ease-in-out infinite;
}
```

**Connessioni Highlight (hover su nodo):**

```typescript
// Evidenzia solo le connessioni del nodo in hover
function highlightConnections(activeNode: string, nodes: GraphNode[], links: GraphLink[]) {
  const connectedIds = new Set<string>();
  connectedIds.add(activeNode);
  
  links.forEach(link => {
    if (link.source.id === activeNode || link.target.id === activeNode) {
      connectedIds.add(link.source.id);
      connectedIds.add(link.target.id);
    }
  });
  
  // Nodi non connessi → opacità ridotta
  nodes.forEach(node => {
    node.opacity = connectedIds.has(node.id) ? 1 : 0.2;
  });
  
  // Archi non connessi → opacità zero
  links.forEach(link => {
    link.opacity = (link.source.id === activeNode || link.target.id === activeNode) ? 1 : 0;
  });
}
```

### 13h. Zoom & Pan

```typescript
// src/hooks/useGraphZoom.ts
import { zoom, ZoomBehavior } from 'd3-zoom';

function useGraphZoom(svgRef: RefObject<SVGSVGElement>) {
  useEffect(() => {
    const svg = d3.select(svgRef.current!);
    const g = svg.select('g');
    
    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      })
      // Zoom con rotella smooth
      .filter((event) => {
        if (event.type === 'wheel') {
          event.preventDefault();
          return true;
        }
        return !event.ctrlKey && !event.button;
      });
    
    svg.call(zoomBehavior);
    
    // Animazione zoom iniziale
    svg.transition()
      .duration(800)
      .call(zoomBehavior.transform as any, d3.zoomIdentity.translate(0, 0).scale(1));
    
  }, [svgRef]);
}
```

### 13i. Controlli

```tsx
function GraphControls({ onZoomIn, onZoomOut, onFit, onReset }: Props) {
  return (
    <div className="graph-controls" style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <button onClick={onZoomIn}  title="Zoom In">＋</button>
      <button onClick={onZoomOut} title="Zoom Out">－</button>
      <button onClick={onFit}     title="Fit to Screen">⊡</button>
      <button onClick={onReset}   title="Reset View">↺</button>
    </div>
  );
}

// CSS
.graph-controls button {
  width: 32px; height: 32px;
  background: rgba(10, 26, 59, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}
.graph-controls button:hover {
  background: rgba(67, 56, 245, 0.3);
  border-color: rgba(67, 56, 245, 0.5);
}
```

### 13j. Sidebar Dettaglio Nodo

```tsx
function GraphSidebar({ node, onClose }: Props) {
  if (!node) return null;
  
  return (
    <div className="graph-sidebar" style={{
      position: 'absolute',
      top: 0, right: 0,
      width: 280,
      height: '100%',
      background: 'rgba(10, 26, 59, 0.95)',
      backdropFilter: 'blur(10px)',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      padding: 20,
      transform: 'translateX(0)',
      transition: 'transform 0.3s ease',
      overflow: 'hidden',
    }}>
      <h3 style={{ color: getCategoryColor(node.category) }}>
        {node.name}
      </h3>
      
      <div className="node-meta">
        <span>Categoria: {node.category}</span>
        <span>Dimensione: {formatBytes(node.size)}</span>
        <span>Connessioni: {node.connections}</span>
        <span>Indicizzato: {node.indexed ? '✅' : '⚪'}</span>
      </div>
      
      <div className="related-docs">
        <h4>Documenti Correlati</h4>
        {node.relatedDocs?.map(doc => (
          <div key={doc.id} className="related-item">
            {doc.name} <span style={{color: '#8a9bb5'}}>{doc.strength}%</span>
          </div>
        ))}
      </div>
      
      <button onClick={onClose}>Chiudi</button>
    </div>
  );
}
```

### 13k. Performance — Dati Reali

| Scenario | Nodi | Implementazione | FPS Target |
|----------|------|-----------------|------------|
| Pochi doc | <50 | SVG diretto | 60fps ✅ |
| Medi doc | 50-200 | SVG + virtualizzazione | 60fps ✅ |
| Molti doc | 200-500 | Canvas rendering | 30-60fps ✅ |
| Tantissimi doc | 500+ | WebGL (PixiJS) | 20-30fps ⚠️ |

**Ottimizzazioni per SMOT (200-500 documenti):**

```typescript
// 1. Clustering automatico oltre 100 nodi
if (nodes.length > 100) {
  nodes = clusterNodes(nodes, 30); // Riduci a 30 cluster
}

// 2. LOD (Level of Detail) — zoom out → meno dettagli
const detailLevel = zoomScale < 0.5 ? 'low' : zoomScale < 1.5 ? 'medium' : 'high';
if (detailLevel === 'low') {
  // Mostra solo cluster, nascondi label
}

// 3. Throttle rendering
const throttledRender = throttle(() => updateGraph(), 16); // 60fps max

// 4. Web Worker per calcolo relazioni
const worker = new Worker('/workers/graphRelations.worker.js');
```

### 13l. Piano di Implementazione

| Task | Priorità | Stima | Dipende da |
|------|----------|-------|------------|
| **G3-T1:** Install d3-force + setup GraphView container | 🔴 P0 | 2h | Gate G2 (DB) |
| **G3-T2:** Algoritmo relazioni (categoria + keywords) | 🔴 P0 | 3h | G2-T1 (SQLite) |
| **G3-T3:** Force simulation + rendering nodi base | 🔴 P0 | 4h | G3-T1 |
| **G3-T4:** Animazioni nodi (appear, hover, highlight) | 🟡 P1 | 3h | G3-T3 |
| **G3-T5:** Zoom/Pan controls + fit-to-screen | 🟡 P1 | 2h | G3-T3 |
| **G3-T6:** Sidebar dettaglio nodo selezionato | 🟡 P1 | 2h | G3-T3 |
| **G3-T7:** Highlight connessioni all'hover | 🟡 P1 | 1.5h | G3-T3 |
| **G3-T8:** Legenda colori + filtri categoria | 🟢 P2 | 1.5h | G3-T3 |
| **G3-T9:** Clustering automatico + LOD | 🟢 P2 | 3h | G3-T3 |
| **G3-T10:** Animazione archi (fade-in, pulsazione) | 🟢 P2 | 1.5h | G3-T3 |
| **G3-T11:** Integrazione sidebar navigazione | 🟢 P2 | 1h | G3-T1 |
| **G3-T12:** Test performance con 200+ documenti | 🟢 P2 | 2h | G3-T9 |

**Totale stimato Gate G3 (Graph View):** ~25.5 ore

### 13m. Integrazione Router

```typescript
// Aggiungi route in App.tsx
<Route path="/graph" element={<GraphView />} />

// Aggiungi voce in SidebarNav.tsx
<NavItem to="/graph" icon={Network} label="Graph View" />
```

### 13n. API Backend (Rust)

```rust
// Nuovo comando Tauri per dati grafo
#[tauri::command]
fn get_graph_data(state: State<AppState>) -> Result<GraphData, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    // Query documenti
    let mut stmt = conn.prepare("
        SELECT id, name, category, file_type, size_bytes, indexed 
        FROM documents
    ").map_err(|e| e.to_string())?;
    
    let nodes: Vec<GraphNode> = stmt.query_map([], |row| {
        Ok(GraphNode {
            id: row.get(0)?,
            name: row.get(1)?,
            category: row.get(2)?,
            file_type: row.get(3)?,
            size_bytes: row.get(4)?,
            indexed: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?
      .filter_map(|r| r.ok())
      .collect();
    
    // Calcola relazioni
    let relations = compute_graph_relations(&nodes);
    
    Ok(GraphData { nodes, relations })
}
```

---

## 📚 Riferimenti

- **CSS Easing Cheatsheet:** https://easings.net
- **React Transition Group:** https://reactcommunity.org/react-transition-group/
- **Framer Motion:** https://www.framer.com/motion/ (opzionale, per animazioni complesse)
- **WCAG Reduced Motion:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
