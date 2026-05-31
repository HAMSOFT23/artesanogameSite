/* ============================================
   Helpers — DOM Utilities & Common Functions
   ============================================ */

export function debounce(func, wait)
{
    let timeout;
    return function executedFunction(...args)
    {
        const later = () =>
        {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit)
{
    let inThrottle;
    return function executedFunction(...args)
    {
        if (!inThrottle)
        {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function generateId()
{
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}

export function snapToGrid(value, gridSize)
{
    return Math.round(value / gridSize) * gridSize;
}
