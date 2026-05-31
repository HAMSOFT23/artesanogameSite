/* ============================================
   Support Us App — Funding & Patreon Info
   ============================================ */

export function init(container, windowId)
{
    container.innerHTML = `
        <div class="support-app">
            <div class="support-content">
                <div class="support-hero">
                    <h1 class="support-title">Support Our Work</h1>
                    <p class="support-subtitle">Help us keep crafting unique experiences</p>
                </div>

                <div class="support-section">
                    <h2 class="support-section-title">Our Games</h2>
                    <p>Our first game, available June 16 on itch.io. Every purchase directly funds our next project!!</p>
                    <div class="support-embed">
                        <iframe frameborder="0"
                            src="https://itch.io/embed/3457969?linkback=true&amp;border_width=0&amp;bg_color=1a1a2e&amp;fg_color=f5f5f5&amp;link_color=e94560&amp;border_color=16213e"
                            width="550"
                            height="165">
                            <a href="https://hamsoft23.itch.io/outnt">OUTN'T by sagudelo</a>
                        </iframe>
                    </div>
                </div>

                <div class="support-section">
                    <h2 class="support-section-title">Patreon Membership</h2>
                    <p>Get access to all of our games, behind-the-scenes content, early builds, and help us craft our games.</p>
                    <a href="https://www.patreon.com/c/ArtesanoGames" target="_blank" rel="noopener noreferrer" class="support-btn support-btn--primary">Become a Patron</a>
                </div>

                <div class="support-section">
                    <h2 class="support-section-title">Other Ways to Help</h2>
                    <ul class="support-list">
                        <li>Wishlist our upcoming games</li>
                        <li>Share with friends and on social media</li>
                        <li>Leave feedback and bug reports</li>
                        <li>Join our community discussions</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}
