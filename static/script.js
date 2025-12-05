document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('travel-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const resultsSection = document.getElementById('results');
    const scriptText = document.getElementById('script-text');
    const audioPlayer = document.getElementById('audio-player');
    const resetBtn = document.getElementById('reset-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const location = formData.get('location');
        const headedTowards = formData.get('headed_towards');
        const interests = formData.getAll('interests');

        // UI Loading State
        setLoading(true);
        resultsSection.classList.add('hidden');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: location,
                    headed_towards: headedTowards || null,
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
            // audioPlayer.play().catch(e => console.log("Auto-play blocked"));

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
