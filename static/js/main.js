// Khet.ai - Main JavaScript File

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Initialize Lucide icons after DOM is loaded
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Utility functions
function showLoading(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

// API helper functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Form validation helpers
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    return isValid;
}

// File upload helpers
function handleFileUpload(input, previewContainer, callback) {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File size must be less than 10MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                if (previewContainer) {
                    const img = previewContainer.querySelector('img');
                    if (img) {
                        img.src = e.target.result;
                        showElement(previewContainer);
                    }
                }
                if (callback) callback(file, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Progress bar helper
function updateProgress(progressBar, percentage) {
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

// Alert helpers
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="${getAlertIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    // Insert at top of page content
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
        pageContent.insertBefore(alert, pageContent.firstChild);
        
        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'alert-triangle';
        case 'error': return 'x-circle';
        default: return 'info';
    }
}

// Copy to clipboard helper
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Copied to clipboard!', 'success');
    }).catch(() => {
        showAlert('Failed to copy to clipboard', 'error');
    });
}

// Smooth scroll helper
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
}

// Format numbers
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

// Format currency (Indian Rupees)
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Date formatting
function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Weather icon mapping
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'sun',
        '01n': 'moon',
        '02d': 'cloud-sun',
        '02n': 'cloud-moon',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloud',
        '04n': 'cloud',
        '09d': 'cloud-rain',
        '09n': 'cloud-rain',
        '10d': 'cloud-sun-rain',
        '10n': 'cloud-moon-rain',
        '11d': 'cloud-lightning',
        '11n': 'cloud-lightning',
        '13d': 'cloud-snow',
        '13n': 'cloud-snow',
        '50d': 'cloud-fog',
        '50n': 'cloud-fog'
    };
    
    return iconMap[iconCode] || 'cloud';
}

// Export functions for use in other scripts
window.KhetAI = {
    showLoading,
    hideLoading,
    showElement,
    hideElement,
    apiRequest,
    validateForm,
    handleFileUpload,
    updateProgress,
    showAlert,
    copyToClipboard,
    smoothScroll,
    saveToLocalStorage,
    loadFromLocalStorage,
    formatNumber,
    formatCurrency,
    formatDate,
    getWeatherIcon
};