// dashboard.js
let currentUser = null;
let currentBookingId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication first
        await checkAuth();

        // Initialize date picker
        const dateInput = document.getElementById('bookingDateTime');
        if (!dateInput) {
            console.error('Could not find bookingDateTime input');
            return;
        }

        console.log('Initializing Flatpickr...');
        const fp = flatpickr(dateInput, {
            enableTime: true,
            minDate: "today",
            dateFormat: "Y-m-d H:i",
            time_24hr: false,
            defaultHour: 9,
            defaultMinute: 0,
            minuteIncrement: 30,
            disableMobile: false,
            onChange: function(selectedDates, dateStr) {
                console.log('Date selected:', dateStr);
            },
            onOpen: function() {
                console.log('Calendar opened');
            },
            onClose: function() {
                console.log('Calendar closed');
            }
        });
        console.log('Flatpickr initialized successfully');

        // Add form submit handler if form exists
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                try {
                    const dateTimeStr = document.getElementById('bookingDateTime').value;
                    if (!dateTimeStr) {
                        alert('Please select a date and time');
                        return;
                    }

                    const recipientName = document.getElementById('recipientName').value;
                    if (!recipientName) {
                        alert('Please enter recipient name');
                        return;
                    }

                    const startDate = new Date(dateTimeStr);
                    const endDate = new Date(startDate);
                    endDate.setHours(endDate.getHours() + 24);
                    
                    const bookingData = {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        recipientName: recipientName,
                        hirerName: currentUser.email
                    };

                    console.log('Submitting booking:', bookingData);
                    
                    const response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify(bookingData)
                    });

                    const responseData = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(responseData.message || 'Failed to create booking');
                    }
                    
                    console.log('Booking created:', responseData);
                    alert('Booking created successfully!');
                    bookingForm.reset();
                    await loadBookings();
                } catch (error) {
                    console.error('Error creating booking:', error);
                    alert(error.message || 'Failed to create booking. Please try again.');
                }
            });
        }

        // Load initial data
        await loadBookings();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

