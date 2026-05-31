/* ============================================
   Outn't App — 3D Puzzle Shot Game Promo
   ============================================ */

export function init(container, windowId)
{
    container.innerHTML = `
        <div class="outnt-app">
            <div class="outnt-content">
                <div class="outnt-header">
                    <h1 class="outnt-title">OUTN'T</h1>
                    <p class="outnt-tagline">A 3D PUZZLE SHORT GAME</p>
                </div>

                <div class="outnt-description">
                    <p>A 3D puzzle game in which the player is trapped inside an office, finding himself in the same place over and over again.
                       Your best chance? Play the mini game on the computer.</p>
                </div>

                    <div class="outnt-screenshots">
                        <div class="outnt-screenshot">
                            <img src="images/outn't/screen1.png" alt="OUTN'T title screen" loading="lazy">
                        </div>
                        <div class="outnt-screenshot">
                            <img src="images/outn't/screen2.png" alt="OUTN'T gameplay screenshot 1" loading="lazy">
                        </div>
                        <div class="outnt-screenshot">
                            <img src="images/outn't/screen3.png" alt="OUTN'T gameplay screenshot 2" loading="lazy">
                        </div>
                    </div>

                <div class="outnt-description">
                    <p>Outn't is a game developed by <a href="https://sagudelo.com/" target="_blank" rel="noopener noreferrer"> sagudelo </a> over a month. 
                    With the music of Grayson Varn.</p>
                </div>

                    <div class="outnt-embed">
                        <iframe frameborder="0" 
                        src="https://itch.io/embed/3457969?linkback=true&amp;border_width=0&amp;bg_color=050520&amp;fg_color=00ff41&amp;link_color=008f11&amp;border_color=363636" 
                        width="550" height="165"><a href="https://hamsoft23.itch.io/outnt">OUTN'T - COMING JUNE 16 by sagudelo</a>
                        </iframe>
                    </div>

                <div class="outnt-footer">
                    <span class="outnt-developer">by <a href="https://sagudelo.com/" target="_blank" rel="noopener noreferrer"> sagudelo </a></span>
                    <span class="outnt-version">V.0.7.6</span>
                </div>
            </div>
        </div>
    `;

    // itch.io embed is self-contained, no additional handlers needed
}
