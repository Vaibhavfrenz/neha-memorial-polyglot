// Memorial Website Interactive Features with Firebase Integration
console.log("script.js loaded");

// Global flags to prevent duplicate initialization
let isInitialized = false;
let isModalInitialized = false;

// Language management
let currentLanguage = 'en';

// Language translations
const translations = {
    en: {
        // Default English text (already in HTML)
    },
    hi: {
        // Hindi translations
        'In Loving Memory - Neha Tomar': 'प्रेमपूर्ण स्मृति - नेहा तोमर',
        'In Loving Memory of a Soul Who Touched Us All.': 'उस आत्मा की प्रेमपूर्ण स्मृति में जिसने हम सभी को छुआ।',
        'Remembering Neha Tomar': 'नेहा तोमर को याद करते हुए',
        'Neha Tomar brought light into the lives of everyone she met — with her warmth, kindness, and gentle spirit. This memorial website is a small tribute to the love she gave so freely, and the countless memories we hold close in our hearts.': 'नेहा तोमर ने अपनी गर्मजोशी, दया और कोमल आत्मा के साथ हर उस व्यक्ति के जीवन में प्रकाश लाया जिससे वह मिलीं। यह स्मारक वेबसाइट उस प्यार के लिए एक छोटी सी श्रद्धांजलि है जो उन्होंने इतनी स्वतंत्रता से दिया, और उन अनगिनत यादों के लिए जिन्हें हम अपने दिलों में संजोए हुए हैं।',
        'Light a Candle': 'एक मोमबत्ती जलाएं',
        'Light a virtual candle in memory of Neha. Each candle represents a moment of remembrance and love.': 'नेहा की स्मृति में एक आभासी मोमबत्ती जलाएं। प्रत्येक मोमबत्ती स्मरण और प्रेम के एक क्षण का प्रतिनिधित्व करती है।',
        'Photo Memories': 'फोटो यादें',
        'A precious memory': 'एक अनमोल याद',
        'Memory Wall': 'स्मृति दीवार',
        'Share your memories, thoughts, and messages for Neha. Your words will be a lasting tribute to her beautiful spirit.': 'नेहा के लिए अपनी यादें, विचार और संदेश साझा करें। आपके शब्द उनकी सुंदर आत्मा के लिए एक स्थायी श्रद्धांजलि होंगे।',
        'Memories Shared': 'साझा की गई यादें',
        'This memorial website was created with love by family and friends.': 'यह स्मारक वेबसाइट परिवार और दोस्तों द्वारा प्यार से बनाई गई है।',
        'Share Your Photo': 'अपनी फोटो साझा करें',
        'Choose Photo': 'फोटो चुनें',
        'Remove': 'हटाएं',
        'Photo caption (optional)': 'फोटो कैप्शन (वैकल्पिक)',
        'Your name (optional)': 'आपका नाम (वैकल्पिक)',
        'Upload Photo': 'फोटो अपलोड करें',
        'Share a Memory': 'एक याद साझा करें',
        'Your name': 'आपका नाम',
        'Your email (optional)': 'आपका ईमेल (वैकल्पिक)',
        'Share your memory, message, or tribute...': 'अपनी याद, संदेश या श्रद्धांजलि साझा करें...',
        'Add Memory': 'याद जोड़ें',
        'Your message (optional)': 'आपका संदेश (वैकल्पिक)',
        'Light Candle': 'मोमबत्ती जलाएं'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");
    
    // Initialize language switcher
    initLanguageSwitcher();
    
    // Prevent duplicate initialization
    if (isInitialized) {
        console.log("Already initialized, skipping...");
        return;
    }
    
    // Initialize modals immediately
    if (!isModalInitialized) {
        initUploadModals();
        isModalInitialized = true;
    }
    
    // Wait for Firebase to initialize
    setTimeout(() => {
        if (window.db) {
            console.log("Firebase DB detected");
            initVisitorTracking();
            initCandleLighting();
            initPhotoSlideshow();
            initMemoryWall();
            initLightbox();
            initScrollToTop();
            initAnimations();
            isInitialized = true;
        } else {
            console.error('Firebase not initialized');
            showNotification('Database connection error. Please refresh the page.', 'error');
        }
    }, 1000);
    
    // Add floating bokeh particles to animated background
    const bg = document.querySelector('.animated-bg');
    if (bg) {
        for (let i = 0; i < 12; i++) {
            const bokeh = document.createElement('div');
            bokeh.className = 'bokeh';
            const size = Math.random() * 60 + 40;
            bokeh.style.width = `${size}px`;
            bokeh.style.height = `${size}px`;
            bokeh.style.left = `${Math.random() * 100}%`;
            bokeh.style.top = `${Math.random() * 100}%`;
            bokeh.style.background = `radial-gradient(circle, #fffbe6 0%, #ffe066 60%, transparent 100%)`;
            bokeh.style.animationDuration = `${12 + Math.random() * 8}s`;
            bg.appendChild(bokeh);
        }
    }
});

