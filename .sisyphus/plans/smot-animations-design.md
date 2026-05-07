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

## 📚 Riferimenti

- **CSS Easing Cheatsheet:** https://easings.net
- **React Transition Group:** https://reactcommunity.org/react-transition-group/
- **Framer Motion:** https://www.framer.com/motion/ (opzionale, per animazioni complesse)
- **WCAG Reduced Motion:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
