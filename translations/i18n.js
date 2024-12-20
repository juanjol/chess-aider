// Language management class
class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.observers = [];
    }

    // Load translations for a specific language
    async loadTranslations(lang) {
        try {
            const module = await import(`./${lang}.js`);
            this.translations[lang] = module.default;
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
        }
    }

    // Change current language and notify observers
    async setLanguage(lang) {
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }
        this.currentLanguage = lang;
        this.notifyObservers();
    }

    // Get translation for a key
    translate(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    // Add observer for language changes
    addObserver(callback) {
        this.observers.push(callback);
    }

    // Update all translatable elements
    updateTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });

        // Update input values that have data-i18n-value
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            element.value = this.translate(key);
        });
    }

    // Notify all observers of language change
    notifyObservers() {
        this.observers.forEach(callback => callback());
        this.updateTranslations();
    }
}

// Create and export singleton instance
const i18n = new I18n();
export default i18n;