// Visitor Tracking with Geolocation
function initVisitorTracking() {
    const totalVisitorsElement = document.getElementById('totalVisitors');
    const countriesCountElement = document.getElementById('countriesCount');
    const citiesCountElement = document.getElementById('citiesCount');

    let visitorData = {
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Get visitor's IP and location
    async function getVisitorLocation() {
        try {
            // Use a free IP geolocation service
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            visitorData = {
                ...visitorData,
                ip: data.ip,
                country: data.country_name,
                countryCode: data.country_code,
                region: data.region,
                city: data.city,
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone
            };

            // Store visitor data in Firebase
            await db.collection('visitors').add(visitorData);
            
            // Update visitor statistics
            updateVisitorStats();
            
        } catch (error) {
            console.error('Error getting visitor location:', error);
            // Store basic visitor data without location
            visitorData.ip = 'Unknown';
            await db.collection('visitors').add(visitorData);
            updateVisitorStats();
        }
    }

    // Update visitor statistics
    async function updateVisitorStats() {
        try {
            const visitorsSnapshot = await db.collection('visitors').get();
            const totalVisitors = visitorsSnapshot.size;
            
            // Count unique countries and cities
            const countries = new Set();
            const cities = new Set();
            
            visitorsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.country) countries.add(data.country);
                if (data.city) cities.add(data.city);
            });

            // Animate the numbers
            animateNumber(totalVisitorsElement, totalVisitors);
            animateNumber(countriesCountElement, countries.size);
            animateNumber(citiesCountElement, cities.size);
            
        } catch (error) {
            console.error('Error updating visitor stats:', error);
        }
    }

    // Animate number counting
    function animateNumber(element, finalValue) {
        const startValue = 0;
        const duration = 2000;
        const increment = finalValue / (duration / 16);
        let currentValue = startValue;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(currentValue).toLocaleString();
        }, 16);
    }

    // Initialize visitor tracking
    getVisitorLocation();

    // Update stats every 30 seconds
    setInterval(updateVisitorStats, 30000);
}

// Candle Lighting Feature with Firebase
function initCandleLighting() {
    const candleContainer = document.getElementById('candleContainer');
    const totalCandlesElement = document.getElementById('totalCandles');
    
    let candles = [];
    let candleFormInitialized = false;
    
    // Listen for real-time updates
    db.collection('candles')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            candles = [];
            
            // Clear container
            candleContainer.innerHTML = '';
            
            // Add candles lit label back
            const candlesLitLabel = document.createElement('div');
            candlesLitLabel.className = 'candles-lit-label';
            candlesLitLabel.id = 'candlesLitLabel';
            candlesLitLabel.innerHTML = `<i class="fas fa-fire"></i> <span id="totalCandles">${snapshot.size}</span>`;
            candleContainer.appendChild(candlesLitLabel);
            
            snapshot.forEach((doc) => {
                const candle = { id: doc.id, ...doc.data() };
                candles.push(candle);
                addCandleToDisplay(candle);
            });
            
            updateCandleStats();
        }, (error) => {
            console.error('Error listening to candles:', error);
            showNotification('Error loading candles. Please refresh.', 'error');
        });
    
    function addCandleToDisplay(candle) {
        const candleElement = document.createElement('div');
        candleElement.className = 'candle';
        candleElement.innerHTML = `
            <div class="candle-flame"></div>
            <div class="candle-body"></div>
            <div class="candle-name">${candle.name}</div>
        `;
        
        // Add click event to show message
        if (candle.message) {
            candleElement.addEventListener('click', () => {
                showNotification(candle.message, 'info');
            });
            candleElement.style.cursor = 'pointer';
        }
        
        candleContainer.appendChild(candleElement);
    }
    
    function updateCandleStats() {
        if (totalCandlesElement) {
            totalCandlesElement.textContent = candles.length;
        }
    }
}

