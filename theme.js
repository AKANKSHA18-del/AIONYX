/**
 * AIONYX Theme Manager
 * Handles dark/light theme switching with smooth transitions
 */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);

        // Create theme toggle button
        this.createToggleButton();

        // Create particles
        this.createParticles();

        // Add scroll effects
        this.addScrollEffects();
    }

    applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);

        // Update toggle button icon
        this.updateToggleIcon();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);

        // Add transition effect
        document.body.style.transition = 'background 0.5s ease, color 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }

    createToggleButton() {
        const toggle = document.createElement('div');
        toggle.className = 'theme-toggle';
        toggle.innerHTML = `
            <i class="theme-toggle-icon fas fa-moon"></i>
            <span class="theme-toggle-text">Dark Mode</span>
        `;
        toggle.addEventListener('click', () => this.toggleTheme());
        document.body.appendChild(toggle);

        this.toggleButton = toggle;
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        if (!this.toggleButton) return;

        const icon = this.toggleButton.querySelector('.theme-toggle-icon');
        const text = this.toggleButton.querySelector('.theme-toggle-text');

        if (this.currentTheme === 'light') {
            icon.className = 'theme-toggle-icon fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'theme-toggle-icon fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }

    createParticles() {
        const container = document.createElement('div');
        container.className = 'particles-container';

        // Create 20 particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';

            // Random animation delay
            particle.style.animationDelay = Math.random() * 15 + 's';

            container.appendChild(particle);
        }

        document.body.insertBefore(container, document.body.firstChild);
    }

    addScrollEffects() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