function loadData() {
    // Load bookings
    fetch('/api/bookings', {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(bookings => renderBookings(bookings))
    .catch(console.error);

    // Load surprises
    fetch('/api/surprises', {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(surprises => renderSurprises(surprises))
    .catch(console.error);
}

// ... keep renderBookings, renderSurprises, getStatusBadge the same ...

// Updated slide management
let slideCount = 0;
function addSlide() {
    slideCount++;
    const slideHTML = `
        <div class="slide-card mb-4 p-3 border rounded">
            <div class="d-flex justify-content-between mb-3">
                <h6>Slide ${slideCount}</h6>
                <button class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label>Title</label>
                        <input type="text" class="form-control slide-title" required>
                    </div>
                    <div class="mb-3">
                        <label>Description</label>
                        <textarea class="form-control slide-description" rows="3"></textarea>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label>Background Type</label>
                        <select class="form-select bg-type">
                            <option value="gradient">Gradient</option>
                            <option value="image">Image</option>
                            <option value="solid">Solid Color</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label>Background Value</label>
                        <input type="text" class="form-control bg-value">
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('slidesContainer').insertAdjacentHTML('beforeend', slideHTML);
}

// Add form submission handler
document.getElementById('surpriseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const slides = Array.from(document.querySelectorAll('.slide-card')).map(slide => ({
        title: slide.querySelector('.slide-title').value,
        description: slide.querySelector('.slide-description').value,
        backgroundType: slide.querySelector('.bg-type').value,
        backgroundValue: slide.querySelector('.bg-value').value
    }));

    try {
        const response = await fetch('/api/slides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slides }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Surprise saved successfully!');
            loadData();
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (err) {
        alert(err.message);
    }
});

// Check authentication and load user data
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/auth.html';
            return;
        }
        
        currentUser = await response.json();
        
        // Display user email in navbar
        document.getElementById('userEmail').textContent = currentUser.email;
        
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/auth.html';
    }
}

// Load and display bookings
async function loadBookings() {
    try {
        const response = await fetch('/api/bookings', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load bookings');
        }
        
        const bookings = await response.json();
        console.log('Loaded bookings:', bookings);
        
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) {
            console.error('Could not find bookingsList element');
            return;
        }

        if (!bookings || bookings.length === 0) {
            bookingsList.innerHTML = '<p class="text-muted">No bookings found</p>';
            return;
        }
        
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">For: ${booking.recipientName}</h5>
                        <p class="mb-1">
                            Start: ${new Date(booking.startDate).toLocaleString()}<br>
                            End: ${new Date(booking.endDate).toLocaleString()}
                        </p>
                        <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span>
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm" onclick="editSlides(${booking.id})">
                            Edit Slides
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBooking(${booking.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load bookings:', error);
        alert('Failed to load bookings. Please try again.');
    }
}

// Edit slides for a booking
async function editSlides(bookingId) {
    try {
        const response = await fetch(`/api/slides?bookingId=${bookingId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load slides');
        }
        
        const slides = await response.json();
        console.log('Loaded slides:', slides);
        
        // Show the slides editor section
        const slidesEditor = document.getElementById('slidesEditor');
        if (!slidesEditor) {
            console.error('Could not find slidesEditor element');
            return;
        }
        slidesEditor.classList.remove('d-none');
        
        // Update booking info
        const selectedBookingInfo = document.getElementById('selectedBookingInfo');
        if (selectedBookingInfo) {
            selectedBookingInfo.textContent = `Editing slides for booking #${bookingId}`;
        }
        
        // Clear and populate the slides container
        const slidesContainer = document.getElementById('slidesContainer');
        if (!slidesContainer) {
            console.error('Could not find slidesContainer element');
            return;
        }
        slidesContainer.innerHTML = '';
        
        // Add slides if they exist
        if (Array.isArray(slides) && slides.length > 0) {
            slides.forEach(slide => addSlide(slide));
        } else {
            // Add one empty slide if no slides exist
            addSlide();
        }
        
        // Store the current booking ID
        currentBookingId = bookingId;
    } catch (error) {
        console.error('Failed to load slides:', error);
        alert('Failed to load slides. Please try again.');
    }
}

// Add new slide
function addSlide(slideData = null) {
    const slidesContainer = document.getElementById('slidesContainer');
    if (!slidesContainer) {
        console.error('Could not find slidesContainer element');
        return;
    }

    const slideHTML = `
        <div class="slide-card mb-4 border rounded p-3" data-slide-id="${slideData?.id || ''}">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Title</label>
                        <input type="text" class="form-control slide-title" value="${slideData?.title || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control slide-description" rows="3">${slideData?.description || ''}</textarea>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Background Type</label>
                        <select class="form-control bg-type" onchange="toggleBackgroundInput(this)">
                            <option value="gradient" ${slideData?.backgroundType === 'gradient' ? 'selected' : ''}>Gradient</option>
                            <option value="image" ${slideData?.backgroundType === 'image' ? 'selected' : ''}>Image</option>
                            <option value="solid" ${slideData?.backgroundType === 'solid' ? 'selected' : ''}>Solid Color</option>
                        </select>
                    </div>
                    <div class="mb-3 background-value-container">
                        ${getBackgroundInputHTML(slideData?.backgroundType, slideData?.backgroundValue)}
                    </div>
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="this.closest('.slide-card').remove()">
                <i class="fas fa-trash"></i> Remove Slide
            </button>
        </div>
    `;
    
    slidesContainer.insertAdjacentHTML('beforeend', slideHTML);
}

// Get appropriate background input based on type
function getBackgroundInputHTML(type, value) {
    switch(type) {
        case 'image':
            return `
                <input type="file" class="form-control" accept="image/*">
                ${value ? `<img src="${value}" class="mt-2 img-thumbnail" style="max-height: 100px;" data-original-path="${value}">` : ''}
            `;
        case 'gradient':
            return `<input type="text" class="form-control bg-value" value="${value || 'linear-gradient(135deg, #FEADA6, #F5EFEF)'}" placeholder="CSS gradient">`;
        case 'solid':
            return `<input type="color" class="form-control bg-value" value="${value || '#FFFFFF'}">`;
        default:
            return `<input type="text" class="form-control bg-value" value="${value || ''}" placeholder="Background value">`;
    }
}

// Toggle background input type
function toggleBackgroundInput(select) {
    const container = select.closest('.col-md-6').querySelector('.background-value-container');
    container.innerHTML = getBackgroundInputHTML(select.value);
}

// Save all slides for current booking
async function saveSlides() {
    if (!currentBookingId) {
        alert('No booking selected');
        return;
    }
    
    try {
        // Get all slides from the form
        const slides = Array.from(document.querySelectorAll('.slide-card')).map((card, index) => {
            const slideId = card.getAttribute('data-slide-id');
            const formData = new FormData();
            formData.append('bookingId', currentBookingId);
            formData.append('order', index);
            
            const title = card.querySelector('.slide-title').value;
            const description = card.querySelector('.slide-description').value;
            const bgType = card.querySelector('.bg-type').value;
            
            if (!title) {
                throw new Error(`Slide ${index + 1} is missing a title`);
            }
            
            formData.append('title', title);
            formData.append('description', description || '');
            formData.append('backgroundType', bgType);
            
            if (bgType === 'image') {
                const fileInput = card.querySelector('input[type="file"]');
                const existingImage = card.querySelector('img');
                
                if (fileInput.files[0]) {
                    // New image uploaded
                    formData.append('image', fileInput.files[0]);
                } else if (existingImage) {
                    // Use existing image path
                    const imagePath = existingImage.getAttribute('data-original-path');
                    if (!imagePath) {
                        throw new Error(`Slide ${index + 1} is missing an image`);
                    }
                    formData.append('backgroundValue', imagePath);
                } else {
                    throw new Error(`Slide ${index + 1} is missing an image`);
                }
            } else {
                const bgValue = card.querySelector('.bg-value').value;
                if (!bgValue) {
                    throw new Error(`Slide ${index + 1} is missing a background value`);
                }
                formData.append('backgroundValue', bgValue);
            }

            // If this is an existing slide, add its ID
            if (slideId) {
                formData.append('id', slideId);
            }
            
            return formData;
        });

        // Get existing slides to compare
        const existingSlidesResponse = await fetch(`/api/slides?bookingId=${currentBookingId}`, {
            credentials: 'include'
        });
        
        if (!existingSlidesResponse.ok) {
            throw new Error('Failed to fetch existing slides');
        }
        
        const existingSlides = await existingSlidesResponse.json();
        const existingSlideIds = new Set(existingSlides.map(s => s.id));
        
        // Process each slide
        const results = [];
        for (const formData of slides) {
            const slideId = formData.get('id');
            
            if (slideId && existingSlideIds.has(parseInt(slideId))) {
                // Update existing slide
                console.log('Updating existing slide:', slideId);
                const response = await fetch(`/api/slides/${slideId}`, {
                    method: 'PUT',
                    body: formData,
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`Failed to update slide ${slideId}: ${error.message}`);
                }
                
                results.push(await response.json());
            } else {
                // Create new slide
                console.log('Creating new slide');
                const response = await fetch('/api/slides', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`Failed to create slide: ${error.message}`);
                }
                
                results.push(await response.json());
            }
        }
        
        // Delete slides that were removed
        const newSlideIds = new Set(slides.map(s => s.get('id')).filter(Boolean).map(Number));
        const slidesToDelete = existingSlides.filter(s => !newSlideIds.has(s.id));
        
        for (const slide of slidesToDelete) {
            console.log('Deleting removed slide:', slide.id);
            const response = await fetch(`/api/slides/${slide.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to delete slide ${slide.id}: ${error.message}`);
            }
        }
        
        console.log('Slides saved successfully:', results);
        alert('Slides saved successfully!');
        
        // Hide the slides editor
        const slidesEditor = document.getElementById('slidesEditor');
        if (slidesEditor) {
            slidesEditor.classList.add('d-none');
        }
        
        // Reload bookings to refresh the list
        await loadBookings();
    } catch (error) {
        console.error('Failed to save slides:', error);
        alert('Failed to save slides: ' + error.message);
    }
}

// Delete a booking
async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }

    try {
        const response = await fetch(`/api/bookings/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete booking');
        }

        await loadBookings();
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
    }
}

// Helper function to get status color
function getStatusColor(status) {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'active':
            return 'success';
        case 'completed':
            return 'info';
        default:
            return 'secondary';
    }
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
});