// Photo Slideshow Feature with Firebase
function initPhotoSlideshow() {
    const slideshowImage = document.getElementById('slideshowImage');
    const slideshowCaption = document.getElementById('slideshowCaption');
    const slideshowPrev = document.getElementById('slideshowPrev');
    const slideshowNext = document.getElementById('slideshowNext');
    const slideshowContainer = document.getElementById('slideshowContainer');

    // Touch gesture variables for photo slideshow
    let photoStartX = 0;
    let photoEndX = 0;
    let isPhotoDragging = false;

    let photos = [];
    let currentPhoto = 0;
    let photoInterval = null;

    function showPhoto(index) {
        if (photos.length === 0) {
            slideshowImage.src = 'images/2d6eaf51-e621-47d3-bd3d-56a6b2aedb59.jpg';
            slideshowCaption.innerHTML = 'A precious memory';
            return;
        }
        currentPhoto = (index + photos.length) % photos.length;
        const photo = photos[currentPhoto];
        slideshowImage.src = photo.src;
        updateSlideshowCaption(photo);
    }

    function nextPhoto() {
        showPhoto(currentPhoto + 1);
    }

    function prevPhoto() {
        showPhoto(currentPhoto - 1);
    }

    function startPhotoSlideshow() {
        if (photoInterval) clearInterval(photoInterval);
        photoInterval = setInterval(nextPhoto, 5000);
    }

    // Touch gesture handlers for photo slideshow
    slideshowContainer.addEventListener('touchstart', function(e) {
        photoStartX = e.touches[0].clientX;
        isPhotoDragging = true;
        if (photoInterval) clearInterval(photoInterval);
    });

    slideshowContainer.addEventListener('touchmove', function(e) {
        if (!isPhotoDragging) return;
        e.preventDefault();
        photoEndX = e.touches[0].clientX;
    });

    slideshowContainer.addEventListener('touchend', function(e) {
        if (!isPhotoDragging) return;
        isPhotoDragging = false;
        
        const diffX = photoStartX - photoEndX;
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                // Swipe left - next photo
                nextPhoto();
            } else {
                // Swipe right - previous photo
                prevPhoto();
            }
        }
        
        startPhotoSlideshow();
    });

    slideshowPrev.addEventListener('click', () => {
        prevPhoto();
        startPhotoSlideshow();
    });

    slideshowNext.addEventListener('click', () => {
        nextPhoto();
        startPhotoSlideshow();
    });

    // Listen for real-time updates
    db.collection('photos')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            photos = [];
            snapshot.forEach((doc) => {
                const photo = { id: doc.id, ...doc.data() };
                photos.push(photo);
            });
            
            if (photos.length > 0) {
                showPhoto(0);
                startPhotoSlideshow();
            }
        }, (error) => {
            console.error('Error listening to photos:', error);
            showNotification('Error loading photos. Please refresh.', 'error');
        });

    // Initialize with default photo
    showPhoto(0);
}

