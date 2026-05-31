/* ============================================
   Router — Maps Desktop Icons to App Modules + Hash Routing
   ============================================ */

import { windowManager } from './WindowManager.js';
import { eventBus } from './EventBus.js';

class Router
{
    constructor()
    {
        this.routes = new Map();
        this.isSyncingHash = false;
    }

    register(path, config)
    {
        this.routes.set(path, config);
    }

    init()
    {
        // Listen for hash changes (browser back/forward)
        window.addEventListener('hashchange', () => this.handleHashChange());

        // Listen for window events to sync hash
        eventBus.on('window:focused', ({ id }) =>
        {
            const windowData = windowManager.windows.get(id);
            if (windowData && windowData.config)
            {
                this.syncHash(windowData.config.path);
            }
        });

        eventBus.on('window:destroyed', ({ id }) =>
        {
            const activeWindowId = windowManager.windows.size > 0
                ? this.findTopmostWindow()
                : null;

            if (activeWindowId)
            {
                const windowData = windowManager.windows.get(activeWindowId);
                if (windowData && windowData.config)
                {
                    this.syncHash(windowData.config.path);
                }
            }
            else
            {
                this.syncHash(null);
            }
        });

        // Handle initial hash on page load
        this.handleInitialHash();
    }

    navigate(path)
    {
        const config = this.routes.get(path);
        if (!config)
        {
            console.error(`Route not found: ${path}`);
            return;
        }

        const existingWindow = this.findExistingWindow(config.title);
        if (existingWindow)
        {
            windowManager.restore(existingWindow);
            return;
        }

        const windowId = windowManager.create(config);
        this.loadApp(windowId, config.module, config.data);
    }

    findExistingWindow(title)
    {
        const windows = windowManager.windows;
        for (const [id, data] of windows)
        {
            if (data.config.title === title)
            {
                return id;
            }
        }
        return null;
    }

    findTopmostWindow()
    {
        let topmostId = null;
        let highestZ = -1;

        windowManager.windows.forEach((data, id) =>
        {
            const zIndex = parseInt(data.element.style.zIndex) || 0;
            if (zIndex > highestZ)
            {
                highestZ = zIndex;
                topmostId = id;
            }
        });

        return topmostId;
    }

    async loadApp(windowId, modulePath, data = null)
    {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        const contentEl = windowEl.querySelector('.window-content');

        try
        {
            const module = await import(modulePath);
            if (typeof module.init === 'function')
            {
                module.init(contentEl, windowId, data);
            }
            else
            {
                contentEl.innerHTML = '<div class="error">Application has no init function</div>';
            }
        }
        catch (error)
        {
            console.error(`Failed to load app: ${modulePath}`, error);
            contentEl.innerHTML = '<div class="error">Failed to load application</div>';
        }
    }

    /* ============================================
       Hash Routing
       ============================================ */

    syncHash(path)
    {
        if (this.isSyncingHash) return;

        this.isSyncingHash = true;

        const newHash = path ? `#${path}` : '#';
        if (window.location.hash !== newHash)
        {
            window.location.hash = newHash;
        }

        // Reset flag after hashchange event would have fired
        setTimeout(() =>
        {
            this.isSyncingHash = false;
        }, 50);
    }

    handleHashChange()
    {
        if (this.isSyncingHash) return;

        const path = this.parseHash();
        if (!path) return;

        const config = this.routes.get(path);
        if (!config) return;

        // Check if window already exists
        const existingWindow = this.findExistingWindow(config.title);
        if (existingWindow)
        {
            windowManager.focus(existingWindow);
        }
        else
        {
            // Prevent auto-opening from creating duplicates on user-initiated navigation
            // Only auto-open if the hash change came from browser back/forward
            const windowId = windowManager.create(config);
            this.loadApp(windowId, config.module, config.data);
        }
    }

    handleInitialHash()
    {
        const path = this.parseHash();
        if (path && this.routes.has(path))
        {
            // Small delay to ensure desktop is fully initialized
            setTimeout(() =>
            {
                this.navigate(path);
            }, 100);
        }
    }

    parseHash()
    {
        const hash = window.location.hash;
        if (!hash || hash === '#') return null;

        // Remove leading # and any query params
        const path = hash.replace(/^#/, '').split('?')[0];

        // Security: validate against registered routes only
        if (this.routes.has(path))
        {
            return path;
        }

        return null;
    }
}

export const router = new Router();
