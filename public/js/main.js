// main.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel
    const carousel = new bootstrap.Carousel('#surpriseCarousel', {
        interval: 5000,
        wrap: true
    });

    // Handle form submissions
    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add login logic here
    });

    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add registration logic here
    });
});

async function loadCurrentSlides() {
    try {
        // Get current slides based on time
        const response = await fetch('/api/slides/current');
        const slides = await response.json();
        
        const carouselInner = document.getElementById('carouselInner');
        
        if (slides.length > 0) {
            carouselInner.innerHTML = slides.map((slide, index) => 
                createSlideHTML(slide, index === 0)
            ).join('');
        } else {
            // Load default slides if no current booking
            const defaultResponse = await fetch('/api/slides/default');
            const defaultSlides = await defaultResponse.json();
            
            carouselInner.innerHTML = defaultSlides.map((slide, index) => 
                createSlideHTML(slide, index === 0)
            ).join('');
        }
    } catch (error) {
        console.error('Error loading slides:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentSlides();
    // Refresh slides every minute
    setInterval(loadCurrentSlides, 60000);
});