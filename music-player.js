// Initialize when DOM is ready (supports dynamic injection)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
} else {
    initMusicPlayer();
}

const songs = [
    {
        title: "Chill Vibe & Reading",
        artist: "Lofi Beats",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    },
    {
        title: "Deep Focus Flow",
        artist: "Ambient Study",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    },
    {
        title: "Morning Coffee",
        artist: "Acoustic Relax",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        cover: "https://images.unsplash.com/photo-1518531933037-91b2f5d2294c?q=80&w=300&auto=format&fit=crop"
    }
];

// State Persistence Key
const PLAYER_STORAGE_KEY = 'nice_fornung_music_state';

let currentSongIndex = 0;
let isPlaying = false;
let audio = new Audio();
audio.volume = 0.5; // Default volume

function initMusicPlayer() {
    // Inject HTML Structure
    if (document.getElementById('music-player-container')) return; // Avoid duplicate injection

    const playerContainer = document.createElement('div');
    playerContainer.id = 'music-player-container';
    playerContainer.innerHTML = `
        <button class="music-toggle" id="music-toggle">
            <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </button>
        <div class="music-card" id="music-card">
            <div class="music-cover">
                <img src="${songs[0].cover}" id="cover-img" alt="Cover">
            </div>
            <div class="music-info">
                <div class="music-title" id="music-title">${songs[0].title}</div>
                <div class="music-artist" id="music-artist">${songs[0].artist}</div>
            </div>
            
            <div class="music-controls">
                <button class="ctrl-btn" id="prev-btn">⏮</button>
                <button class="ctrl-btn play-pause" id="play-btn">▶</button>
                <button class="ctrl-btn" id="next-btn">⏭</button>
            </div>

            <!-- Volume Control -->
            <div class="volume-container">
                <svg class="volume-icon" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                <input type="range" class="volume-slider" id="volume-slider" min="0" max="1" step="0.05" value="0.5">
            </div>

            <div class="music-progress" id="progress-container">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="time-info">
                <span id="curr-time">0:00</span>
                <span id="dur-time">0:00</span>
            </div>
            
            <!-- YouTube Search -->
            <div class="youtube-search-container">
                <input type="text" 
                       id="youtube-search-input" 
                       class="youtube-search-input" 
                       placeholder="🔍 ค้นหาเพลงบน YouTube..."
                       onkeypress="if(event.key==='Enter') searchYouTube()">
                <button class="youtube-search-btn" onclick="searchYouTube()">
                    ค้นหา
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(playerContainer);

    // Load External CSS if not present
    if (!document.querySelector('link[href="music-player.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'music-player.css';
        document.head.appendChild(link);
    }

    // Elements
    const musicCard = document.getElementById('music-card');
    const toggleBtn = document.getElementById('music-toggle');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const volumeSlider = document.getElementById('volume-slider');

    // Restore State
    const savedState = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY));
    if (savedState) {
        currentSongIndex = savedState.index || 0;
        audio.currentTime = savedState.currentTime || 0;

        // Restore Volume
        if (savedState.volume !== undefined) {
            audio.volume = savedState.volume;
            volumeSlider.value = savedState.volume;
        }

        if (savedState.isPlaying) {
            isPlaying = true;
        }

        // Try load logic
        loadSong(songs[currentSongIndex]);

        // Check for blob URL from previous session (unlikely to work, but good to clean up logic)
        if (audio.src.startsWith('blob:')) {
            currentSongIndex = 0;
            loadSong(songs[0]);
            isPlaying = false;
        } else {
            audio.currentTime = savedState.currentTime || 0;
            if (isPlaying) {
                playSong().catch(() => {
                    isPlaying = false;
                    updateUI();
                });
            }
        }
    } else {
        loadSong(songs[currentSongIndex]);
    }

    // Toggle Player
    toggleBtn.addEventListener('click', () => {
        musicCard.classList.toggle('active');
        toggleBtn.classList.toggle('open');
    });

    // Play/Pause
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    // Navigation
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);

    // Volume Control
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
        saveState();
    });

    // Audio Events
    audio.addEventListener('timeupdate', (e) => {
        updateProgress(e);
        if (Math.floor(audio.currentTime) % 2 === 0) saveState();
    });
    audio.addEventListener('ended', nextSong);
    audio.addEventListener('play', () => { isPlaying = true; updateUI(); saveState(); });
    audio.addEventListener('pause', () => { isPlaying = false; updateUI(); saveState(); });
    audio.addEventListener('error', (e) => {
        console.error("Music Player Error:", e);
        isPlaying = false;
        updateUI();
    });

    // Click on Progress Bar
    progressContainer.addEventListener('click', setProgress);

    // --- Helper Functions ---

    function saveState() {
        if (audio.src.startsWith('blob:')) return;

        const state = {
            index: currentSongIndex,
            currentTime: audio.currentTime,
            isPlaying: isPlaying,
            volume: audio.volume,
            timestamp: Date.now()
        };
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state));
    }

    function loadSong(song) {
        document.getElementById('music-title').textContent = song.title;
        document.getElementById('music-artist').textContent = song.artist;
        document.getElementById('cover-img').src = song.cover;

        const currentSrc = audio.src;
        if (currentSrc !== song.url) {
            audio.src = song.url;
        }
    }

    async function playSong() {
        isPlaying = true;
        updateUI();
        try {
            await audio.play();
        } catch (e) {
            console.log('Playback prevented by browser policy:', e);
        }
    }

    function pauseSong() {
        isPlaying = false;
        updateUI();
        audio.pause();
    }

    function updateUI() {
        if (isPlaying) {
            musicCard.classList.add('playing');
            toggleBtn.classList.add('playing');
            playBtn.innerHTML = '⏸';
        } else {
            musicCard.classList.remove('playing');
            toggleBtn.classList.remove('playing');
            playBtn.innerHTML = '▶';
        }
    }

    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        loadSong(songs[currentSongIndex]);
        playSong();
    }

    function nextSong() {
        currentSongIndex++;
        if (currentSongIndex > songs.length - 1) {
            currentSongIndex = 0;
        }
        loadSong(songs[currentSongIndex]);
        playSong();
    }

    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        if (!duration) return;

        const progressPercent = (currentTime / duration) * 100;
        progressFill.style.width = `${progressPercent}%`;

        const currTimeEl = document.getElementById('curr-time');
        const durTimeEl = document.getElementById('dur-time');

        currTimeEl.textContent = formatTime(currentTime);
        if (duration) durTimeEl.textContent = formatTime(duration);
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
        saveState();
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }
}

// YouTube Search Function (global scope for onclick)
function searchYouTube() {
    const searchInput = document.getElementById('youtube-search-input');
    const query = searchInput.value.trim();

    if (query) {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        window.open(searchUrl, '_blank');
        searchInput.value = ''; // Clear input after search
    }
}
