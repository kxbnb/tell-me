document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('travel-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const resultsSection = document.getElementById('results');
    const scriptText = document.getElementById('script-text');
    const audioPlayer = document.getElementById('audio-player');
    const resetBtn = document.getElementById('reset-btn');
    const locationInput = document.getElementById('location');

    const locateBtn = document.getElementById('locate-icon');

    // Geolocation Logic
    async function startGeolocation() {
        if (!("geolocation" in navigator)) {
            console.log("Geolocation not supported");
            return;
        }

        locationInput.placeholder = "Locating you...";

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                // Prioritize city, town, village, or display_name
                const placeName = data.address.city || data.address.town || data.address.village || data.address.hamlet || data.name;
                if (placeName) {
                    locationInput.value = placeName;
                    locationInput.placeholder = ""; // Restore/Clear placeholder
                }
            } catch (error) {
                console.error("Error fetching location name:", error);
                locationInput.placeholder = "";
                // Only alert if it's a manual click (we can check placeholder or passed arg, 
                // but checking placeholder "Locating you..." is a proxy or we can just fail silently for address lookup 
                // and let the coordinate fill happen if we want, but here we only fill if we get a name)
            }
        }, (error) => {
            console.log("Geolocation error:", error);
            locationInput.placeholder = "";
            alert("Could not locate you. Please check your permissions or enter location manually.");
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    }

    // Run on load
    startGeolocation();

    // Run on click
    locateBtn.addEventListener('click', () => {
        // Clear current value if any to show we are re-locating
        locationInput.value = '';
        startGeolocation();
    });

    // Travel Mode Checkbox Logic (Mutual Exclusivity)
    const modeWalking = document.getElementById('mode-walking');
    const modeCar = document.getElementById('mode-car');

    function handleModeChange(changedCheckbox, otherCheckbox) {
        if (changedCheckbox.checked) {
            otherCheckbox.checked = false;
        }
    }

    modeWalking.addEventListener('change', () => handleModeChange(modeWalking, modeCar));
    modeCar.addEventListener('change', () => handleModeChange(modeCar, modeWalking));

    // Suggestions Logic
    const headedTowardsInput = document.getElementById('headed-towards');
    const suggestionsList = document.getElementById('suggestions-list');

    headedTowardsInput.addEventListener('focus', async () => {
        const locationVal = locationInput.value;
        if (!locationVal) return;

        // Debounce or just check if we already have suggestions? 
        // For simplicity, fetch fresh or show generic loader. 
        // Ideally we might want to suggest based on the location.

        suggestionsList.classList.remove('hidden');
        suggestionsList.innerHTML = '<li style="cursor: default;">Loading suggestions...</li>';

        try {
            const response = await fetch('/api/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: locationVal })
            });

            const data = await response.json();
            const suggestions = data.suggestions || [];

            suggestionsList.innerHTML = ''; // Clear loader

            if (suggestions.length === 0) {
                suggestionsList.innerHTML = '<li style="cursor: default;">No suggestions found</li>';
                return;
            }

            suggestions.forEach(place => {
                const li = document.createElement('li');
                li.textContent = place;
                li.addEventListener('click', () => {
                    headedTowardsInput.value = place;
                    suggestionsList.classList.add('hidden');
                });
                li.addEventListener('mousedown', (e) => e.preventDefault()); // Prevent blur before click
                suggestionsList.appendChild(li);
            });

        } catch (e) {
            console.error(e);
            suggestionsList.innerHTML = '<li style="cursor: default;">Error loading suggestions</li>';
        }
    });

    // Hide suggestions on blur (delayed to allow click)
    headedTowardsInput.addEventListener('blur', () => {
        // Small delay to allow click event to register
        setTimeout(() => {
            suggestionsList.classList.add('hidden');
        }, 200);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const location = formData.get('location');
        const headedTowards = formData.get('headed_towards');
        const interests = formData.getAll('interests');

        // Get travel mode manually since checkboxes might behave differently with FormData
        let travelMode = null;
        if (modeWalking.checked) travelMode = 'Walking';
        if (modeCar.checked) travelMode = 'Car';

        // UI Loading State
        setLoading(true);
        resultsSection.classList.add('hidden');
        audioPlayer.pause();
        audioPlayer.currentTime = 0;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: location,
                    headed_towards: headedTowards || null,
                    travel_mode: travelMode,
                    interests: interests
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate story');
            }

            const data = await response.json();

            // Display Results
            scriptText.textContent = data.script;
            audioPlayer.src = data.audio_url;

            // Show results section
            resultsSection.classList.remove('hidden');

            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });

            // Auto-play audio (optional, browsers might block)
            audioPlayer.play().catch(e => console.log("Auto-play blocked", e));

        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    resetBtn.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        form.reset();
        resultsSection.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Generating...';
            loader.classList.remove('hidden');
        } else {
            btnText.textContent = 'Tell Me';
            loader.classList.add('hidden');
        }
    }
});
