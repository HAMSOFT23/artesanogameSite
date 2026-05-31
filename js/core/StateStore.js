/* ============================================
   StateStore — Centralized State Container
   ============================================ */

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
    desktopIcons: [],
    theme: 'light'
});
