/* ============================================
   DesktopIcons — Draggable Icons with Snap-to-Grid
   ============================================ */

import { router } from '../core/Router.js';
import { snapToGrid, clamp } from '../utils/helpers.js';

class DesktopIcons
{
    constructor()
    {
        this.GRID_SIZE = 96;
        this.DRAG_THRESHOLD = 5;
        this.ICONS_PER_COLUMN = 6;

        this.area = document.querySelector('.desktop-area');
        this.grid = document.querySelector('.desktop-icons-grid');
        this.icons = [];
        this.positions = this.loadPositions();

        this.dragState = null;
        this.clickTimers = new Map();
        this.DOUBLE_CLICK_DELAY = 300;

        this.init();
    }

    init()
    {
        // Click on empty desktop area to deselect all
        this.area.addEventListener('pointerdown', (e) =>
        {
            if (e.target === this.area || e.target === this.grid)
            {
                this.deselectAll();
            }
        });

        // Listen for window resize to clamp positions
        window.addEventListener('resize', () =>
        {
            this.clampAllPositions();
        });
    }

    add(config)
    {
        const index = this.icons.length;
        this.icons.push(config);

        // Calculate default position
        const defaultPos = this.getDefaultPosition(index);

        // Use saved position if available
        const savedPos = this.positions[config.path];
        const pos = savedPos || defaultPos;

        const iconEl = document.createElement('div');
        iconEl.className = 'desktop-icon';
        iconEl.dataset.path = config.path;
        iconEl.style.left = `${pos.x}px`;
        iconEl.style.top = `${pos.y}px`;
        const iconHtml = this.isImagePath(config.icon)
            ? `<img src="${config.icon}" alt="${config.label}" loading="lazy">`
            : (config.icon || '📁');
        iconEl.innerHTML = `
            <div class="icon-visual">${iconHtml}</div>
            <span class="icon-label">${config.label}</span>
        `;

        this.attachPointerEvents(iconEl, config);
        this.grid.appendChild(iconEl);
    }

    getDefaultPosition(index)
    {
        const col = Math.floor(index / this.ICONS_PER_COLUMN);
        const row = index % this.ICONS_PER_COLUMN;

        return {
            x: col * this.GRID_SIZE,
            y: row * this.GRID_SIZE
        };
    }

    attachPointerEvents(iconEl, config)
    {
        iconEl.addEventListener('pointerdown', (e) =>
        {
            e.preventDefault();
            e.stopPropagation();

            iconEl.setPointerCapture(e.pointerId);
            this.deselectAll();
            iconEl.classList.add('selected');

            this.dragState =
            {
                iconEl: iconEl,
                path: config.path,
                startX: e.clientX,
                startY: e.clientY,
                startLeft: parseFloat(iconEl.style.left) || 0,
                startTop: parseFloat(iconEl.style.top) || 0,
                hasDragged: false
            };
        });

        iconEl.addEventListener('pointermove', (e) =>
        {
            if (!this.dragState || this.dragState.iconEl !== iconEl) return;

            const dx = e.clientX - this.dragState.startX;
            const dy = e.clientY - this.dragState.startY;

            // Check if we've crossed the drag threshold
            if (!this.dragState.hasDragged)
            {
                if (Math.abs(dx) > this.DRAG_THRESHOLD || Math.abs(dy) > this.DRAG_THRESHOLD)
                {
                    this.dragState.hasDragged = true;
                    iconEl.classList.add('dragging');
                }
                else
                {
                    return;
                }
            }

            const newLeft = this.dragState.startLeft + dx;
            const newTop = this.dragState.startTop + dy;

            iconEl.style.left = `${newLeft}px`;
            iconEl.style.top = `${newTop}px`;
        });

        iconEl.addEventListener('pointerup', (e) =>
        {
            if (!this.dragState || this.dragState.iconEl !== iconEl) return;

            iconEl.releasePointerCapture(e.pointerId);
            iconEl.classList.remove('dragging');

            if (this.dragState.hasDragged)
            {
                // Snap to grid and save
                const currentLeft = parseFloat(iconEl.style.left) || 0;
                const currentTop = parseFloat(iconEl.style.top) || 0;

                const snappedX = snapToGrid(currentLeft, this.GRID_SIZE);
                const snappedY = snapToGrid(currentTop, this.GRID_SIZE);

                const clampedPos = this.clampPosition(snappedX, snappedY);

                iconEl.style.left = `${clampedPos.x}px`;
                iconEl.style.top = `${clampedPos.y}px`;

                this.positions[config.path] = clampedPos;
                this.savePositions();
            }
            else
            {
                // It was a click, not a drag
                // Manual double-click detection (e.detail is unreliable with pointer capture)
                const existingTimer = this.clickTimers.get(config.path);
                if (existingTimer)
                {
                    clearTimeout(existingTimer);
                    this.clickTimers.delete(config.path);
                    if (config.url)
                    {
                        const a = document.createElement('a');
                        a.href = config.url;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.click();
                    }
                    else
                    {
                        router.navigate(config.path);
                    }
                }
                else
                {
                    const timer = setTimeout(() => this.clickTimers.delete(config.path), this.DOUBLE_CLICK_DELAY);
                    this.clickTimers.set(config.path, timer);
                }
            }

            this.dragState = null;
        });

        // Handle case where pointer is released outside the icon
        iconEl.addEventListener('pointercancel', () =>
        {
            if (this.dragState && this.dragState.iconEl === iconEl)
            {
                iconEl.classList.remove('dragging');

                if (this.dragState.hasDragged)
                {
                    const currentLeft = parseFloat(iconEl.style.left) || 0;
                    const currentTop = parseFloat(iconEl.style.top) || 0;
                    const snappedX = snapToGrid(currentLeft, this.GRID_SIZE);
                    const snappedY = snapToGrid(currentTop, this.GRID_SIZE);
                    const clampedPos = this.clampPosition(snappedX, snappedY);

                    iconEl.style.left = `${clampedPos.x}px`;
                    iconEl.style.top = `${clampedPos.y}px`;

                    this.positions[config.path] = clampedPos;
                    this.savePositions();
                }

                this.dragState = null;
            }
        });
    }

