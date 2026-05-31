/* ============================================
   Taskbar — Bottom Dock with Clock & Theme Toggle
   ============================================ */

import { eventBus } from '../core/EventBus.js';
import { store } from '../core/StateStore.js';
import { windowManager } from '../core/WindowManager.js';

class Taskbar
{
    constructor()
    {
        this.element = document.querySelector('.taskbar');
        this.centerArea = this.element.querySelector('.taskbar-center');
        this.clockElement = this.element.querySelector('.taskbar-clock');
        this.themeToggle = this.element.querySelector('.theme-toggle-btn');

        this.init();
    }

    init()
    {
        this.startClock();
        this.listenToEvents();
        this.attachThemeToggle();
    }

    startClock()
    {
        const updateClock = () =>
        {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            this.clockElement.textContent = `${hours}:${minutes}`;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    listenToEvents()
    {
        eventBus.on('window:created', ({ id, config }) =>
        {
            this.addTaskbarItem(id, config);
        });

        eventBus.on('window:destroyed', ({ id }) =>
        {
            this.removeTaskbarItem(id);
        });

        eventBus.on('window:focused', ({ id }) =>
        {
            this.updateActiveItem(id);
        });

        eventBus.on('window:minimized', ({ id }) =>
        {
            this.deactivateItem(id);
        });

        eventBus.on('window:restored', ({ id }) =>
        {
            this.updateActiveItem(id);
        });
    }

    addTaskbarItem(windowId, config)
    {
        const item = document.createElement('button');
        item.className = 'taskbar-app-item';
        item.dataset.windowId = windowId;
        const iconHtml = (typeof config.icon === 'string' && (config.icon.startsWith('./') || config.icon.startsWith('/') || config.icon.startsWith('http')))
            ? `<img src="${config.icon}" alt="${config.title}" loading="lazy">`
            : (config.icon || '📁');
        item.innerHTML = `
            <span class="taskbar-app-icon">${iconHtml}</span>
            <span class="taskbar-app-label">${config.title}</span>
        `;

        item.addEventListener('click', () =>
        {
            const windowData = windowManager.windows.get(windowId);
            if (windowData && windowData.isMinimized)
            {
                windowManager.restore(windowId);
            }
            else if (store.getState().activeWindowId === windowId)
            {
                windowManager.minimize(windowId);
            }
            else
            {
                windowManager.focus(windowId);
            }
        });

        this.centerArea.appendChild(item);
    }

    removeTaskbarItem(windowId)
    {
        const item = this.centerArea.querySelector(`[data-window-id="${windowId}"]`);
        if (item) item.remove();
    }

    updateActiveItem(windowId)
    {
        this.centerArea.querySelectorAll('.taskbar-app-item').forEach(item =>
        {
            item.classList.toggle('active', item.dataset.windowId === windowId);
        });
    }

    deactivateItem(windowId)
    {
        const item = this.centerArea.querySelector(`[data-window-id="${windowId}"]`);
        if (item) item.classList.remove('active');
    }

    attachThemeToggle()
    {
        this.themeToggle.addEventListener('click', () =>
        {
            const currentTheme = store.getState().theme;
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            store.setState({ theme: newTheme });
            this.updateThemeIcon(newTheme);
        });
    }

    updateThemeIcon(theme)
    {
        const iconSrc = theme === 'light'
            ? './assets/dark_icons.png'
            : './assets/light_icons.png';
        this.themeToggle.innerHTML = `<img src="${iconSrc}" alt="${theme} mode" loading="lazy">`;
    }
}

export function initTaskbar()
{
    return new Taskbar();
}