// Memory Wall Feature with Firebase
function initMemoryWall() {
    const memoryForm = document.getElementById('memoryForm');
    const memorySlideshowContent = document.getElementById('memorySlideshowContent');
    const memorySlideshowPrev = document.getElementById('memorySlideshowPrev');
    const memorySlideshowNext = document.getElementById('memorySlideshowNext');
    const memorySlideshowContainer = document.getElementById('memorySlideshowContainer');
    const totalMemoriesElement = document.getElementById('totalMemories');

    // Touch gesture variables for memory slideshow
    let memoryStartX = 0;
    let memoryEndX = 0;
    let isMemoryDragging = false;

    let memories = [];
    let currentMemory = 0;
    let memoryInterval = null;

    function showMemory(index) {
        if (memories.length === 0) {
            memorySlideshowContent.innerHTML = '<div class="memory-text">No memories yet. Be the first to share one!</div>';
            return;
        }
        currentMemory = (index + memories.length) % memories.length;
        const memory = memories[currentMemory];
        memorySlideshowContent.innerHTML = `
            <div class="memory-text">"${memory.message}"</div>
            <div class="memory-meta">${memory.name ? `- ${memory.name}` : ''} ${memory.timestamp ? `<span class="memory-date">${formatDate(memory.timestamp)}</span>` : ''}</div>
        `;
    }

    function nextMemory() {
        showMemory(currentMemory + 1);
    }
    function prevMemory() {
        showMemory(currentMemory - 1);
    }
    function startMemorySlideshow() {
        if (memoryInterval) clearInterval(memoryInterval);
        memoryInterval = setInterval(nextMemory, 5000);
    }

    // Touch gesture handlers for memory slideshow
    memorySlideshowContainer.addEventListener('touchstart', function(e) {
        memoryStartX = e.touches[0].clientX;
        isMemoryDragging = true;
        if (memoryInterval) clearInterval(memoryInterval);
    });

    memorySlideshowContainer.addEventListener('touchmove', function(e) {
        if (!isMemoryDragging) return;
        e.preventDefault();
        memoryEndX = e.touches[0].clientX;
    });

    memorySlideshowContainer.addEventListener('touchend', function(e) {
        if (!isMemoryDragging) return;
        isMemoryDragging = false;
        
        const diffX = memoryStartX - memoryEndX;
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                // Swipe left - next memory
                nextMemory();
            } else {
                // Swipe right - previous memory
                prevMemory();
            }
        }
        
        startMemorySlideshow();
    });

    memorySlideshowPrev.addEventListener('click', () => {
        prevMemory();
        startMemorySlideshow();
    });
    memorySlideshowNext.addEventListener('click', () => {
        nextMemory();
        startMemorySlideshow();
    });

    // Listen for real-time updates
    db.collection('memories')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            memories = [];
            snapshot.forEach((doc) => {
                const memory = { id: doc.id, ...doc.data() };
                memories.push(memory);
            });
            showMemory(0);
            updateMemoryStats(memories.length);
            startMemorySlideshow();
        }, (error) => {
            console.error('Error listening to memories:', error);
            memorySlideshowContent.innerHTML = '<div class="memory-text">Error loading memories. Please refresh.</div>';
        });

    memoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('memoryName').value.trim();
        const email = document.getElementById('memoryEmail').value.trim();
        const message = document.getElementById('memoryMessage').value.trim();
        if (!name || !message) return;
        const memory = {
            name: name,
            email: email,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        db.collection('memories').add(memory)
            .then(() => {
                memoryForm.reset();
                showNotification('Memory added successfully! 💝', 'success');
            })
            .catch((error) => {
                console.error('Error adding memory:', error);
                showNotification('Error adding memory. Please try again.', 'error');
            });
    });

    function updateMemoryStats(count) {
        totalMemoriesElement.textContent = count;
    }
    function formatDate(timestamp) {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Lightbox Feature
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    // Close lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });
    
    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Make lightbox globally accessible
    window.openLightbox = openLightbox;
}

// Scroll to Top Feature
function initScrollToTop() {
    const scrollToTop = document.createElement('button');
    scrollToTop.innerHTML = '↑';
    scrollToTop.className = 'scroll-to-top';
    scrollToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #3498db;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    `;

    document.body.appendChild(scrollToTop);

    // Show/hide scroll-to-top button
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTop.style.opacity = '1';
            scrollToTop.style.visibility = 'visible';
        } else {
            scrollToTop.style.opacity = '0';
            scrollToTop.style.visibility = 'hidden';
        }
    });

    // Scroll to top functionality
    scrollToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add hover effect to scroll-to-top button
    scrollToTop.addEventListener('mouseenter', () => {
        scrollToTop.style.transform = 'scale(1.1)';
        scrollToTop.style.background = '#2980b9';
    });

    scrollToTop.addEventListener('mouseleave', () => {
        scrollToTop.style.transform = 'scale(1)';
        scrollToTop.style.background = '#3498db';
    });
}

