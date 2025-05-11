// dashboard.js
let currentUser = null;
let currentBookingId = null;
let currentBookings = []; // Store bookings globally

// Initialize template selection
function initializeTemplateSelection() {
    const templateOptions = document.querySelectorAll('.template-option');
    templateOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
        });
    });
}

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

        // Initialize template selection
        initializeTemplateSelection();

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
                        hirerName: currentUser?.email
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
function addSlide(slideData = null) {
    const slidesContainer = document.getElementById('slidesContainer');
    const slideHTML = `
        <div class="slide-card mb-4 border rounded p-3" data-slide-id="${slideData?.id || ''}">
            <div class="mb-3">
                <label class="form-label">Title</label>
                <input type="text" class="form-control slide-title" value="${slideData?.title || ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control slide-description" rows="3">${slideData?.description || ''}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Link Title</label>
                <input type="text" class="form-control slide-link-title" value="${slideData?.link_title || ''}" placeholder="Optional link text">
            </div>
            <div class="mb-3">
                <label class="form-label">Link URL</label>
                <input type="url" class="form-control slide-link-url" value="${slideData?.link_url || ''}" placeholder="https://example.com">
            </div>
            <div class="mb-3">
                <label class="form-label">Background Type</label>
                <select class="form-control bg-type" onchange="toggleBackgroundInput(this)">
                    <option value="gradient" ${slideData?.background_type === 'gradient' ? 'selected' : ''}>Gradient</option>
                    <option value="image" ${slideData?.background_type === 'image' ? 'selected' : ''}>Image</option>
                    <option value="solid" ${slideData?.background_type === 'solid' ? 'selected' : ''}>Solid Color</option>
                </select>
            </div>
            <div class="mb-3 background-value-container">
                ${getBackgroundInputHTML(slideData?.background_type, slideData?.background_value)}
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
                <div>
                    <input type="file" class="form-control bg-value" accept="image/*">
                    ${value ? `
                        <div class="mt-2">
                            <img src="${value}" class="img-thumbnail" style="max-height: 100px;" data-original-path="${value}">
                            <input type="hidden" class="bg-value-hidden" value="${value}">
                        </div>
                    ` : ''}
                </div>
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
    const container = select.closest('.slide-card').querySelector('.background-value-container');
    container.innerHTML = getBackgroundInputHTML(select.value);
}

// Edit slides for a booking
async function editSlides(bookingId) {
    try {
        currentBookingId = bookingId;
        const booking = currentBookings.find(b => b.id === bookingId);
        
        if (!booking) {
            throw new Error('Booking not found');
        }

        // Show the slides editor
        const slidesEditor = document.getElementById('slidesEditor');
        slidesEditor.classList.remove('d-none');

        // Update booking info
        const bookingInfo = document.getElementById('selectedBookingInfo');
        bookingInfo.innerHTML = `
            <h5>Editing slides for: ${booking.recipient_name}</h5>
            <p>
                Start: ${new Date(booking.start_date).toLocaleString()}<br>
                End: ${new Date(booking.end_date).toLocaleString()}
            </p>
        `;

        // Set the current template type and reinitialize template selection
        const templateOptions = document.querySelectorAll('.template-option');
        templateOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.template === booking.template_type) {
                option.classList.add('selected');
            }
        });
        initializeTemplateSelection(); // Reinitialize template selection

        // Clear existing slides
        const slidesContainer = document.getElementById('slidesContainer');
        slidesContainer.innerHTML = '';

        // Fetch existing slides
        const response = await fetch(`/api/slides?bookingId=${bookingId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch slides');
        }

        const slides = await response.json();
        
        // Add existing slides or a blank one if none exist
        if (slides.length > 0) {
            slides.forEach(slide => addSlide(slide));
        } else {
            addSlide(); // Add one blank slide
        }

        // Scroll to the editor
        slidesEditor.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Failed to load slides:', error);
        alert('Failed to load slides. Please try again.');
    }
}

