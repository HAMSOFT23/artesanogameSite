/* ============================================
   Main Entry Point — Initializes the Desktop OS
   ============================================ */

import { store } from './core/StateStore.js';
import { router } from './core/Router.js';
import { initTaskbar } from './ui/Taskbar.js';
import { initDesktopIcons } from './ui/DesktopIcons.js';

// Register routes
router.register('/outnt', {
    path: '/outnt',
    title: 'Outn\'t',
    icon: './assets/pc_Icon.png',
    module: '/js/apps/outnt.js',
    width: '800px',
    height: '600px',
    top: '80px',
    left: '120px'
});

router.register('/about', {
    path: '/about',
    title: 'About',
    icon: 'images/logo.jpg',
    module: '/js/apps/about.js',
    width: '700px',
    height: '550px',
    top: '100px',
    left: '150px'
});

router.register('/support', {
    path: '/support',
    title: 'Support',
    icon: './assets/patreon_icon.png',
    module: '/js/apps/support.js',
    width: '700px',
    height: '550px',
    top: '100px',
    left: '150px'
});

// Initialize desktop
document.addEventListener('DOMContentLoaded', () =>
{
    initTheme();
    initTaskbar();
    initDesktopIcons();
    router.init();
    console.log('Artesano Games Desktop OS initialized');
});

function initTheme()
{
    const savedTheme = localStorage.getItem('artesano-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);
    store.setState({ theme: initialTheme });

    // Update toggle button icon
    const themeToggle = document.querySelector('.theme-toggle-btn');
    if (themeToggle)
    {
        const iconSrc = initialTheme === 'light'
            ? './assets/dark_icons.png'
            : './assets/light_icons.png';
        themeToggle.innerHTML = `<img src="${iconSrc}" alt="${initialTheme} mode" loading="lazy">`;
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) =>
    {
        if (!localStorage.getItem('artesano-theme'))
        {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            store.setState({ theme: newTheme });
            if (themeToggle)
            {
                const iconSrc = newTheme === 'light'
                    ? './assets/dark_icons.png'
                    : './assets/light_icons.png';
                themeToggle.innerHTML = `<img src="${iconSrc}" alt="${newTheme} mode" loading="lazy">`;
            }
        }
    });

    // Subscribe to store changes to persist theme
    store.subscribe('theme', (newTheme) =>
    {
        localStorage.setItem('artesano-theme', newTheme);
    });
}