    clampPosition(x, y)
    {
        const areaRect = this.area.getBoundingClientRect();
        const maxX = Math.max(0, areaRect.width - this.GRID_SIZE);
        const maxY = Math.max(0, areaRect.height - this.GRID_SIZE);

        return {
            x: clamp(x, 0, maxX),
            y: clamp(y, 0, maxY)
        };
    }

    clampAllPositions()
    {
        const areaRect = this.area.getBoundingClientRect();
        const maxX = Math.max(0, areaRect.width - this.GRID_SIZE);
        const maxY = Math.max(0, areaRect.height - this.GRID_SIZE);

        this.icons.forEach(config =>
        {
            const pos = this.positions[config.path];
            if (!pos) return;

            const clampedX = clamp(pos.x, 0, maxX);
            const clampedY = clamp(pos.y, 0, maxY);

            if (clampedX !== pos.x || clampedY !== pos.y)
            {
                this.positions[config.path] = { x: clampedX, y: clampedY };

                const iconEl = this.grid.querySelector(`[data-path="${config.path}"]`);
                if (iconEl)
                {
                    iconEl.style.left = `${clampedX}px`;
                    iconEl.style.top = `${clampedY}px`;
                }
            }
        });

        this.savePositions();
    }

    deselectAll()
    {
        this.grid.querySelectorAll('.desktop-icon').forEach(icon =>
        {
            icon.classList.remove('selected');
        });
    }

    isImagePath(icon)
    {
        return typeof icon === 'string' && (icon.startsWith('./') || icon.startsWith('/') || icon.startsWith('http'));
    }

    savePositions()
    {
        try
        {
            localStorage.setItem('artesano-icon-positions', JSON.stringify(this.positions));
        }
        catch (e)
        {
            console.warn('Failed to save icon positions:', e);
        }
    }

    loadPositions()
    {
        try
        {
            const saved = localStorage.getItem('artesano-icon-positions');
            return saved ? JSON.parse(saved) : {};
        }
        catch (e)
        {
            console.warn('Failed to load icon positions:', e);
            return {};
        }
    }
}

export function initDesktopIcons()
{
    const icons = new DesktopIcons();

    icons.add({
        path: '/outnt',
        label: 'Outn\'t',
        icon: './assets/pc_Icon.png'
    });

    icons.add({
        path: '/about',
        label: 'About',
        icon: '/images/logo.jpg'
    });

    // Social links (open in new tab, not OS windows)
    icons.add({
        path: '/twitter',
        label: 'Twitter',
        icon: './assets/ugly_bird.png',
        url: 'https://x.com/ArtesanoGames'
    });

    icons.add({
        path: '/itchio',
        label: 'itch.io',
        icon: './assets/itch_icon.png',
        url: 'https://artesanostudio.itch.io'
    });

    icons.add({
        path: '/support',
        label: 'Support',
        icon: './assets/patreon_icon.png'
    });

    icons.add({
        path: '/youtube',
        label: 'YouTube',
        icon: '▶️',
        url: 'https://www.youtube.com/@artesanogames01'
    });

    return icons;
}
