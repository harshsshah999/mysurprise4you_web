document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.querySelector('.slides-container');
    const indicatorsContainer = document.querySelector('.slide-indicators');
    const prevButton = document.getElementById('prevSlide');
    const nextButton = document.getElementById('nextSlide');
    let currentSlideIndex = 0;
    let slides = [];
    let template_type = 'immersive';
    let autoAdvanceInterval;

    // Fetch slides from API
    async function fetchSlides() {
        try {
            const response = await fetch('/api/slides/active');
            if (!response.ok) throw new Error('Failed to fetch slides');
            const data = await response.json();
            console.log('Received data:', data); // Debug log
            slides = data.slides;
            template_type = data.template_type;
            console.log('Template type:', template_type); // Debug log
            
            // Apply template-specific class to container
            slidesContainer.className = `slides-container ${template_type}-template`;
            console.log('Container classes:', slidesContainer.className); // Debug log
            
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
            
            // Build content HTML based on template type
            let contentHTML = '';
            
            if (template_type === 'split') {
                contentHTML = `
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
                        <div class="split-image" style="background-image: url('${slide.background_value}')"></div>
                    </div>
                `;
            } else {
                // Default immersive template
                contentHTML = `
                    <h1 class="slide-title">${slide.title}</h1>
                    <p class="slide-description">${slide.description}</p>
                    ${slide.link_url && slide.link_title ? `
                        <a href="${slide.link_url}" class="slide-link" target="_blank" rel="noopener noreferrer">
                            ${slide.link_title}
                        </a>
                    ` : ''}
                `;
            }

            content.innerHTML = contentHTML;
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

    // Auto-advance functions
    function startAutoAdvance() {
        stopAutoAdvance(); // Clear any existing interval
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoAdvance() {
        if (autoAdvanceInterval) {
            clearInterval(autoAdvanceInterval);
        }
    }

    function restartAutoAdvance() {
        stopAutoAdvance();
        startAutoAdvance();
    }

    // Event listeners
    prevButton.addEventListener('click', () => {
        prevSlide();
        restartAutoAdvance();
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        restartAutoAdvance();
    });

    // Pause auto-advance when hovering over slides
    slidesContainer.addEventListener('mouseenter', stopAutoAdvance);
    slidesContainer.addEventListener('mouseleave', startAutoAdvance);

    // Initialize
    fetchSlides();
}); 