// Animation Features
function initAnimations() {
    // Add fade-in animation to sections as they come into view
    const sections = document.querySelectorAll('section');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all sections
        sections.forEach(section => {
            section.classList.add('animate-on-scroll');
            sectionObserver.observe(section);
        });

        // Observe other animated elements
        animatedElements.forEach(element => {
            sectionObserver.observe(element);
        });
    }

    // Add staggered animations to cards and items
    function animateCards() {
        const cards = document.querySelectorAll('.memory-card, .gallery-item, .candle');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-fade-in');
            }, index * 100);
        });
    }

    // Add hover animations to interactive elements
    const interactiveElements = document.querySelectorAll('.btn, .slideshow-arrow, .candle, .gallery-item');
    interactiveElements.forEach(element => {
        element.classList.add('hover-lift');
    });

    // Add glow effect to buttons
    const buttons = document.querySelectorAll('.btn-light-candle, .btn-upload, .btn-add-memory');
    buttons.forEach(button => {
        button.classList.add('btn-animated', 'hover-glow');
    });

    // Animate stats numbers
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent);
            let currentValue = 0;
            const increment = finalValue / 50;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(currentValue);
            }, 30);
        });
    }

    // Trigger animations when page loads
    setTimeout(() => {
        animateCards();
        animateStats();
    }, 500);

    // Re-trigger animations when new content is added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const newCards = mutation.target.querySelectorAll('.memory-card, .gallery-item, .candle');
                newCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-fade-in');
                    }, index * 100);
                });
            }
        });
    });

    // Observe the main content areas
    const contentAreas = document.querySelectorAll('.candle-container, .gallery-grid, .memory-slideshow-container');
    contentAreas.forEach(area => {
        observer.observe(area, { childList: true, subtree: true });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = '#27ae60';
            break;
        case 'error':
            notification.style.background = '#e74c3c';
            break;
        case 'warning':
            notification.style.background = '#f39c12';
            break;
        default:
            notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Modal logic for FABs (photo, memory, candle)
function initUploadModals() {
    // Photo upload modal
    const fabPhoto = document.getElementById('fabPhotoUpload');
    const photoModal = document.getElementById('photoUploadModal');
    const closePhoto = document.getElementById('closePhotoUploadModal');
    let photoUploadInitialized = false;
    
    if (fabPhoto && photoModal && closePhoto) {
        fabPhoto.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                photoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                if (!photoUploadInitialized) {
                    initializePhotoUpload();
                    photoUploadInitialized = true;
                }
            } catch (error) {
                console.error('Error opening photo modal:', error);
                showNotification('Error opening upload form. Please try again.', 'error');
            }
        });
        
        closePhoto.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                photoModal.style.display = 'none';
                document.body.style.overflow = '';
            } catch (error) {
                console.error('Error closing photo modal:', error);
            }
        });
        
        photoModal.addEventListener('click', (e) => {
            if (e.target === photoModal) {
                try {
                    photoModal.style.display = 'none';
                    document.body.style.overflow = '';
                } catch (error) {
                    console.error('Error closing photo modal:', error);
                }
            }
        });
    }
    
    // Memory upload modal
    const fabMemory = document.getElementById('fabMemoryUpload');
    const memoryModal = document.getElementById('memoryUploadModal');
    const closeMemory = document.getElementById('closeMemoryUploadModal');
    let memoryUploadInitialized = false;
    
    if (fabMemory && memoryModal && closeMemory) {
        fabMemory.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                memoryModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                if (!memoryUploadInitialized) {
                    initializeMemoryUpload();
                    memoryUploadInitialized = true;
                }
            } catch (error) {
                console.error('Error opening memory modal:', error);
                showNotification('Error opening memory form. Please try again.', 'error');
            }
        });
        
        closeMemory.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                memoryModal.style.display = 'none';
                document.body.style.overflow = '';
            } catch (error) {
                console.error('Error closing memory modal:', error);
            }
        });
        
        memoryModal.addEventListener('click', (e) => {
            if (e.target === memoryModal) {
                try {
                    memoryModal.style.display = 'none';
                    document.body.style.overflow = '';
                } catch (error) {
                    console.error('Error closing memory modal:', error);
                }
            }
        });
    }
    
    // Candle lighting modal
    const fabCandle = document.getElementById('fabCandleLight');
    const candleModal = document.getElementById('candleLightModal');
    const closeCandle = document.getElementById('closeCandleLightModal');
    let candleUploadInitialized = false;
    
    if (fabCandle && candleModal && closeCandle) {
        fabCandle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                candleModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                if (!candleUploadInitialized) {
                    initializeCandleUpload();
                    candleUploadInitialized = true;
                }
            } catch (error) {
                console.error('Error opening candle modal:', error);
                showNotification('Error opening candle form. Please try again.', 'error');
            }
        });
        
        closeCandle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                candleModal.style.display = 'none';
                document.body.style.overflow = '';
            } catch (error) {
                console.error('Error closing candle modal:', error);
            }
        });
        
        candleModal.addEventListener('click', (e) => {
            if (e.target === candleModal) {
                try {
                    candleModal.style.display = 'none';
                    document.body.style.overflow = '';
                } catch (error) {
                    console.error('Error closing candle modal:', error);
                }
            }
        });
    }
}

