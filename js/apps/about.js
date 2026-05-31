/* ============================================
   About App — Artesano Games Studio Info
   ============================================ */

export function init(container, windowId)
{
    container.innerHTML = `
        <div class="about-app">
            <div class="about-content">
                <div class="about-hero">
                    <img src="images/banner.jpg" alt="Artesano Games banner" class="about-banner">
                </div>

                <div class="about-section">
                    <h2 class="about-section-title">Our Mission</h2>
                    <p><img src="assets/co.png" alt="Colombia" class="about-flag"><br> Small indie studio focused on delivering high-quality games every month. 
                       We aim to learn from and contribute to our local industry while creating fun, surprising, and mindful experiences.
                    </p>
                    <p>We are just getting started!!</p>
                </div>

                <div class="about-section">
                    <h2 class="about-section-title">The Team</h2>
                    <p><strong>Samuel Andrés Agudelo</strong>: Founder &amp; Main Developer.</p>
                    <p>He loves taking <a href="https://www.instagram.com/sagudelophoto/" target="_blank" rel="noopener noreferrer">photos</a>, being not good at downhill and playing with Unity.</p>
                    <p><a href="https://sagudelo.com/" target="_blank" rel="noopener noreferrer">Want to know more?</a></p>
                </div>

                <div class="about-footer">
                    <p>Created with love by sagudelo</p>
                </div>
            </div>
        </div>
    `;
}
