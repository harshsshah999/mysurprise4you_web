document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.querySelector('.slides-container');
    const indicatorsContainer = document.querySelector('.slide-indicators');
    const prevButton = document.getElementById('prevSlide');
    const nextButton = document.getElementById('nextSlide');
    let currentSlideIndex = 0;
    let slides = [];
    let currentTemplate = null;
    let autoAdvanceInterval;

    // Fetch slides from API
    async function fetchSlides() {
        try {
            const response = await fetch('/api/slides/active');
            if (!response.ok) throw new Error('Failed to fetch slides');
            const data = await response.json();
            console.log('Received data:', data);
            slides = data.slides;
            
            // Get template from factory
            const templateType = data.template_type || 'immersive';
            currentTemplate = TemplateFactory.getTemplate(templateType);
            console.log('Template type:', templateType);
            
            // Apply template-specific class to container
            slidesContainer.className = `slides-container ${currentTemplate.getContainerClasses()}`;
            console.log('Container classes:', slidesContainer.className);
            
            renderSlides();
            startAutoAdvance();
        } catch (error) {
            console.error('Error fetching slides:', error);
        }
    }

    // Render slides
    function renderSlides() {
        // Clear existing slides
        slidesContainer.innerHTML = '';
        indicatorsContainer.innerHTML = '';

        slides.forEach((slide, index) => {
            // Create slide element
            const slideElement = document.createElement('div');
            slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
            
            // Set background
            if (slide.background_type === 'image') {
                slideElement.style.backgroundImage = `url('${slide.background_value}')`;
            } else if (slide.background_type === 'gradient') {
                slideElement.style.background = slide.background_value;
            } else if (slide.background_type === 'solid') {
                slideElement.style.backgroundColor = slide.background_value;
            }

            // Create content
            const content = document.createElement('div');
            content.className = 'slide-content';
            
            // Use template to render slide content
            content.innerHTML = currentTemplate.renderSlide(slide);
            
            slideElement.appendChild(content);
            slidesContainer.appendChild(slideElement);

            // Create indicator
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
    }

    // Navigation functions
    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        const slideElements = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');

        slideElements.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        slideElements[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlideIndex = index;

        // Reset auto-advance timer
        restartAutoAdvance();
    }

    function nextSlide() {
        goToSlide(currentSlideIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentSlideIndex - 1);
    }

    // Auto-advance functionality
    function startAutoAdvance() {
        if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }

    function restartAutoAdvance() {
        if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }

    // Event listeners
    if (prevButton) prevButton.addEventListener('click', prevSlide);
    if (nextButton) nextButton.addEventListener('click', nextSlide);

    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Initialize
    fetchSlides();
}); 