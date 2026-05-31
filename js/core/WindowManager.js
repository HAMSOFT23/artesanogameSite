/* ============================================
   WindowManager — Window Lifecycle & Stacking
   ============================================ */

import { eventBus } from './EventBus.js';
import { store } from './StateStore.js';

class WindowManager
{
    constructor()
    {
        this.windows = new Map();
        this.desktopArea = document.querySelector('.desktop-area');
    }

    create(config)
    {
        const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const windowEl = this.buildWindowElement(id, config);
        this.desktopArea.appendChild(windowEl);

        this.windows.set(id, { element: windowEl, config, isMinimized: false });
        this.updateStore(id, 'add');
        this.focus(id);
        this.animateOpen(windowEl);

        eventBus.emit('window:created', { id, config });
        return id;
    }

    buildWindowElement(id, config)
    {
        const windowEl = document.createElement('div');
        windowEl.id = id;
        windowEl.className = 'os-window';
        windowEl.style.width = config.width || '600px';
        windowEl.style.height = config.height || '400px';
        windowEl.style.top = config.top || '100px';
        windowEl.style.left = config.left || '100px';

        windowEl.innerHTML = `
            <div class="window-chrome" data-window-id="${id}">
                <div class="window-title">${config.title}</div>
                <div class="window-controls">
                    <button class="window-control-btn minimize" aria-label="Minimize window">─</button>
                    <button class="window-control-btn maximize" aria-label="Maximize window">□</button>
                    <button class="window-control-btn close" aria-label="Close window">✕</button>
                </div>
            </div>
            <div class="window-content"></div>
            <div class="window-resize-handle" data-window-id="${id}"></div>
        `;

        this.attachEventListeners(windowEl, id);
        this.attachDrag(windowEl.querySelector('.window-chrome'), windowEl);
        this.attachResize(windowEl.querySelector('.window-resize-handle'), windowEl);

        return windowEl;
    }

    attachEventListeners(windowEl, id)
    {
        const closeBtn = windowEl.querySelector('.window-control-btn.close');
        const minimizeBtn = windowEl.querySelector('.window-control-btn.minimize');
        const maximizeBtn = windowEl.querySelector('.window-control-btn.maximize');

        closeBtn.addEventListener('click', () => this.destroy(id));
        minimizeBtn.addEventListener('click', () => this.minimize(id));
        maximizeBtn.addEventListener('click', () => this.maximize(id));

        windowEl.addEventListener('mousedown', () => this.focus(id));

        // Prevent focus loss when clicking inside window
        windowEl.querySelector('.window-content').addEventListener('mousedown', (e) =>
        {
            e.stopPropagation();
        });
    }

    attachDrag(chrome, windowEl)
    {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        chrome.addEventListener('mousedown', (e) =>
        {
            if (windowEl.classList.contains('maximized')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = windowEl.offsetLeft;
            startTop = windowEl.offsetTop;
            windowEl.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) =>
        {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            windowEl.style.left = `${startLeft + dx}px`;
            windowEl.style.top = `${startTop + dy}px`;
        });

        document.addEventListener('mouseup', () =>
        {
            if (!isDragging) return;
            isDragging = false;
            windowEl.style.transition = '';
        });
    }

    attachResize(handle, windowEl)
    {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.addEventListener('mousedown', (e) =>
        {
            e.stopPropagation();
            if (windowEl.classList.contains('maximized')) return;
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowEl.offsetWidth;
            startHeight = windowEl.offsetHeight;
            windowEl.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) =>
        {
            if (!isResizing) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newWidth = Math.max(300, startWidth + dx);
            const newHeight = Math.max(200, startHeight + dy);
            windowEl.style.width = `${newWidth}px`;
            windowEl.style.height = `${newHeight}px`;
        });

        document.addEventListener('mouseup', () =>
        {
            if (!isResizing) return;
            isResizing = false;
            windowEl.style.transition = '';
        });
    }

    destroy(id)
    {
        const windowData = this.windows.get(id);
        if (!windowData) return;

        windowData.element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        windowData.element.style.opacity = '0';
        windowData.element.style.transform = 'scale(0.95)';

        setTimeout(() =>
        {
            windowData.element.remove();
            this.windows.delete(id);
            this.updateStore(id, 'remove');
            eventBus.emit('window:destroyed', { id });
        }, 200);
    }

    focus(id)
    {
        const currentZIndex = store.getState().zIndex;
        const windowData = this.windows.get(id);
        if (!windowData) return;

        // Update visual active state
        this.windows.forEach((data, key) =>
        {
            if (key === id)
            {
                data.element.classList.add('active');
            }
            else
            {
                data.element.classList.remove('active');
            }
        });

        windowData.element.style.zIndex = currentZIndex + 1;
        windowData.element.style.display = 'flex';
        store.setState({ activeWindowId: id, zIndex: currentZIndex + 1 });
        eventBus.emit('window:focused', { id });
    }

    minimize(id)
    {
        const windowData = this.windows.get(id);
        if (!windowData) return;

        windowData.element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        windowData.element.style.opacity = '0';
        windowData.element.style.transform = 'scale(0.9)';
        windowData.isMinimized = true;

        setTimeout(() =>
        {
            windowData.element.style.display = 'none';
            eventBus.emit('window:minimized', { id });
        }, 200);
    }

    restore(id)
    {
        const windowData = this.windows.get(id);
        if (!windowData || !windowData.isMinimized) return;

        windowData.element.style.display = 'flex';
        windowData.isMinimized = false;
        this.focus(id);

        requestAnimationFrame(() =>
        {
            windowData.element.style.opacity = '1';
            windowData.element.style.transform = 'scale(1)';
        });

        eventBus.emit('window:restored', { id });
    }

    maximize(id)
    {
        const windowData = this.windows.get(id);
        if (!windowData) return;

        const isMaximized = windowData.element.classList.contains('maximized');

        if (isMaximized)
        {
            windowData.element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            windowData.element.style.width = windowData.config.width || '600px';
            windowData.element.style.height = windowData.config.height || '400px';
            windowData.element.style.top = windowData.config.top || '100px';
            windowData.element.style.left = windowData.config.left || '100px';
            windowData.element.classList.remove('maximized');
        }
        else
        {
            windowData.element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            windowData.element.style.width = '100%';
            windowData.element.style.height = `calc(100% - var(--taskbar-height))`;
            windowData.element.style.top = '0';
            windowData.element.style.left = '0';
            windowData.element.classList.add('maximized');
        }

        setTimeout(() =>
        {
            windowData.element.style.transition = '';
        }, 300);

        eventBus.emit('window:maximized', { id, isMaximized: !isMaximized });
    }

    animateOpen(windowEl)
    {
        windowEl.style.opacity = '0';
        windowEl.style.transform = 'scale(0.85) translateY(20px)';

        requestAnimationFrame(() =>
        {
            windowEl.style.transition = 'opacity 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)';
            windowEl.style.opacity = '1';
            windowEl.style.transform = 'scale(1) translateY(0)';

            setTimeout(() =>
            {
                windowEl.style.transition = '';
            }, 350);
        });
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