// Initialize photo upload functionality
function initializePhotoUpload() {
    const photoForm = document.getElementById('photoUploadForm');
    const photoFile = document.getElementById('photoFile');
    const uploadPreview = document.getElementById('uploadPreview');
    const removePreview = document.getElementById('removePreview');
    
    console.log('Initializing photo upload...', { photoForm, photoFile, uploadPreview, removePreview });
    
    if (photoForm && photoFile) {
        photoFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            console.log('File selected:', file);
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // Increased limit to 10MB for compression
                    showNotification('Photo must be smaller than 10MB for processing.', 'error');
                    photoFile.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    console.log('File read successfully');
                    if (uploadPreview) {
                        const previewImage = uploadPreview.querySelector('img');
                        if (previewImage) {
                            previewImage.src = e.target.result;
                        }
                        uploadPreview.style.display = 'block';
                    }
                };
                reader.onerror = function(error) {
                    console.error('Error reading file:', error);
                    showNotification('Error reading photo file. Please try again.', 'error');
                };
                reader.readAsDataURL(file);
            }
        });
        
        if (removePreview) {
            removePreview.addEventListener('click', function() {
                if (uploadPreview && photoFile) {
                    uploadPreview.style.display = 'none';
                    photoFile.value = '';
                }
            });
        }
        
        photoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Photo form submitted');
            
            const file = photoFile.files[0];
            const caption = document.getElementById('photoCaption').value.trim();
            const author = document.getElementById('photoAuthor').value.trim();
            
            console.log('Form data:', { file, caption, author });
            
            if (!file) {
                showNotification('Please select a photo to upload.', 'error');
                return;
            }
            
            if (!window.db) {
                console.error('Firebase database not available');
                showNotification('Database connection error. Please refresh the page.', 'error');
                return;
            }
            
            const submitBtn = photoForm.querySelector('.btn-upload');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            // Compress and resize image before upload
            compressAndResizeImage(file, 1024, 0.8, function(compressedDataUrl) {
                if (!compressedDataUrl) {
                    showNotification('Failed to process image. Please try a smaller image.', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                console.log('Image compressed successfully');
                const photo = {
                    src: compressedDataUrl,
                    caption: caption,
                    author: author,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    fileName: file.name,
                    fileSize: file.size
                };
                
                console.log('Photo object created:', photo);
                
                db.collection('photos').add(photo)
                    .then((docRef) => {
                        console.log('Photo uploaded successfully with ID:', docRef.id);
                        photoForm.reset();
                        if (uploadPreview) uploadPreview.style.display = 'none';
                        showNotification('Photo uploaded successfully! 📸', 'success');
                    })
                    .catch((error) => {
                        console.error('Error uploading photo:', error);
                        showNotification(`Error uploading photo: ${error.message}`, 'error');
                    })
                    .finally(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
            });
        });
    } else {
        console.error('Photo form elements not found:', { photoForm, photoFile });
    }
}

