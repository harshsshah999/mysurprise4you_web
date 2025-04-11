/**
 * Template System
 * 
 * This file implements a template system using the Strategy pattern.
 * Each template is a separate strategy that can be easily added or modified.
 */

// Template Interface
class Template {
    constructor() {
        if (this.constructor === Template) {
            throw new Error("Template is an abstract class and cannot be instantiated directly.");
        }
    }

    // Render a slide with this template
    renderSlide(slide) {
        throw new Error("Method 'renderSlide' must be implemented by subclasses.");
    }

    // Get CSS classes for this template
    getContainerClasses() {
        throw new Error("Method 'getContainerClasses' must be implemented by subclasses.");
    }
}

// Immersive Template Implementation
class ImmersiveTemplate extends Template {
    renderSlide(slide) {
        return `
            <h1 class="slide-title">${slide.title}</h1>
            <p class="slide-description">${slide.description}</p>
            ${slide.link_url && slide.link_title ? `
                <a href="${slide.link_url}" class="slide-link" target="_blank" rel="noopener noreferrer">
                    ${slide.link_title}
                </a>
            ` : ''}
        `;
    }

    getContainerClasses() {
        return 'immersive-template';
    }
}

// Split Template Implementation
class SplitTemplate extends Template {
    renderSlide(slide) {
        return `
            <div class="split-content">
                <div class="split-text">
                    <h1 class="slide-title">${slide.title}</h1>
                    <p class="slide-description">${slide.description}</p>
                    ${slide.link_url && slide.link_title ? `
                        <a href="${slide.link_url}" class="slide-link" target="_blank" rel="noopener noreferrer">
                            ${slide.link_title}
                        </a>
                    ` : ''}
                </div>
                <div class="split-image-container">
                    <div class="split-image" style="background-image: url('${slide.background_value}')"></div>
                </div>
            </div>
        `;
    }

    getContainerClasses() {
        return 'split-template';
    }
}

// Template Factory
class TemplateFactory {
    static getTemplate(templateType) {
        switch (templateType) {
            case 'split':
                return new SplitTemplate();
            case 'immersive':
            default:
                return new ImmersiveTemplate();
        }
    }
}

// Export the template factory
window.TemplateFactory = TemplateFactory; 