// Save all slides for current booking
async function saveSlides() {
    if (!currentBookingId) {
        alert('No booking selected. Please select a booking first.');
        return;
    }

    try {
        // Get the selected template type
        const selectedTemplate = document.querySelector('.template-option.selected');
        if (!selectedTemplate) {
            throw new Error('Please select a template style');
        }
        const templateType = selectedTemplate.dataset.template;

        // Update the booking's template type
        const updateBookingResponse = await fetch(`/api/bookings/${currentBookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ template_type: templateType })
        });

        if (!updateBookingResponse.ok) {
            throw new Error('Failed to update template type');
        }

        const slides = Array.from(document.querySelectorAll('.slide-card')).map((card, index) => {
            const formData = new FormData();
            
            // Add basic slide data
            formData.append('bookingId', currentBookingId);
            formData.append('order', index);
            formData.append('title', card.querySelector('.slide-title').value);
            formData.append('description', card.querySelector('.slide-description').value || '');
            formData.append('link_title', card.querySelector('.slide-link-title').value || '');
            formData.append('link_url', card.querySelector('.slide-link-url').value || '');
            
            const bgType = card.querySelector('.bg-type').value;
            formData.append('backgroundType', bgType);

            if (bgType === 'image') {
                const fileInput = card.querySelector('input[type="file"]');
                const hiddenInput = card.querySelector('.bg-value-hidden');
                
                if (fileInput.files[0]) {
                    // New image uploaded
                    formData.append('image', fileInput.files[0]);
                } else if (hiddenInput && hiddenInput.value) {
                    // Use existing image path
                    formData.append('backgroundValue', hiddenInput.value);
                } else {
                    throw new Error(`Please select an image for slide ${index + 1}`);
                }
            } else {
                // For gradient or solid color
                const bgValue = card.querySelector('.bg-value').value;
                if (!bgValue) {
                    throw new Error(`Please provide a background value for slide ${index + 1}`);
                }
                formData.append('backgroundValue', bgValue);
            }

            const slideId = card.dataset.slideId;
            if (slideId) {
                formData.append('id', slideId);
            }

            return formData;
        });

        // Save each slide
        for (const formData of slides) {
            const response = await fetch('/api/slides', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save slide');
            }
        }

        alert('Slides saved successfully!');
        await editSlides(currentBookingId); // Refresh the slides view
    } catch (error) {
        console.error('Error saving slides:', error);
        alert(error.message || 'Failed to save slides. Please try again.');
    }
}

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
        console.log('Current user:', currentUser);
        
        // Display user email in navbar
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement) {
            userEmailElement.textContent = currentUser.email;
        }
        
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load bookings');
        }
        
        currentBookings = await response.json();
        console.log('Loaded bookings:', currentBookings);
        
        const bookingsList = document.getElementById('bookingsList');
        if (!bookingsList) {
            console.error('Could not find bookingsList element');
            return;
        }

        if (!currentBookings || currentBookings.length === 0) {
            bookingsList.innerHTML = '<p class="text-muted">No bookings found</p>';
            return;
        }
        
        bookingsList.innerHTML = currentBookings.map(booking => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">For: ${booking.recipient_name}</h5>
                        <p class="mb-1">
                            Start: ${new Date(booking.start_date).toLocaleString()}<br>
                            End: ${new Date(booking.end_date).toLocaleString()}
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

// Get background value based on type
function getBackgroundValue(card, type) {
    switch(type) {
        case 'image':
            const fileInput = card.querySelector('input[type="file"]');
            const hiddenInput = card.querySelector('.bg-value-hidden');
            
            if (fileInput.files[0]) {
                // New image uploaded
                return fileInput.files[0];
            } else if (hiddenInput && hiddenInput.value) {
                // Use existing image path
                return hiddenInput.value;
            }
            return null;
        case 'gradient':
        case 'solid':
            return card.querySelector('.bg-value').value;
        default:
            return null;
    }
}