// Image compression and resizing function
function compressAndResizeImage(file, maxWidth, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to data URL with compression
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Check if compressed size is reasonable (under 1MB)
            const base64Length = compressedDataUrl.length;
            const sizeInBytes = Math.ceil((base64Length * 3) / 4);
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            console.log(`Original size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
            console.log(`Compressed size: ${sizeInMB.toFixed(2)}MB`);
            
            if (sizeInMB > 1) {
                // Try with lower quality
                const lowerQuality = quality * 0.7;
                if (lowerQuality > 0.3) {
                    console.log(`Trying with lower quality: ${lowerQuality}`);
                    compressAndResizeImage(file, maxWidth, lowerQuality, callback);
                    return;
                } else {
                    console.error('Image too large even after compression');
                    callback(null);
                    return;
                }
            }
            
            callback(compressedDataUrl);
        };
        
        img.onerror = function() {
            console.error('Error loading image for compression');
            callback(null);
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        console.error('Error reading file for compression');
        callback(null);
    };
    
    reader.readAsDataURL(file);
}

// Initialize memory upload functionality
function initializeMemoryUpload() {
    const memoryForm = document.getElementById('memoryForm');
    if (memoryForm) {
        memoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('memoryName').value.trim();
            const email = document.getElementById('memoryEmail').value.trim();
            const message = document.getElementById('memoryMessage').value.trim();
            
            if (!name || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            const submitBtn = memoryForm.querySelector('.btn-add-memory');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;
            
            const memory = {
                name: name,
                email: email,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            db.collection('memories').add(memory)
                .then(() => {
                    memoryForm.reset();
                    showNotification('Memory shared successfully! 💝', 'success');
                })
                .catch((error) => {
                    console.error('Error adding memory:', error);
                    showNotification('Error sharing memory. Please try again.', 'error');
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
}

// Initialize candle upload functionality
function initializeCandleUpload() {
    const candleForm = document.getElementById('candleForm');
    console.log('Initializing candle upload...', { candleForm });
    
    if (candleForm) {
        // Remove any existing event listeners to prevent duplicates
        const newForm = candleForm.cloneNode(true);
        candleForm.parentNode.replaceChild(newForm, candleForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Candle form submitted');
            
            const name = document.getElementById('candleName').value.trim();
            const message = document.getElementById('candleMessage').value.trim();
            
            console.log('Candle form data:', { name, message });
            
            if (!name) {
                showNotification('Please enter your name.', 'error');
                return;
            }
            
            if (!window.db) {
                console.error('Firebase database not available');
                showNotification('Database connection error. Please refresh the page.', 'error');
                return;
            }
            
            const submitBtn = newForm.querySelector('.btn-light-candle');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lighting...';
            submitBtn.disabled = true;
            
            const candle = {
                name: name,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            console.log('Candle object created:', candle);
            
            db.collection('candles').add(candle)
                .then((docRef) => {
                    console.log('Candle lit successfully with ID:', docRef.id);
                    newForm.reset();
                    showNotification('Candle lit successfully! 🕯️', 'success');
                })
                .catch((error) => {
                    console.error('Error adding candle:', error);
                    showNotification(`Error lighting candle: ${error.message}`, 'error');
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    } else {
        console.error('Candle form not found');
    }
}

// Update slideshow caption rendering
function updateSlideshowCaption(photo) {
  const captionDiv = document.getElementById('slideshowCaption');
  captionDiv.innerHTML =
    `<span>${photo.caption ? photo.caption : ''}</span>` +
    (photo.author ? `<span class="caption-author">${photo.author}</span>` : '');
}

// Language switcher functionality
function initLanguageSwitcher() {
    console.log('Initializing language switcher...');
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Found language buttons:', langButtons.length);
    
    if (langButtons.length === 0) {
        console.error('No language buttons found!');
        return;
    }
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            console.log('Language button clicked:', lang);
            if (lang !== currentLanguage) {
                switchLanguage(lang);
            }
        });
    });
    
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
        switchLanguage(savedLang);
    }
    
    console.log('Language switcher initialized successfully');
}

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update HTML lang attribute
    document.getElementById('htmlElement').setAttribute('lang', lang);
    
    // Update language button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translatable elements
    updatePageContent(lang);
    
    // Save preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Show notification
    const langName = lang === 'hi' ? 'हिंदी' : 'English';
    showNotification(`Language changed to ${langName}`, 'info');
}

function updatePageContent(lang) {
    // Update title
    const titleElement = document.querySelector('title');
    if (titleElement) {
        const newTitle = titleElement.getAttribute(`data-${lang}`) || titleElement.textContent;
        titleElement.textContent = newTitle;
    }
    
    // Update all elements with data attributes
    const translatableElements = document.querySelectorAll('[data-en][data-hi]');
    translatableElements.forEach(element => {
        const newText = element.getAttribute(`data-${lang}`);
        if (newText) {
            element.textContent = newText;
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-en-placeholder][data-hi-placeholder]');
    placeholderElements.forEach(element => {
        const newPlaceholder = element.getAttribute(`data-${lang}-placeholder`);
        if (newPlaceholder) {
            element.placeholder = newPlaceholder;
        }
    });
    
    // Update button text content (for buttons with spans)
    const buttonSpans = document.querySelectorAll('button span[data-en][data-hi]');
    buttonSpans.forEach(span => {
        const newText = span.getAttribute(`data-${lang}`);
        if (newText) {
            span.textContent = newText;
        }
    });
    
    // Update label text content
    const labelSpans = document.querySelectorAll('label span[data-en][data-hi]');
    labelSpans.forEach(span => {
        const newText = span.getAttribute(`data-${lang}`);
        if (newText) {
            span.textContent = newText;
        }
    });
}
