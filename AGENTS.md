# AGENTS.md — Artesano Games Website Guidelines

> **Status:** Active &nbsp;|&nbsp; **Scope:** OS Desktop-Style Game Studio Website &nbsp;|&nbsp; **Last Updated:** May 2026

Welcome to the core guidelines for building the Artesano Games website — an **OS desktop-style experience** where pages are "applications" running inside a simulated desktop environment. This document establishes operational parameters, project structure, code architecture, performance standards, and security protocols.

---

## Table of Contents

1. [Project Structure & Organization](#1-project-structure--organization)
2. [JavaScript Architecture & Performance](#2-javascript-architecture--performance)
3. [Mandatory Code Formatting: Bracket Placement](#3-mandatory-code-formatting-bracket-placement)
4. [Cybersecurity & Vulnerability Prevention](#4-cybersecurity--vulnerability-prevention)
5. [Serverless Email Messaging Systems](#5-serverless-email-messaging-systems)
6. [Responsive Design & Adaptation](#6-responsive-design--adaptation)
7. [Accessibility (a11y)](#7-accessibility-a11y)
8. [SEO & Discoverability](#8-seo--discoverability)
9. [Image Performance & Optimization](#9-image-performance--optimization)
10. [Animation & Interaction Standards](#10-animation--interaction-standards)
11. [Deployment & Hosting](#11-deployment--hosting)

---

## 1. Project Structure & Organization

> A clean architecture is the foundation of any maintainable project. The OS desktop metaphor requires careful separation of core systems, individual "apps," and UI components.

### Rules

> **Rule 1:** You must generate and strictly adhere to the following directory structure.
>
> **Rule 2:** All files must be stored exactly within their respective directories. Do not place rogue files in the root directory unless explicitly required by build tools (e.g., `index.html`, `package.json`).

### Directory Structure

```
/project-root
│
├── /.opencode       # Internal project configuration and agent state files
├── /fonts           # Local font files (.woff, .woff2, .ttf) for optimized loading
├── /images          # Compressed graphic assets (.webp, .svg, .png, .jpg)
├── /assets          # SVG icons, sprite sheets, UI elements
├── /css             # Stylesheets (modular, organized by components or logic)
│   ├── core/        # Base styles, variables, resets
│   ├── desktop/     # OS desktop, taskbar, window chrome
│   └── apps/        # Individual app-specific styles
├── /js              # JavaScript files (Vanilla JS + GSAP)
│   ├── core/        # WindowManager, EventBus, StateStore, Router
│   ├── apps/        # Individual "app" modules (Games, About, Contact, etc.)
│   ├── ui/          # Taskbar, StartMenu, Desktop icons
│   └── utils/       # Helpers, DOM utilities
├── /node_modules    # (Only if package management is explicitly needed)
└── index.html       # The main entry point
```

### Why This Matters

Separation of concerns is a fundamental programming principle. The OS desktop metaphor introduces complexity: window management, drag/resize, state persistence, and multiple "apps" running concurrently. Isolating core systems from individual apps ensures the codebase remains **navigable**, **debuggable**, and **scalable**.

**Exception:** Prototypes can be held in a single file for optimization and quick iteration.

---

## 2. JavaScript Architecture & Performance

> This is a **heavy JavaScript application** that simulates an operating system. Performance, clean architecture, and maintainability are non-negotiable.

### Core Philosophy

> **Rule 1:** Use **Vanilla JavaScript** for all core systems. No frameworks (React, Vue, etc.) — this is a custom, performance-critical UI.
>
> **Rule 2:** Use **GSAP** (GreenSock Animation Platform) for all complex animations. It is the industry standard for performant, timeline-based animations (~23KB gzipped).
>
> **Rule 3:** Follow the **DRY principle** (*Don't Repeat Yourself*). Code must be modular, reusable, and well-documented.
>
> **Rule 4:** Maintain **60fps** at all times. Avoid layout thrashing, use `transform` and `opacity` for animations, and leverage `requestAnimationFrame` for custom frame-by-frame logic.

### Architecture Pattern: Module-Based with Event Bus

The desktop OS is built on a modular architecture with a centralized event system:

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                         │
│                    (Desktop Shell)                      │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ WindowManager│   │  StateStore  │   │    Router    │
│  (Lifecycle) │   │  (Central)   │   │  (Navigation)│
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼───────┐
                    │   EventBus    │
                    │  (Messaging)  │
                    └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  App: Games  │   │ App: About   │   │App: Contact  │
│   (Module)   │   │   (Module)   │   │   (Module)   │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Core Module: EventBus

The EventBus is a centralized messaging system for inter-component communication.

```javascript
class EventBus
{
    constructor()
    {
        this.listeners = new Map();
    }

    on(event, callback)
    {
        if (!this.listeners.has(event))
        {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback)
    {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
        this.listeners.set(event, callbacks);
    }

    emit(event, data)
    {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).forEach(callback => callback(data));
    }
}

export const eventBus = new EventBus();
```

### Core Module: StateStore

The StateStore is a centralized state container with reactive updates.

```javascript
class StateStore
{
    constructor(initialState)
    {
        this.state = initialState;
        this.subscribers = new Map();
    }

    getState()
    {
        return { ...this.state };
    }

    setState(newState)
    {
        const prevState = this.state;
        this.state = { ...this.state, ...newState };
        this.notifySubscribers(prevState, this.state);
    }

    subscribe(key, callback)
    {
        if (!this.subscribers.has(key))
        {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
        return () => this.unsubscribe(key, callback);
    }

    unsubscribe(key, callback)
    {
        if (!this.subscribers.has(key)) return;
        const callbacks = this.subscribers.get(key).filter(cb => cb !== callback);
        this.subscribers.set(key, callbacks);
    }

    notifySubscribers(prevState, currentState)
    {
        Object.keys(currentState).forEach(key =>
        {
            if (prevState[key] !== currentState[key] && this.subscribers.has(key))
            {
                this.subscribers.get(key).forEach(callback =>
                {
                    callback(currentState[key], prevState[key]);
                });
            }
        });
    }
}

export const store = new StateStore({
    windows: [],
    activeWindowId: null,
    zIndex: 100,
    desktopIcons: []
});
```

### Core Module: WindowManager

The WindowManager handles window lifecycle, stacking, and positioning.

```javascript
import { eventBus } from './EventBus.js';
import { store } from './StateStore.js';

class WindowManager
{
    constructor()
    {
        this.windows = new Map();
    }

    create(config)
    {
        const id = `window-${Date.now()}`;
        const windowEl = this.buildWindowElement(id, config);
        document.body.appendChild(windowEl);

        this.windows.set(id, { element: windowEl, config });
        this.updateStore(id, 'add');
        this.focus(id);

        eventBus.emit('window:created', { id, config });
        return id;
    }

    buildWindowElement(id, config)
    {
        const windowEl = document.createElement('div');
        windowEl.id = id;
        windowEl.className = 'os-window';
        windowEl.innerHTML = `
            <div class="window-chrome">
                <div class="window-title">${config.title}</div>
                <div class="window-controls">
                    <button class="btn-minimize" aria-label="Minimize">─</button>
                    <button class="btn-maximize" aria-label="Maximize">□</button>
                    <button class="btn-close" aria-label="Close">✕</button>
                </div>
            </div>
            <div class="window-content"></div>
        `;

        this.attachEventListeners(windowEl, id);
        return windowEl;
    }

    attachEventListeners(windowEl, id)
    {
        const closeBtn = windowEl.querySelector('.btn-close');
        const minimizeBtn = windowEl.querySelector('.btn-minimize');
        const maximizeBtn = windowEl.querySelector('.btn-maximize');

        closeBtn.addEventListener('click', () => this.destroy(id));
        minimizeBtn.addEventListener('click', () => this.minimize(id));
        maximizeBtn.addEventListener('click', () => this.maximize(id));
        windowEl.addEventListener('mousedown', () => this.focus(id));
    }

    destroy(id)
    {
        const windowData = this.windows.get(id);
        if (!windowData) return;

        gsap.to(windowData.element, {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () =>
            {
                windowData.element.remove();
                this.windows.delete(id);
                this.updateStore(id, 'remove');
                eventBus.emit('window:destroyed', { id });
            }
        });
    }

    focus(id)
    {
        const currentZIndex = store.getState().zIndex;
        const windowData = this.windows.get(id);
        if (!windowData) return;

        windowData.element.style.zIndex = currentZIndex + 1;
        store.setState({ activeWindowId: id, zIndex: currentZIndex + 1 });
        eventBus.emit('window:focused', { id });
    }

    minimize(id)
    {
        const windowData = this.windows.get(id);
        if (!windowData) return;

        gsap.to(windowData.element, {
            scale: 0.1,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: () =>
            {
                windowData.element.style.display = 'none';
                eventBus.emit('window:minimized', { id });
            }
        });
    }

    maximize(id)
    {
        const windowData = this.windows.get(id);
        if (!windowData) return;

        const isMaximized = windowData.element.classList.contains('maximized');
        if (isMaximized)
        {
            gsap.to(windowData.element, {
                width: windowData.config.width || '600px',
                height: windowData.config.height || '400px',
                top: windowData.config.top || '100px',
                left: windowData.config.left || '100px',
                duration: 0.4,
                ease: 'power2.inOut'
            });
            windowData.element.classList.remove('maximized');
        }
        else
        {
            gsap.to(windowData.element, {
                width: '100vw',
                height: 'calc(100vh - 48px)',
                top: 0,
                left: 0,
                duration: 0.4,
                ease: 'power2.inOut'
            });
            windowData.element.classList.add('maximized');
        }
        eventBus.emit('window:maximized', { id, isMaximized: !isMaximized });
    }

    updateStore(id, action)
    {
        const currentWindows = store.getState().windows;
        if (action === 'add')
        {
            store.setState({ windows: [...currentWindows, id] });
        }
        else if (action === 'remove')
        {
            store.setState({ windows: currentWindows.filter(w => w !== id) });
        }
    }
}

export const windowManager = new WindowManager();
```

### Core Module: Router

The Router maps desktop icons to window-app modules.

```javascript
import { windowManager } from './WindowManager.js';

class Router
{
    constructor()
    {
        this.routes = new Map();
    }

    register(path, config)
    {
        this.routes.set(path, config);
    }

    navigate(path)
    {
        const config = this.routes.get(path);
        if (!config)
        {
            console.error(`Route not found: ${path}`);
            return;
        }

        const windowId = windowManager.create(config);
        this.loadApp(windowId, config.module);
    }

    async loadApp(windowId, modulePath)
    {
        const windowEl = document.getElementById(windowId);
        const contentEl = windowEl.querySelector('.window-content');

        try
        {
            const module = await import(modulePath);
            if (typeof module.init === 'function')
            {
                module.init(contentEl, windowId);
            }
        }
        catch (error)
        {
            console.error(`Failed to load app: ${modulePath}`, error);
            contentEl.innerHTML = '<div class="error">Failed to load application</div>';
        }
    }
}

export const router = new Router();

router.register('/games', {
    title: 'Games',
    module: '/js/apps/games.js',
    width: '800px',
    height: '600px',
    top: '100px',
    left: '150px'
});

router.register('/about', {
    title: 'About',
    module: '/js/apps/about.js',
    width: '600px',
    height: '400px',
    top: '120px',
    left: '200px'
});
```

### App Module Example

Each "app" is a self-contained module that exports an `init` function.

```javascript
// /js/apps/games.js
export function init(container, windowId)
{
    container.innerHTML = `
        <div class="games-app">
            <h1>Our Games</h1>
            <div class="games-grid">
                <!-- Game cards rendered here -->
            </div>
        </div>
    `;

    const gamesGrid = container.querySelector('.games-grid');
    loadGames(gamesGrid);
}

async function loadGames(grid)
{
    const response = await fetch('/data/games.json');
    const games = await response.json();

    games.forEach(game =>
    {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
        `;
        grid.appendChild(card);
    });
}
```

### GSAP Integration

GSAP is the primary animation library. Import it once in your main entry point.

```javascript
// /js/main.js
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { windowManager } from './core/WindowManager.js';
import { router } from './core/Router.js';

gsap.registerPlugin(Draggable);

document.addEventListener('DOMContentLoaded', () =>
{
    initDesktop();
    initTaskbar();
    initDesktopIcons();
});

function initDesktopIcons()
{
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon =>
    {
        icon.addEventListener('dblclick', () =>
        {
            const path = icon.dataset.path;
            router.navigate(path);
        });
    });
}
```

### Performance Rules

> **Rule 1:** Use `transform` and `opacity` for animations. Never animate `width`, `height`, `top`, `left`, or `margin`.
>
> **Rule 2:** Use `will-change` sparingly and only on elements that are actively animating. Remove it when animation completes.
>
> **Rule 3:** Debounce resize and scroll events. Use `requestAnimationFrame` for frame-by-frame logic.
>
> **Rule 4:** Lazy-load app modules. Use dynamic `import()` to load code only when a window is opened.
>
> **Rule 5:** Clean up event listeners and GSAP timelines when windows are destroyed to prevent memory leaks.

---

## 3. Mandatory Code Formatting: Bracket Placement

> To maintain a consistent and highly readable codebase, we employ a strict formatting rule for code blocks across all languages (CSS, JavaScript, etc.).

### Rule

> **Always** separate the opening bracket `{` of a code block onto a new line. **No exceptions.**

### Correct CSS Formatting

```css
.hero-container
{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

@media (max-width: 768px)
{
    .hero-container
    {
        flex-direction: column;
    }
}
```

### Correct JavaScript Formatting

```javascript
document.addEventListener('DOMContentLoaded', function()
{
    const contactForm = document.getElementById('contactForm');

    if (contactForm)
    {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});
```

---

## 4. Cybersecurity & Vulnerability Prevention

> Security is not an afterthought; it is a top priority built into the foundation of the code.

### Rules

> **Rule 1:** Always apply rigorous security standards to links, forms, and user inputs.
>
> **Rule 2:** Prevent **Cross-Site Scripting (XSS)** by never trusting user input. Always sanitize data before rendering it to the DOM. Use `textContent` instead of `innerHTML` when inserting user-generated content.
>
> **Rule 3:** Secure external links. When opening links in a new tab (`target="_blank"`), you must include `rel="noopener noreferrer"` to prevent the newly opened page from gaining access to the original page's `window` object.
>
> **Rule 4:** Validate and sanitize all data passed to window-app modules. Never execute arbitrary code from external sources.

### Example: Secure HTML Links

```html
<a href="https://external-website.com" target="_blank" rel="noopener noreferrer">
    Visit our partner
</a>
```

### Example: Safe DOM Manipulation

```javascript
function renderUserInput(container, userInput)
{
    const p = document.createElement('p');
    p.textContent = userInput;
    container.appendChild(p);
}
```

---

## 5. Serverless Email Messaging Systems

> To maintain a fast, agile, and serverless architecture, we do not rely on traditional backend servers for simple tasks like email routing.

### Rule

> Email messaging systems (such as contact forms, newsletter signups, or lead captures) must be designed to integrate directly with **Cloudflare Workers** and **Resend** — unless the user explicitly requests an alternative.

### Why This Matters

| Component | Purpose |
|-----------|---------|
| **Cloudflare Workers** | Edge-network computing; form submissions processed instantly near the user's geographic location |
| **Resend** | Ultra-fast, modern API for delivering emails reliably |
| **Combined** | Eliminates the need for maintaining a dedicated Node.js/PHP backend just for sending emails |

### Architecture Flow for Forms

1. **Frontend HTML** `<form>` collects data.
2. **Vanilla JavaScript** intercepts the `submit` event.
3. JavaScript uses `fetch()` to send a JSON payload to a **Cloudflare Worker URL**.
4. The Cloudflare Worker securely holds the API keys and forwards the payload to the **Resend API**.

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  HTML Form   │────▶│  Vanilla JS      │────▶│  Cloudflare      │────▶│  Resend API  │
│  (Collects)  │     │  (Intercepts)    │     │  Worker (Edge)   │     │  (Delivers)  │
└──────────────┘     └──────────────────┘     └──────────────────┘     └──────────────┘
```

---

## 6. Responsive Design & Adaptation

> The OS desktop metaphor is inherently desktop-first, but the site must gracefully adapt to smaller screens.

### Rules

> **Rule 1:** Desktop-first design. The full OS experience is optimized for screens **≥1024px**.
>
> **Rule 2:** Tablet adaptation (**768px–1023px**). Simplify window management: disable resize, snap windows to full-screen, and use a simplified taskbar.
>
> **Rule 3:** Mobile adaptation (**<768px**). Abandon the OS metaphor and fall back to a **stacked single-column layout** or a **"phone OS" metaphor** with full-screen app views and a bottom navigation bar.
>
> **Rule 4:** Use **fluid typography** and **relative units** (`rem`, `em`, `vw`, `vh`) instead of fixed pixels where possible.
>
> **Rule 5:** Test on real devices. Emulators are not sufficient for touch interactions and performance.

### Breakpoint Strategy

```css
:root
{
    --breakpoint-mobile: 768px;
    --breakpoint-tablet: 1024px;
    --breakpoint-desktop: 1280px;
}

@media (max-width: 1023px)
{
    .os-window
    {
        width: 100vw !important;
        height: calc(100vh - 48px) !important;
        top: 0 !important;
        left: 0 !important;
    }
}

@media (max-width: 767px)
{
    .desktop-shell
    {
        display: none;
    }

    .mobile-fallback
    {
        display: block;
    }
}
```

---

## 7. Accessibility (a11y)

> Accessibility is not optional. The OS desktop metaphor introduces unique challenges that must be addressed.

### Rules

> **Rule 1:** All interactive elements must be **keyboard-navigable**. Use `tabindex`, `aria-*` attributes, and proper focus management.
>
> **Rule 2:** Windows must have appropriate **ARIA roles**. Use `role="dialog"` for windows, `role="application"` for the desktop shell, and `aria-live` regions for dynamic content.
>
> **Rule 3:** Ensure **color contrast** meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).
>
> **Rule 4:** Provide **visible focus indicators**. Never remove focus outlines without providing a clear alternative.
>
> **Rule 5:** Support **screen readers**. Use semantic HTML, provide alt text for images, and announce dynamic changes with `aria-live`.
>
> **Rule 6:** Respect **`prefers-reduced-motion`**. Disable or simplify animations for users who prefer reduced motion.

### Example: Accessible Window

```html
<div class="os-window" role="dialog" aria-labelledby="window-title-1" aria-modal="true">
    <div class="window-chrome">
        <h2 id="window-title-1" class="window-title">Games</h2>
        <div class="window-controls">
            <button class="btn-minimize" aria-label="Minimize window">─</button>
            <button class="btn-maximize" aria-label="Maximize window">□</button>
            <button class="btn-close" aria-label="Close window">✕</button>
        </div>
    </div>
    <div class="window-content" tabindex="0">
        <!-- App content -->
    </div>
</div>
```

### Example: Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce)
{
    *,
    *::before,
    *::after
    {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## 8. SEO & Discoverability

> Even though this is a highly interactive SPA-like experience, SEO is critical for discoverability.

### Rules

> **Rule 1:** Use **semantic HTML** (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`) to structure content.
>
> **Rule 2:** Include comprehensive **meta tags** in `<head>`: `title`, `description`, `keywords`, `author`, and Open Graph tags for social sharing.
>
> **Rule 3:** Provide **structured data** (JSON-LD) for the organization, games, and any other relevant entities.
>
> **Rule 4:** Ensure all content is **crawlable**. Use server-side rendering (SSR) or static site generation (SSG) for critical content, or provide a fallback static version.
>
> **Rule 5:** Use **descriptive URLs** and implement a proper sitemap (`sitemap.xml`) and `robots.txt`.

### Example: Meta Tags

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artesano Games — Indie Game Studio</title>
    <meta name="description" content="Artesano Games is an indie game studio crafting unique experiences. Explore our games, team, and story.">
    <meta name="keywords" content="indie games, game studio, artesano games, video games">
    <meta name="author" content="Artesano Games">

    <meta property="og:title" content="Artesano Games — Indie Game Studio">
    <meta property="og:description" content="Crafting unique gaming experiences. Explore our games and story.">
    <meta property="og:image" content="https://artesanogames.com/images/og-image.jpg">
    <meta property="og:url" content="https://artesanogames.com">
    <meta property="og:type" content="website">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Artesano Games">
    <meta name="twitter:description" content="Indie game studio crafting unique experiences.">
    <meta name="twitter:image" content="https://artesanogames.com/images/twitter-card.jpg">
</head>
```

### Example: Structured Data (JSON-LD)

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Artesano Games",
    "url": "https://artesanogames.com",
    "logo": "https://artesanogames.com/images/logo.png",
    "description": "Indie game studio crafting unique gaming experiences.",
    "sameAs": [
        "https://twitter.com/artesanogames",
        "https://discord.gg/artesanogames"
    ]
}
</script>
```

---

## 9. Image Performance & Optimization

> Images are critical for a game studio website, but they must be optimized to maintain performance.

### Rules

> **Rule 1:** Use **modern formats** (`WebP`, `AVIF`) with fallbacks to `JPEG` or `PNG`. Serve WebP by default.
>
> **Rule 2:** Implement **responsive images** using `srcset` and `sizes` to serve appropriately sized images for each device.
>
> **Rule 3:** Use **lazy loading** (`loading="lazy"`) for all images below the fold. Never lazy-load above-the-fold images.
>
> **Rule 4:** Compress images aggressively. Use tools like `sharp`, `imagemin`, or Cloudflare's image optimization.
>
> **Rule 5:** Use **sprite sheets** or **SVG icons** for UI elements to reduce HTTP requests.
>
> **Rule 6:** Provide **explicit dimensions** (`width` and `height` attributes) to prevent layout shift (CLS).

### Example: Responsive Image with Lazy Loading

```html
<picture>
    <source srcset="/images/game-cover.avif" type="image/avif">
    <source srcset="/images/game-cover.webp" type="image/webp">
    <img
        src="/images/game-cover.jpg"
        alt="Game Title Cover Art"
        width="800"
        height="600"
        loading="lazy"
        decoding="async"
    >
</picture>
```

### Example: SVG Sprite Sheet

```html
<svg class="icon" aria-hidden="true">
    <use href="/assets/icons.svg#icon-close"></use>
</svg>
```

---

## 10. Animation & Interaction Standards

> Animations bring the OS desktop to life, but they must be performant and purposeful.

### Rules

> **Rule 1:** Use **GSAP** for all complex animations (window lifecycle, transitions, timelines). It is the industry standard for performant, timeline-based animations.
>
> **Rule 2:** Use **CSS transitions** for simple hover, focus, and state changes. CSS is more performant for simple property changes.
>
> **Rule 3:** Maintain **60fps**. Only animate `transform` and `opacity`. Avoid animating layout properties (`width`, `height`, `top`, `left`).
>
> **Rule 4:** Use **`requestAnimationFrame`** for any custom frame-by-frame logic. Never use `setInterval` for animations.
>
> **Rule 5:** Respect **`prefers-reduced-motion`**. Provide a reduced-motion experience for users who prefer it.
>
> **Rule 6:** Clean up GSAP timelines and tweens when elements are destroyed to prevent memory leaks.

### Example: Window Open Animation

```javascript
import { gsap } from 'gsap';

function openWindow(windowEl)
{
    gsap.fromTo(windowEl,
        {
            scale: 0.8,
            opacity: 0,
            y: 20
        },
        {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
        }
    );
}
```

### Example: CSS Transition for Hover

```css
.desktop-icon
{
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.desktop-icon:hover
{
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

### Performance Budget

| Metric | Target |
|--------|--------|
| **Frame rate** | 60fps (16.67ms per frame) |
| **First Contentful Paint (FCP)** | <1.5s |
| **Largest Contentful Paint (LCP)** | <2.5s |
| **Cumulative Layout Shift (CLS)** | <0.1 |
| **Total Blocking Time (TBT)** | <200ms |

---

## 11. Deployment & Hosting

> The site is deployed on **Cloudflare Pages** for fast global CDN, automatic SSL, and seamless integration with Cloudflare Workers.

### Rules

> **Rule 1:** Use **Cloudflare Pages** for static hosting. It provides fast global CDN, automatic SSL, and Git integration.
>
> **Rule 2:** Store sensitive data (API keys, environment variables) in **Cloudflare Pages environment variables** or **Cloudflare Workers KV**. Never commit secrets to the repository.
>
> **Rule 3:** Use **Cloudflare Workers** for serverless functions (email routing, API proxies). Workers run at the edge for low-latency responses.
>
> **Rule 4:** Implement a **build process** to optimize assets (minify CSS/JS, compress images, generate WebP). Use tools like `esbuild`, `vite`, or Cloudflare Pages' built-in build system.
>
> **Rule 5:** Use **Git-based deployment**. Connect your repository to Cloudflare Pages for automatic deployments on push to `main`.

### Environment Variables

```bash
# Cloudflare Pages Environment Variables
RESEND_API_KEY=your_resend_api_key
CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev
```

### Build Process

```bash
# Example build script
npm install
npm run build

# Build steps:
# 1. Minify CSS and JavaScript
# 2. Compress and convert images to WebP
# 3. Generate sprite sheets
# 4. Copy static assets to /dist
```

### Deployment Flow

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Git Push    │────▶│  Cloudflare      │────▶│  Global CDN      │
│  to main     │     │  Pages Build     │     │  (Edge Network)  │
└──────────────┘     └──────────────────┘     └──────────────────┘
```

---
