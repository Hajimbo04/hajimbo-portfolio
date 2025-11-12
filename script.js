// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // ======================= //
    //     THEME TOGGLE        //
    // ======================= //
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Toggle the 'light-mode' class on the body
            document.body.classList.toggle('light-mode');

            // Update the button text
            if (document.body.classList.contains('light-mode')) {
                themeToggleBtn.textContent = 'Dark Mode';
            } else {
                themeToggleBtn.textContent = 'Light Mode';
            }
        });
    }


    // ======================= //
    //   SIMPLE CAROUSEL LOGIC   //
    // ======================= //
    const track = document.querySelector('.carousel-track');
    
    if (track) {
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const cards = Array.from(track.children);
        
        let cardWidth = cards[0].getBoundingClientRect().width;
        let slidesVisible = 3; // Default to 3
        
        const updateCarouselSizing = () => {
            cardWidth = cards[0].getBoundingClientRect().width;
            slidesVisible = Math.max(1, Math.floor(track.parentElement.clientWidth / cardWidth));
        };
        
        updateCarouselSizing(); // Initial call
        
        let currentIndex = 0;

        // Function to move the carousel
        const moveToSlide = (targetIndex) => {
            const maxIndex = cards.length - slidesVisible;
            if (targetIndex < 0) {
                targetIndex = 0;
            } else if (targetIndex > maxIndex) { 
                targetIndex = maxIndex;
            }

            track.style.transform = 'translateX(-' + (cardWidth * targetIndex) + 'px)';
            currentIndex = targetIndex;
        };

        // Next button click
        nextBtn.addEventListener('click', () => {
            moveToSlide(currentIndex + 1);
        });

        // Previous button click
        prevBtn.addEventListener('click', () => {
            moveToSlide(currentIndex - 1);
        });

        // Recalculate on resize
        window.addEventListener('resize', () => {
            updateCarouselSizing();
            moveToSlide(currentIndex); // Adjust to current index
        });
    }


    // ======================= //
    // NEW: CARD HOVER PREVIEW //
    // ======================= //
    
    // Get all project cards on the page
    const allProjectCards = document.querySelectorAll('.project-card');
    let hoverTimer = null; // A single timer variable to manage the delay

    allProjectCards.forEach(card => {
        const video = card.querySelector('video');
        
        // If the card doesn't have a video, do nothing
        if (!video) {
            return; 
        }

        card.addEventListener('mouseenter', () => {
            // Start a timer for 2 seconds (2000ms)
            hoverTimer = setTimeout(() => {
                video.play()
                    .catch(e => {
                        // This catch is important to prevent console errors
                        // if the video is interrupted or can't play
                    });
            }, 2000); // 2-second delay
        });

        card.addEventListener('mouseleave', () => {
            // 1. Clear the timer if it hasn't fired yet
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            
            // 2. Pause the video and reset it to the beginning
            video.pause();
            video.currentTime = 0;
        });
    });


    // ======================= //
    //   PROJECT MODAL LOGIC   //
    // ======================= //
    
    // Get modal elements
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalMedia = document.getElementById('modal-media');
    const modalDescription = document.getElementById('modal-description');
    const modalTags = document.getElementById('modal-tags');
    const modalDetailsLink = document.getElementById('modal-details-link');
    
    // Get all project cards on the page (works for index.html and projects.html)
    const projectCards = document.querySelectorAll('.project-card');

    // A helper function to create tag elements
    function createTagSpan(tagText) {
        const span = document.createElement('span');
        span.textContent = tagText;

        // Add correct class based on tag text
        const tagLower = tagText.toLowerCase();
        if (tagLower.includes('programmer') || tagLower.includes('developer')) {
            span.className = 'tag-prog';
        } else if (tagLower.includes('manager')) {
            span.className = 'tag-pm';
        } else if (tagLower.includes('artist')) {
            span.className = 'tag-art';
        } else if (tagLower.includes('design')) {
            span.className = 'tag-design';
        } else if (tagLower.includes('java')) {
            span.className = 'tag-java';
        } else if (tagLower.includes('backend')) {
            span.className = 'tag-web';
        } else {
            span.className = 'tag-default'; // Fallback
        }
        return span;
    }

    // Add click event to each project card
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            // 1. Get data from the card's data-attributes
            const title = card.dataset.title;
            const mediaSrc = card.dataset.media;
            const description = card.dataset.description;
            const tags = card.dataset.tags.split(','); // Split string into an array
            const detailsPage = card.dataset.detailsPage;

            // 2. Populate the modal
            modalTitle.textContent = `[ ${title}.exe ]`;
            modalDescription.textContent = description;
            modalDetailsLink.href = detailsPage;

            // Populate media (check if it's a video or image)
            if (mediaSrc && (mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.webm'))) {
                modalMedia.innerHTML = `<video src="${mediaSrc}" autoplay loop muted playsinline controls></video>`;
            } else {
                // Fallback for images (like your placeholder)
                modalMedia.innerHTML = `<img src="${mediaSrc}" alt="${title} media">`;
            }

            // Populate tags
            modalTags.innerHTML = ''; // Clear any old tags
            tags.forEach(tagText => {
                modalTags.appendChild(createTagSpan(tagText));
            });
            
            // 3. Show the modal
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    });

    // Add close logic
    if (modal) {
        // Close when clicking the 'X' button
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
            modalMedia.innerHTML = ''; // Stop video playback
        });

        // Close when clicking *outside* the modal window
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Check if the click is on the overlay itself
                modal.style.display = 'none';
                modalMedia.innerHTML = ''; // Stop video playback
            }
        });
    }

    // ======================= //
    //  NEW: PROJECT FILTER LOGIC  //
    // ======================= //

    const filterButtonsContainer = document.querySelector('.filter-buttons');
    
    // Only run this code if we find filter buttons on the page
    if (filterButtonsContainer) {
        const filterButtons = filterButtonsContainer.querySelectorAll('.filter-btn');
        const projectGridCards = document.querySelectorAll('.project-grid .project-card');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterValue = btn.dataset.filter;
                
                // 1. Update active button state
                filterButtons.forEach(button => button.classList.remove('active'));
                btn.classList.add('active');

                // 2. Filter the cards
                projectGridCards.forEach(card => {
                    const cardCategory = card.dataset.category;
                    
                    if (filterValue === 'all' || filterValue === cardCategory) {
                        card.style.display = 'block'; // Show card
                    } else {
                        card.style.display = 'none'; // Hide card
                    }
                });
            });
        });
    }

});