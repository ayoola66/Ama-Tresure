// ====================================
// LOADING SCREEN INITIALIZATION
// ====================================
const LOADING_DURATION = 3000; // 3 seconds (reduced for faster start)
let loadingComplete = false;

// Initialize loading screen
function initializeLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  const countdownTimer = document.getElementById("countdownTimer");
  let remainingTime = LOADING_DURATION / 1000; // 3 seconds

  console.log("🎬 [LOADING SCREEN] Initializing loading screen...");

  // Set up loading screen close functionality
  const closeLoading = () => {
    if (
      loadingComplete ||
      Date.now() - loadingStartTime >= LOADING_DURATION
    ) {
      console.log("🎬 [LOADING SCREEN] Closing loading screen...");
      loadingScreen.classList.add("hidden");
    }
  };

  // Close on click - INITIALIZE AUDIO HERE
  loadingScreen.addEventListener("click", () => {
    console.log(
      "🖱️  [LOADING SCREEN] Click detected - initializing audio context"
    );

    // Initialize audio context on first user interaction
    try {
      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach((audio, index) => {
        console.log(
          `🔊 [CLICK INIT] Attempting audio context init for: ${audio.id}`
        );
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(
                `✅ [CLICK INIT] Audio context initialized for: ${audio.id}`
              );
              audio.pause();
              audio.currentTime = 0;
            })
            .catch((error) => {
              console.log(
                `⚠️  [CLICK INIT] Audio context init failed for ${audio.id}: ${error.message}`
              );
            });
        }
      });
    } catch (e) {
      console.log(
        `❌ [CLICK INIT] Error initializing audio context:`,
        e.message
      );
    }

    closeLoading();
  });

  // Auto-close after 3 seconds
  loadingStartTime = Date.now();
  // Set initial countdown value
  countdownTimer.textContent = remainingTime;
  // Update countdown every second
  const countdownInterval = setInterval(() => {
    remainingTime--;
    if (countdownTimer) {
      countdownTimer.textContent = Math.max(0, remainingTime);
    }

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  const autoCloseTimer = setInterval(() => {
    if (Date.now() - loadingStartTime >= LOADING_DURATION) {
      clearInterval(autoCloseTimer);
      clearInterval(countdownInterval);
      loadingComplete = true;
      closeLoading();
    }
  }, 100);
}

let loadingStartTime = Date.now();

// Preload all audio and images
function preloadGameAssets() {
  console.log("🎮 [PRELOAD START] Initializing game asset preload...");

  // Preload audio elements
  const audioElements = document.querySelectorAll("audio");
  console.log(
    `🎵 [AUDIO] Found ${audioElements.length} audio elements to preload`
  );

  audioElements.forEach((audio, index) => {
    audio.preload = "auto";
    audio.volume = 0.7;
    console.log(
      `🎵 [AUDIO ${index}] Setting up: ${audio.id} (src: ${audio.src})`
    );
  });

  // Preload background images
  const backgroundImages = [
    "data/background/mermaid-background-1.png",
    "data/background/runMan-background-1.png",
    "data/background/fish-background-1.png",
    "data/background/redCar-background-1.png",
    "data/background/horse-background-1.png",
    "data/background/surfing-background-1.png",
  ];

  console.log(
    `🖼️  [IMAGES] Preloading ${backgroundImages.length} background images`
  );
  backgroundImages.forEach((src, index) => {
    const img = new Image();
    img.src = src;
    console.log(`🖼️  [IMAGE ${index}] Preloading: ${src}`);
  });

  console.log(
    "✅ [PRELOAD COMPLETE] Game assets preloading initiated..."
  );
}

// Game Elements
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const treasure = document.getElementById("treasure");
const gameover = document.getElementById("gameover");
const startscreen = document.getElementById("startscreen");
const achievement = document.getElementById("achievement");
const gameContainer = document.getElementById("game");
const powerUpStatus = document.getElementById("powerUpStatus");
const gameTitle = document.querySelector(".game-title");
const orientationOverlay = document.getElementById("orientationOverlay");
const forceFullscreenBtn = document.getElementById("forceFullscreenBtn");
const orientationMediaQuery = window.matchMedia
  ? window.matchMedia("(orientation: portrait)")
  : null;
let fullscreenRequested = false;

// Game State
let obstacles = [];
let powerUps = [];
let mode = 1;
let player1Name = "Player 1";
let player2Name = "Player 2";
let p1Score = 0,
  p2Score = 0;
let p1Lives = 2,
  p2Lives = 2;
let p1Alive = true, // Track if player 1 is still in the game
  p2Alive = true; // Track if player 2 is still in the game
let timeLeft = 40;
let level = 1;
let timer;
let p1X = 100,
  p1Y = 100;
let p2X = 200,
  p2Y = 200;
const moveStep = 15; // Reduced from 20 to 15 for child-friendly gameplay (25% slower)
let highScore = localStorage.getItem("treasureHighScore") || 0;

// Collision tracking to prevent multiple hits within short time
let lastCollisionTime = {
  player1: { global: 0 },
  player2: { global: 0 },
};
const COLLISION_COOLDOWN = 1000; // 1 second between any hits

// Collision sensitivity settings - buffer reduces effective hitbox size
// Higher buffer = objects must be closer to register collision
const COLLISION_BUFFER = {
  obstacle: 22, // Obstacles require 22px closer contact for fair gameplay
  treasure: 0, // No buffer for treasures - instant collection when visually touching (works for all characters)
  powerup: 12, // Power-ups moderate difficulty
};

function isTouchLayout() {
  return Boolean(window.isTouchDevice);
}

function isGameActive() {
  return startscreen && startscreen.style.display === "none";
}

function requestFullscreenForGame(force = false) {
  if (!isTouchLayout()) return;
  const container = document.getElementById("game-container") || document.body;
  const fullscreenElement =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;

  if (fullscreenElement && !force) {
    return;
  }

  const request =
    container.requestFullscreen ||
    container.webkitRequestFullscreen ||
    container.msRequestFullscreen;

  if (typeof request === "function") {
    try {
      const maybePromise = request.call(container);
      fullscreenRequested = true;
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch((err) => {
          console.warn("Fullscreen request was blocked:", err.message);
          fullscreenRequested = false;
        });
      }
    } catch (error) {
      console.warn("Could not request fullscreen:", error.message);
      fullscreenRequested = false;
    }
  }
}

function updateOrientationLock() {
  if (!orientationOverlay) return;

  const portrait = orientationMediaQuery
    ? orientationMediaQuery.matches
    : window.innerHeight > window.innerWidth;
  const shouldShow = isTouchLayout() && portrait && isGameActive();

  if (shouldShow) {
    document.body.classList.add("portrait-lock");
    orientationOverlay.style.display = "flex";
    orientationOverlay.setAttribute("aria-hidden", "false");
  } else {
    document.body.classList.remove("portrait-lock");
    orientationOverlay.style.display = "none";
    orientationOverlay.setAttribute("aria-hidden", "true");
  }
}

const orientationChangeHandler = () => updateOrientationLock();

if (orientationMediaQuery) {
  if (orientationMediaQuery.addEventListener) {
    orientationMediaQuery.addEventListener("change", orientationChangeHandler);
  } else if (orientationMediaQuery.addListener) {
    orientationMediaQuery.addListener(orientationChangeHandler);
  }
}

window.addEventListener("resize", orientationChangeHandler);
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullscreenRequested = false;
    updateOrientationLock();
  }
});

if (forceFullscreenBtn) {
  forceFullscreenBtn.addEventListener("click", () => requestFullscreenForGame(true));
}

// Debug Logging System (using external logger)
const MAX_DEBUG_ENTRIES = 200; // Increased to track longer games up to level 20+

function updateDebugPanel() {
  const logContainer = document.getElementById("debugLog");
  const statsContainer = document.getElementById("debugStats");

  if (!logContainer || !statsContainer) return;

  // Update stats
  const maxScore = Math.max(p1Score, mode === 2 ? p2Score : 0);
  const nextLevelPoints = getPointsForLevel(level + 1);
  const pointsToNextLevel = nextLevelPoints - maxScore;
  statsContainer.innerHTML = `
    <strong>P1:</strong> ${p1Score.toFixed(1)} pts, ${p1Lives} lives<br>
    ${
      mode === 2
        ? `<strong>P2:</strong> ${p2Score.toFixed(
            1
          )} pts, ${p2Lives} lives<br>`
        : ""
    }
    <strong>Level:</strong> ${level} | <strong>Next Level:</strong> ${nextLevelPoints} pts (${pointsToNextLevel.toFixed(
    1
  )} away)<br>
    <strong>Time:</strong> ${timeLeft}s | <strong>Obstacles:</strong> ${
    obstacles.length
  }
  `;

  // Get recent logs from external logger
  const recentLogs = gameLogger.getRecentLogs(MAX_DEBUG_ENTRIES);

  // Update log display
  logContainer.innerHTML = recentLogs
    .map((entry) => {
      let className = "debug-log-entry";
      if (entry.type === "treasure") className += " log-treasure";
      else if (entry.type === "level") className += " log-level";
      else if (entry.type === "collision") className += " log-collision";
      else if (entry.type === "power") className += " log-power";

      return `<div class="${className}"><span class="log-time">[${entry.time}]</span> ${entry.message}</div>`;
    })
    .join("");
}

// Toggle debug panel
function toggleDebugPanel() {
  const panel = document.getElementById("debugPanel");
  panel.classList.toggle("visible");
}

// Leaderboard System
class LeaderboardManager {
  constructor() {
    this.storageKey = "treasureLeaderboard";
    this.maxEntries = 10;
  }

  // Get current leaderboard from localStorage
  getLeaderboard() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Save leaderboard to localStorage
  saveLeaderboard(leaderboard) {
    localStorage.setItem(this.storageKey, JSON.stringify(leaderboard));
  }

  // Add new score and return position (1-based, 0 if not in top 10)
  addScore(playerName, score) {
    const leaderboard = this.getLeaderboard();
    const timestamp = new Date().toISOString();

    const newEntry = {
      name: playerName,
      score: score,
      date: timestamp,
      id: Date.now() + Math.random(), // Unique ID for animations
    };

    // Find insertion position
    let insertPosition = leaderboard.length;
    for (let i = 0; i < leaderboard.length; i++) {
      if (score > leaderboard[i].score) {
        insertPosition = i;
        break;
      }
    }

    // Insert new entry
    leaderboard.splice(insertPosition, 0, newEntry);

    // Keep only top 10
    if (leaderboard.length > this.maxEntries) {
      leaderboard.splice(this.maxEntries);
    }

    this.saveLeaderboard(leaderboard);

    // Return position (1-based) or 0 if not in top 10
    const finalPosition = leaderboard.findIndex(
      (entry) => entry.id === newEntry.id
    );
    return finalPosition >= 0 ? finalPosition + 1 : 0;
  }

  // Get formatted leaderboard for display
  getFormattedLeaderboard() {
    return this.getLeaderboard().map((entry, index) => ({
      position: index + 1,
      name: entry.name,
      score: entry.score,
      date: new Date(entry.date).toLocaleDateString(),
      id: entry.id,
    }));
  }

  // Clear leaderboard (for testing)
  clearLeaderboard() {
    localStorage.removeItem(this.storageKey);
  }
}

// Initialize leaderboard manager
const leaderboard = new LeaderboardManager();

// Character selection and facing direction
let selectedP1Character = "MERMAID";
let selectedP2Character = "RUNNER";
let p1FacingLeft = false;
let p2FacingLeft = false;

// Power-up system
let activePowerUps = {
  player1: null,
  player2: null,
};

// Audio System using HTML5 Audio Elements
let musicVolume = 0.5;
let fxVolume = 0.7;
let isMuted = false;
let isPlaying = false;

// Audio elements - lazy-loaded to ensure DOM is ready
function getAudioElement(id) {
  return document.getElementById(id);
}
const backgroundMusic = () => getAudioElement("backgroundMusic");
const treasureSound = () => getAudioElement("treasureSound");
const powerupSound = () => getAudioElement("powerupSound");
const obstacleSound = () => getAudioElement("obstacleSound");
const achievementSound = () => getAudioElement("achievementSound");
const gameoverSound = () => getAudioElement("gameoverSound");
const menuClickSound = () => getAudioElement("menuClickSound");

// Character options for players - Directional characters with clear left/right facing
// Each character now has its own themed background image
const characterOptions = {
  MERMAID: {
    emoji: "🧜‍♀️",
    name: "Mermaid",
    background: "data/background/mermaid-background-1.png",
    needsFlip: false,
  },
  RUNNER: {
    emoji: "🏃‍♂️",
    name: "Runner",
    background: "data/background/runMan-background-1.png",
    needsFlip: true,
  },
  FISH: {
    emoji: "🐟",
    name: "Fish",
    background: "data/background/fish-background-1.png",
    needsFlip: true,
  },
  CAR: {
    emoji: "🚗",
    name: "Car",
    background: "data/background/redCar-background-1.png",
    needsFlip: true, // Fixed: Car now flips left/right like other characters
  },
  HORSE: {
    emoji: "🐎",
    name: "Horse",
    background: "data/background/horse-background-1.png",
    needsFlip: true,
  },
  SURFER: {
    emoji: "🏄‍♂️",
    name: "Surfer",
    background: "data/background/surfing-background-1.png",
    needsFlip: false,
  },
};

const treasureTypes = {
  COIN: { emoji: "💰", points: 0.5, rarity: 0.6 },
  SILVER: { emoji: "⚪", points: 1, rarity: 0.25 },
  GOLD: { emoji: "🌟", points: 1.5, rarity: 0.1 },
  GEM: { emoji: "💎", points: 2, rarity: 0.05 },
};

const powerUpTypes = {
  MAGNET: {
    emoji: "🧲",
    duration: 6,
    effect: "Attract Treasures",
    minLevel: 3,
  },
  SPEED: { emoji: "⚡", duration: 5, effect: "2x Speed", minLevel: 3 },
  SHIELD: {
    emoji: "🛡️",
    duration: 8,
    effect: "Temporary Invincibility",
    minLevel: 4,
  },
  POINTS: { emoji: "✨", duration: 7, effect: "2x Points", minLevel: 4 },
};

// Initialize audio system
function initAudio() {
  // Get all audio elements
  const audioElements = [
    treasureSound(),
    powerupSound(),
    obstacleSound(),
    achievementSound(),
    gameoverSound(),
    menuClickSound(),
  ].filter(el => el !== null); // Filter out null elements

  console.log("🎵 [INIT AUDIO] Starting audio initialization...");

  // Force load all audio elements
  audioElements.forEach((audio) => {
    if (audio) {
      console.log(`🎵 [INIT AUDIO] Initializing: ${audio.id}`);
      audio.preload = "auto";

      // Set src from source tag if not already set
      if (!audio.src) {
        const sourceTag = audio.querySelector("source");
        if (sourceTag) {
          audio.src = sourceTag.src;
          console.log(
            `🎵 [INIT AUDIO] Set src for ${audio.id}: ${sourceTag.src}`
          );
        }
      }

      // Load the audio
      audio.load();
      console.log(`🎵 [INIT AUDIO] Called load() on: ${audio.id}`);
    }
  });

  // Set initial volumes
  updateAudioVolumes();

  // Enable user interaction for audio autoplay
  const bgMusic = backgroundMusic();
  if (bgMusic) {
    bgMusic.volume = musicVolume;
  }

  // Initialize AudioContext for fallback sounds
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      console.log("✅ AudioContext initialized");
    } catch (e) {
      console.log("❌ AudioContext initialization failed:", e);
    }
  }

  console.log("✅ [INIT AUDIO] Audio system initialization complete");
}

// Update all audio volumes
function updateAudioVolumes() {
  const bgMusic = backgroundMusic();
  const tSound = treasureSound();
  const pSound = powerupSound();
  const oSound = obstacleSound();
  const aSound = achievementSound();
  const gSound = gameoverSound();
  const mSound = menuClickSound();
  if (bgMusic) bgMusic.volume = isMuted ? 0 : musicVolume;
  if (tSound) tSound.volume = isMuted ? 0 : fxVolume;
  if (pSound) pSound.volume = isMuted ? 0 : fxVolume;
  if (oSound) oSound.volume = isMuted ? 0 : fxVolume;
  if (aSound) aSound.volume = isMuted ? 0 : fxVolume;
  if (gSound) gSound.volume = isMuted ? 0 : fxVolume;
  if (mSound) mSound.volume = isMuted ? 0 : fxVolume;
}

// Play specific sound effect
function playAudio(audioElement) {
  if (!audioElement) {
    console.log("❌ [PLAY AUDIO] No audio element provided");
    return;
  }

  try {
    console.log(`🎵 [PLAY AUDIO] Attempting to play: ${audioElement.id}`);

    // Get the actual src - either from src attribute or from first source tag
    let src = audioElement.src;
    if (!src) {
      const sourceTag = audioElement.querySelector("source");
      if (sourceTag) {
        src = sourceTag.src;
        console.log(`🎵 [PLAY AUDIO] Got src from source tag: ${src}`);
      }
    }
    console.log(`🎵 [PLAY AUDIO] Element src: ${src}`);
    console.log(
      `🎵 [PLAY AUDIO] Current state - readyState: ${audioElement.readyState}, networkState: ${audioElement.networkState}`
    );

    // Set volume based on FX settings
    const fxVolume = document.getElementById("fxVolume")
      ? document.getElementById("fxVolume").value / 100
      : 0.7;

    audioElement.volume = isMuted ? 0 : fxVolume;
    console.log(`🎵 [PLAY AUDIO] Volume set to ${audioElement.volume}`);

    audioElement.currentTime = 0;

    // First ensure audio is loaded
    if (audioElement.readyState < 2) {
      console.log(
        `🎵 [PLAY AUDIO] Audio not ready (readyState ${audioElement.readyState}), calling load()...`
      );
      audioElement.load();
    }

    // Direct play attempt
    console.log(`🎵 [PLAY AUDIO] Calling play() directly...`);
    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(
            `✅ [PLAY AUDIO] Successfully played: ${audioElement.id}`
          );
        })
        .catch((e) => {
          console.log(
            `❌ [PLAY AUDIO] Play failed: ${e.name} - ${e.message}`
          );
          // Try again after a short delay
          setTimeout(() => {
            console.log(`🔄 [PLAY AUDIO] Retrying play after delay...`);
            audioElement
              .play()
              .then(() => {
                console.log(
                  `✅ [PLAY AUDIO] Retry successful: ${audioElement.id}`
                );
              })
              .catch((e2) => {
                console.log(
                  `❌ [PLAY AUDIO] Retry failed: ${e2.message}`
                );
                fallbackProceduralSound(audioElement.id || "default");
              });
          }, 100);
        });
    }
  } catch (e) {
    console.log(`❌ [PLAY AUDIO] Exception: ${e.message}`);
    fallbackProceduralSound(audioElement.id || "default");
  }
}

// Fallback procedural sound generation
function fallbackProceduralSound(soundType) {
  if (isMuted) return;

  // Initialize AudioContext if needed
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.log("AudioContext not available");
      return;
    }
  }

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Get FX volume for procedural sounds
    const fxVolume = document.getElementById("fxVolume")
      ? document.getElementById("fxVolume").value / 100
      : 0.7;

    // Different tones for different sound types
    switch (soundType) {
      case "treasureSound":
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(
          0.1 * fxVolume,
          audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        break;
      case "powerupSound":
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(
          0.15 * fxVolume,
          audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );
        break;
      case "obstacleSound":
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(
          0.1 * fxVolume,
          audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );
        break;
      case "achievementSound":
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(
          0.1 * fxVolume,
          audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.8
        );
        break;
      case "gameoverSound":
        oscillator.frequency.value = 150;
        gainNode.gain.setValueAtTime(
          0.15 * fxVolume,
          audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 1.0
        );
        break;
      default:
        oscillator.frequency.value = 440;
        gainNode.gain.setValueAtTime(
          0.1 * fxVolume,
          audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
    console.log(`Procedural sound played: ${soundType}`);
  } catch (e) {
    console.log("Fallback sound failed:", e);
  }
}

// Background music controls
function startBackgroundMusic() {
  const bgMusic = backgroundMusic();
  if (!bgMusic || isMuted) return;

  try {
    bgMusic.currentTime = 0;
    bgMusic
      .play()
      .then(() => {
        isPlaying = true;
        console.log("Background music started");
      })
      .catch((e) => {
        console.log("Background music failed to start:", e.message);
        // Fall back to procedural music if MP3 fails
        fallbackToProceduralMusic();
      });
  } catch (e) {
    console.log("Background music error:", e);
    fallbackToProceduralMusic();
  }
}

function stopBackgroundMusic() {
  const bgMusic = backgroundMusic();
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  isPlaying = false;

  // Also stop procedural music if it's running
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

// Fallback procedural music system
let audioContext = null;
let musicInterval = null;

function fallbackToProceduralMusic() {
  console.log("Falling back to procedural music");

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.log("Web Audio API not supported");
      return;
    }
  }

  if (musicInterval || isMuted) return;

  const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
  let noteIndex = 0;

  musicInterval = setInterval(() => {
    if (!isMuted && isPlaying) {
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          notes[noteIndex],
          audioContext.currentTime
        );
        oscillator.type = "triangle";

        gainNode.gain.setValueAtTime(
          musicVolume * 0.1,
          audioContext.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        noteIndex = (noteIndex + 1) % notes.length;
      } catch (e) {
        console.log("Procedural music error:", e);
      }
    }
  }, 800);
}

// Audio controls
document.getElementById("playMusicBtn").addEventListener("click", () => {
  initAudio();

  const btn = document.getElementById("playMusicBtn");

  if (!isPlaying) {
    startBackgroundMusic();
    btn.textContent = "⏸ Pause Music";
  } else {
    stopBackgroundMusic();
    btn.textContent = "🎵 Play Music";
  }
});

document.getElementById("musicVolume").addEventListener("input", (e) => {
  musicVolume = e.target.value / 100;
  document.getElementById("musicVolumeValue").textContent =
    e.target.value + "%";
  updateAudioVolumes();
});

document.getElementById("fxVolume").addEventListener("input", (e) => {
  fxVolume = e.target.value / 100;
  document.getElementById("fxVolumeValue").textContent =
    e.target.value + "%";
  updateAudioVolumes();
});

document.getElementById("muteBtn").addEventListener("click", () => {
  isMuted = !isMuted;
  const btn = document.getElementById("muteBtn");
  btn.textContent = isMuted ? "🔊 Unmute" : "🔇 Mute All";

  updateAudioVolumes();

  if (isMuted) {
    stopBackgroundMusic();
  } else if (isPlaying) {
    startBackgroundMusic();
  }
});

// Audio panel toggle functionality
let audioControlsExpanded = false;

document
  .getElementById("audioToggleBtn")
  .addEventListener("click", () => {
    const audioControls = document.getElementById("audioControls");
    const toggleBtn = document.getElementById("audioToggleBtn");

    audioControlsExpanded = !audioControlsExpanded;

    if (audioControlsExpanded) {
      audioControls.classList.add("expanded");
      toggleBtn.classList.add("active");
      toggleBtn.innerHTML = "🎶";
    } else {
      audioControls.classList.remove("expanded");
      toggleBtn.classList.remove("active");
      toggleBtn.innerHTML = "🎵";
    }

    playAudio(menuClickSound());
  });

// Close audio controls when clicking outside
document.addEventListener("click", (e) => {
  const audioControls = document.getElementById("audioControls");
  const toggleBtn = document.getElementById("audioToggleBtn");

  if (
    audioControlsExpanded &&
    !audioControls.contains(e.target) &&
    !toggleBtn.contains(e.target)
  ) {
    audioControls.classList.remove("expanded");
    toggleBtn.classList.remove("active");
    toggleBtn.innerHTML = "🎵";
    audioControlsExpanded = false;
  }
});

// Initialize character selection
function initializeCharacterSelection() {
  const p1Container = document.getElementById("player1Characters");
  const p2Container = document.getElementById("player2Characters");

  // Clear existing characters
  p1Container.innerHTML = "";
  p2Container.innerHTML = "";

  // Create character options for both players
  Object.entries(characterOptions).forEach(([key, character]) => {
    // Player 1 character option
    const p1Option = document.createElement("div");
    p1Option.className = "character-option";
    if (key === selectedP1Character) p1Option.classList.add("selected");
    p1Option.innerHTML = `
       <div class="emoji">${character.emoji}</div>
       <div class="name">${character.name}</div>
     `;
    p1Option.addEventListener("click", () => {
      selectedP1Character = key;
      updateCharacterSelection("player1");
      playAudio(menuClickSound());
      // Immediately update background when character is selected
      updateBackgroundPreview(key);
    });
    p1Container.appendChild(p1Option);

    // Player 2 character option
    const p2Option = document.createElement("div");
    p2Option.className = "character-option";
    if (key === selectedP2Character) p2Option.classList.add("selected");
    p2Option.innerHTML = `
       <div class="emoji">${character.emoji}</div>
       <div class="name">${character.name}</div>
     `;
    p2Option.addEventListener("click", () => {
      selectedP2Character = key;
      updateCharacterSelection("player2");
      playAudio(menuClickSound());
    });
    p2Container.appendChild(p2Option);
  });
}

function updateCharacterSelection(player) {
  const container = document.getElementById(
    player === "player1" ? "player1Characters" : "player2Characters"
  );
  const selectedChar =
    player === "player1" ? selectedP1Character : selectedP2Character;

  container
    .querySelectorAll(".character-option")
    .forEach((option, index) => {
      const characterKey = Object.keys(characterOptions)[index];
      if (characterKey === selectedChar) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });

  // Update background preview when Player 1 selects a character
  if (player === "player1") {
    updateBackgroundPreview(selectedChar);
  }
}

// Update background preview based on Player 1's character selection
function updateBackgroundPreview(characterKey) {
  const gameContainer = document.getElementById("game");
  const selectedCharacter = characterOptions[characterKey];

  if (selectedCharacter && selectedCharacter.background) {
    gameContainer.style.backgroundImage = `url("${selectedCharacter.background}")`;
    console.log(`Background changed to: ${selectedCharacter.name} theme`);
  }
}

// Update player appearance based on selection and facing direction
function updatePlayerAppearance() {
  const p1Char = characterOptions[selectedP1Character];
  const p2Char = characterOptions[selectedP2Character];

  // Simple facing logic - just use the character emoji
  player1.innerText = p1Char.emoji;
  player2.innerText = p2Char.emoji;

  // Apply CSS transform based on emoji's natural facing direction
  // For characters that need flip (face left by default):
  //   - When facing left (p1FacingLeft=true): scaleX(1) - no flip
  //   - When facing right (p1FacingLeft=false): scaleX(-1) - flip
  // For characters that don't need flip (face right by default like Surfer):
  //   - When facing left (p1FacingLeft=true): scaleX(-1) - flip
  //   - When facing right (p1FacingLeft=false): scaleX(1) - no flip

  if (p1Char.needsFlip) {
    player1.style.transform = p1FacingLeft ? "scaleX(1)" : "scaleX(-1)";
  } else {
    player1.style.transform = p1FacingLeft ? "scaleX(-1)" : "scaleX(1)";
  }

  if (p2Char.needsFlip) {
    player2.style.transform = p2FacingLeft ? "scaleX(1)" : "scaleX(-1)";
  } else {
    player2.style.transform = p2FacingLeft ? "scaleX(-1)" : "scaleX(1)";
  }
}

// Initialize game
function init() {
  console.log("Initializing game...");

  // Initialize loading screen and preload all assets
  preloadGameAssets();
  initializeLoadingScreen();

  // Show start screen
  startscreen.style.display = "block";
  if (gameTitle) gameTitle.style.display = "none"; // Hide game title when menu is visible
  player1.style.display = "none";
  player2.style.display = "none";
  treasure.style.display = "none";
  document.querySelector(".game-header-buttons").style.display = "none";
  powerUpStatus.style.display = "none";
  
  // Hide touch controls when on start screen
  const touchControls = document.getElementById('touchControls');
    if (touchControls && window.isTouchDevice) {
      touchControls.style.display = 'none';
    }
    if (window.isTouchDevice) {
      document.body.classList.remove("portrait-lock");
      updateOrientationLock();
    }

  // Update high score display
  document.getElementById("highScoreDisplay").textContent = highScore;

  // Initialize character selection
  initializeCharacterSelection();

  // Set initial background based on default Player 1 character (Mermaid)
  updateBackgroundPreview(selectedP1Character);

  // Device detection for mobile/tablet (global variable)
  function isMobileOrTablet() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 1024 && 'ontouchstart' in window);
  }

    const isTouchDevice = isMobileOrTablet();
    window.isTouchDevice = isTouchDevice; // Make globally accessible
    updateOrientationLock();
  
  // Disable two-player mode on mobile/tablet
  const twoPlayerButton = document.querySelector('.mode-button[data-mode="2"]');
  const twoPlayerDescription = twoPlayerButton?.querySelector('.description');
  
  if (isTouchDevice && twoPlayerButton) {
    twoPlayerButton.classList.add('disabled');
    twoPlayerButton.style.opacity = '0.5';
    twoPlayerButton.style.cursor = 'not-allowed';
    if (twoPlayerDescription) {
      twoPlayerDescription.textContent = 'Mobile/tablet screens are not wide enough for two players. Use on-screen arrows to play!';
      twoPlayerDescription.style.fontSize = '0.85em';
      twoPlayerDescription.style.color = 'rgba(255, 255, 255, 0.8)';
    }
    
    // Prevent clicking two-player mode on mobile/tablet
    twoPlayerButton.addEventListener('click', (e) => {
      if (isTouchDevice) {
        e.preventDefault();
        e.stopPropagation();
        playAudio(menuClickSound());
        showMessage('📱 Two-player mode is not available on mobile/tablet devices. Please use Single Player mode with on-screen controls!', 3000);
        return false;
      }
    });
  }

  // Mode selection
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      // Prevent selection if disabled (mobile/tablet two-player)
      if (button.classList.contains('disabled') && isTouchDevice) {
        return;
      }
      
      document
        .querySelectorAll(".mode-button")
        .forEach((b) => b.classList.remove("selected"));
      button.classList.add("selected");
      mode = parseInt(button.dataset.mode);
      
      // Force single-player mode on mobile/tablet
      if (isTouchDevice && mode === 2) {
        mode = 1;
        document.querySelector('.mode-button[data-mode="1"]').classList.add("selected");
        button.classList.remove("selected");
      }
      
      playAudio(menuClickSound()); // Click sound

      const player2Settings = document.getElementById("player2Settings");
      const playersContainer = document.getElementById("playersContainer");
      if (mode === 2) {
        player2Settings.style.display = "block";
        playersContainer.classList.add("two-player");
      } else {
        player2Settings.style.display = "none";
        playersContainer.classList.remove("two-player");
      }
    });
  });

  // How to Play Modal handlers
  const howToPlayBtn = document.getElementById("howToPlayBtn");
  const howToPlayModal = document.getElementById("howToPlayModal");
  
  if (howToPlayBtn) {
    howToPlayBtn.addEventListener("click", openHowToPlay);
  }
  
  // Close modal when clicking outside
  if (howToPlayModal) {
    howToPlayModal.addEventListener("click", (e) => {
      if (e.target === howToPlayModal) {
        closeHowToPlay();
      }
    });
    
    // Close modal on ESC key (only if modal is visible and game not running)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && 
          howToPlayModal.style.display !== "none" && 
          howToPlayModal.style.display !== "" &&
          !timer) {
        closeHowToPlay();
      }
    });
  }

  console.log("Game initialized");
}

// Open How to Play Modal
function openHowToPlay() {
  const howToPlayModal = document.getElementById("howToPlayModal");
  if (howToPlayModal) {
    howToPlayModal.style.display = "flex";
    playAudio(menuClickSound());
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  }
}

// Close How to Play Modal
function closeHowToPlay() {
  const howToPlayModal = document.getElementById("howToPlayModal");
  if (howToPlayModal) {
    howToPlayModal.style.display = "none";
    playAudio(menuClickSound());
    // Restore body scroll
    document.body.style.overflow = "auto";
  }
}

function randomPosition() {
  const game = document.getElementById("game");
  const x = Math.random() * (game.clientWidth - 60);
  const y = Math.random() * (game.clientHeight - 60);
  return { x, y };
}

// Minimum buffer distances between game elements (in pixels)
// Increased values to prevent dangerous clustering and overlapping
const BUFFER_DISTANCES = {
  OBSTACLE_TO_CHARACTER: 150, // Obstacles must be 150px away from characters (increased for better gameplay)
  OBSTACLE_TO_TREASURE: 200, // Obstacles must be 200px away from treasures (increased to ensure treasures are accessible)
  OBSTACLE_TO_OBSTACLE: 100, // Obstacles must be 100px apart from each other (increased to prevent stacking)
  TREASURE_TO_CHARACTER: 100, // Treasures must be 100px away from characters
  POWERUP_TO_ANY: 80, // Power-ups must be 80px away from anything
};

// Check distance between two points
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Check if a position has sufficient buffer distance from all elements
function isPositionSafe(
  x,
  y,
  elementWidth = 60,
  excludeElement = null,
  elementType = "default"
) {
  const newRect = {
    left: x,
    top: y,
    right: x + elementWidth,
    bottom: y + elementWidth,
    centerX: x + elementWidth / 2,
    centerY: y + elementWidth / 2,
  };

  // Check against players with appropriate buffer
  const p1CenterX = parseFloat(player1.style.left) + 30;
  const p1CenterY = parseFloat(player1.style.top) + 30;

  let minDistanceToPlayer = BUFFER_DISTANCES.POWERUP_TO_ANY;
  if (elementType === "obstacle") {
    minDistanceToPlayer = BUFFER_DISTANCES.OBSTACLE_TO_CHARACTER;
  } else if (elementType === "treasure") {
    minDistanceToPlayer = BUFFER_DISTANCES.TREASURE_TO_CHARACTER;
  }

  const distanceToP1 = getDistance(
    newRect.centerX,
    newRect.centerY,
    p1CenterX,
    p1CenterY
  );
  if (distanceToP1 < minDistanceToPlayer) {
    return false;
  }

  // Check against player 2 if in two-player mode
  if (mode === 2) {
    const p2CenterX = parseFloat(player2.style.left) + 30;
    const p2CenterY = parseFloat(player2.style.top) + 30;
    const distanceToP2 = getDistance(
      newRect.centerX,
      newRect.centerY,
      p2CenterX,
      p2CenterY
    );
    if (distanceToP2 < minDistanceToPlayer) {
      return false;
    }
  }

  // Check against obstacles with appropriate buffer
  for (let obs of obstacles) {
    if (obs === excludeElement) continue;

    const obsCenterX = parseFloat(obs.style.left) + 30;
    const obsCenterY = parseFloat(obs.style.top) + 30;
    const distanceToObs = getDistance(
      newRect.centerX,
      newRect.centerY,
      obsCenterX,
      obsCenterY
    );

    let minDistanceToObstacle = BUFFER_DISTANCES.OBSTACLE_TO_OBSTACLE;
    if (elementType === "treasure") {
      minDistanceToObstacle = BUFFER_DISTANCES.OBSTACLE_TO_TREASURE;
    } else if (elementType === "obstacle") {
      minDistanceToObstacle = BUFFER_DISTANCES.OBSTACLE_TO_OBSTACLE;
    } else {
      minDistanceToObstacle = BUFFER_DISTANCES.POWERUP_TO_ANY;
    }

    if (distanceToObs < minDistanceToObstacle) {
      return false;
    }
  }

  // Check against treasure (if not excluding it)
  if (excludeElement !== treasure && treasure.style.display !== "none") {
    const treasureCenterX = parseFloat(treasure.style.left) + 30;
    const treasureCenterY = parseFloat(treasure.style.top) + 30;
    const distanceToTreasure = getDistance(
      newRect.centerX,
      newRect.centerY,
      treasureCenterX,
      treasureCenterY
    );

    let minDistanceToTreasure = BUFFER_DISTANCES.POWERUP_TO_ANY;
    if (elementType === "obstacle") {
      minDistanceToTreasure = BUFFER_DISTANCES.OBSTACLE_TO_TREASURE;
    }

    if (distanceToTreasure < minDistanceToTreasure) {
      return false;
    }
  }

  // Check against power-ups
  for (let powerUp of powerUps) {
    if (powerUp === excludeElement) continue;

    const powerUpCenterX = parseFloat(powerUp.style.left) + 30;
    const powerUpCenterY = parseFloat(powerUp.style.top) + 30;
    const distanceToPowerUp = getDistance(
      newRect.centerX,
      newRect.centerY,
      powerUpCenterX,
      powerUpCenterY
    );

    if (distanceToPowerUp < BUFFER_DISTANCES.POWERUP_TO_ANY) {
      return false;
    }
  }

  return true;
}

// Check if two rectangles overlap (legacy function for collision detection)
function isRectOverlapping(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect2.right < rect1.left ||
    rect1.bottom < rect2.top ||
    rect2.bottom < rect1.top
  );
}

// Get a safe random position that doesn't overlap with other elements
function getSafeRandomPosition(
  excludeElement = null,
  elementType = "default",
  maxAttempts = 100
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pos = randomPosition();
    if (isPositionSafe(pos.x, pos.y, 60, excludeElement, elementType)) {
      return pos;
    }
  }

  // If we can't find a safe position after max attempts, try with reduced buffer
  console.warn(
    `Could not find safe position for ${elementType} after ${maxAttempts} attempts, trying with reduced buffer`
  );

  // Try 50 more times with half the buffer distances
  const originalBuffers = { ...BUFFER_DISTANCES };
  for (let key in BUFFER_DISTANCES) {
    BUFFER_DISTANCES[key] = BUFFER_DISTANCES[key] * 0.6;
  }

  for (let attempt = 0; attempt < 50; attempt++) {
    const pos = randomPosition();
    if (isPositionSafe(pos.x, pos.y, 60, excludeElement, elementType)) {
      // Restore original buffers
      for (let key in originalBuffers) {
        BUFFER_DISTANCES[key] = originalBuffers[key];
      }
      return pos;
    }
  }

  // Restore original buffers
  for (let key in originalBuffers) {
    BUFFER_DISTANCES[key] = originalBuffers[key];
  }

  console.warn("Using fallback random position");
  return randomPosition();
}

function placeTreasure() {
  // Select random treasure type based on rarity
  const rand = Math.random();
  let selectedType = treasureTypes.COIN;
  let cumulative = 0;

  for (const type of Object.values(treasureTypes)) {
    cumulative += type.rarity;
    if (rand <= cumulative) {
      selectedType = type;
      break;
    }
  }

  treasure.innerText = selectedType.emoji;
  treasure.dataset.points = selectedType.points;
  treasure.dataset.type = Object.keys(treasureTypes).find(
    (key) => treasureTypes[key] === selectedType
  );

  // Use safe positioning to avoid overlaps with proper treasure buffer
  const pos = getSafeRandomPosition(treasure, "treasure");
  treasure.style.left = pos.x + "px";
  treasure.style.top = pos.y + "px";

  // Enforce separation from obstacles
  resolveTreasureObstacleCollisions();
}

// Continuously enforce minimum separation between all game elements during gameplay
function enforceElementSeparation() {
  // Check if game is running by checking if timer exists
  if (!timer) return;

  const game = document.getElementById("game");

  // 1. Check treasure-obstacle separation
  const treasureCenterX = parseFloat(treasure.style.left) + 30;
  const treasureCenterY = parseFloat(treasure.style.top) + 30;

  obstacles.forEach((obstacle) => {
    // Skip special horizontal-moving crocodiles (they move across screen)
    if (obstacle.dataset.special === "horizontal") return;

    const obstacleCenterX = parseFloat(obstacle.style.left) + 30;
    const obstacleCenterY = parseFloat(obstacle.style.top) + 30;
    const distance = getDistance(
      treasureCenterX,
      treasureCenterY,
      obstacleCenterX,
      obstacleCenterY
    );

    // If obstacle gets too close to treasure during movement, nudge it away
    if (distance < BUFFER_DISTANCES.OBSTACLE_TO_TREASURE) {
      console.log(
        `⚠️ Separating obstacle from treasure: ${Math.round(
          distance
        )}px → ${BUFFER_DISTANCES.OBSTACLE_TO_TREASURE}px`
      );

      // Calculate push direction (away from treasure)
      const angle = Math.atan2(
        obstacleCenterY - treasureCenterY,
        obstacleCenterX - treasureCenterX
      );
      const pushDistance =
        BUFFER_DISTANCES.OBSTACLE_TO_TREASURE - distance;

      // Move obstacle away
      const newX =
        parseFloat(obstacle.style.left) + Math.cos(angle) * pushDistance;
      const newY =
        parseFloat(obstacle.style.top) + Math.sin(angle) * pushDistance;

      // Keep within bounds
      obstacle.style.left =
        Math.max(0, Math.min(game.clientWidth - 60, newX)) + "px";
      obstacle.style.top =
        Math.max(0, Math.min(game.clientHeight - 60, newY)) + "px";
    }
  });

  // 2. Check obstacle-to-obstacle separation to prevent stacking/clustering
  for (let i = 0; i < obstacles.length; i++) {
    const obs1 = obstacles[i];
    // Skip special horizontal-moving crocodiles
    if (obs1.dataset.special === "horizontal") continue;

    const obs1CenterX = parseFloat(obs1.style.left) + 30;
    const obs1CenterY = parseFloat(obs1.style.top) + 30;

    for (let j = i + 1; j < obstacles.length; j++) {
      const obs2 = obstacles[j];
      // Skip special horizontal-moving crocodiles
      if (obs2.dataset.special === "horizontal") continue;

      const obs2CenterX = parseFloat(obs2.style.left) + 30;
      const obs2CenterY = parseFloat(obs2.style.top) + 30;

      const distance = getDistance(
        obs1CenterX,
        obs1CenterY,
        obs2CenterX,
        obs2CenterY
      );

      // If obstacles are too close to each other, push them apart
      if (distance < BUFFER_DISTANCES.OBSTACLE_TO_OBSTACLE) {
        console.log(
          `⚠️ Separating obstacles: ${Math.round(distance)}px → ${
            BUFFER_DISTANCES.OBSTACLE_TO_OBSTACLE
          }px (${obs1.dataset.type} vs ${obs2.dataset.type})`
        );

        // Calculate push direction (push both away from each other)
        const angle = Math.atan2(
          obs2CenterY - obs1CenterY,
          obs2CenterX - obs1CenterX
        );
        const pushDistance =
          (BUFFER_DISTANCES.OBSTACLE_TO_OBSTACLE - distance) / 2;

        // Push obs1 backward
        const newX1 =
          parseFloat(obs1.style.left) - Math.cos(angle) * pushDistance;
        const newY1 =
          parseFloat(obs1.style.top) - Math.sin(angle) * pushDistance;
        obs1.style.left =
          Math.max(0, Math.min(game.clientWidth - 60, newX1)) + "px";
        obs1.style.top =
          Math.max(0, Math.min(game.clientHeight - 60, newY1)) + "px";

        // Push obs2 forward
        const newX2 =
          parseFloat(obs2.style.left) + Math.cos(angle) * pushDistance;
        const newY2 =
          parseFloat(obs2.style.top) + Math.sin(angle) * pushDistance;
        obs2.style.left =
          Math.max(0, Math.min(game.clientWidth - 60, newX2)) + "px";
        obs2.style.top =
          Math.max(0, Math.min(game.clientHeight - 60, newY2)) + "px";
      }
    }
  }

  // 3. Check obstacle-to-character separation to prevent obstacles camping next to players
  obstacles.forEach((obstacle) => {
    // Skip special horizontal-moving crocodiles (they move across screen intentionally)
    if (obstacle.dataset.special === "horizontal") return;

    const obstacleCenterX = parseFloat(obstacle.style.left) + 30;
    const obstacleCenterY = parseFloat(obstacle.style.top) + 30;

    // Check distance to Player 1
    const p1CenterX = parseFloat(player1.style.left) + 30;
    const p1CenterY = parseFloat(player1.style.top) + 30;
    const distanceToP1 = getDistance(
      obstacleCenterX,
      obstacleCenterY,
      p1CenterX,
      p1CenterY
    );

    // If obstacle is too close to player 1, push it away
    if (distanceToP1 < BUFFER_DISTANCES.OBSTACLE_TO_CHARACTER) {
      console.log(
        `⚠️ Separating obstacle from Player 1: ${Math.round(
          distanceToP1
        )}px → ${BUFFER_DISTANCES.OBSTACLE_TO_CHARACTER}px`
      );

      // Calculate push direction (away from player)
      const angle = Math.atan2(
        obstacleCenterY - p1CenterY,
        obstacleCenterX - p1CenterX
      );
      const pushDistance =
        BUFFER_DISTANCES.OBSTACLE_TO_CHARACTER - distanceToP1;

      // Move obstacle away from player
      const newX =
        parseFloat(obstacle.style.left) + Math.cos(angle) * pushDistance;
      const newY =
        parseFloat(obstacle.style.top) + Math.sin(angle) * pushDistance;

      // Keep within bounds
      obstacle.style.left =
        Math.max(0, Math.min(game.clientWidth - 60, newX)) + "px";
      obstacle.style.top =
        Math.max(0, Math.min(game.clientHeight - 60, newY)) + "px";
    }

    // Check distance to Player 2 (if in 2-player mode)
    if (mode === 2) {
      const p2CenterX = parseFloat(player2.style.left) + 30;
      const p2CenterY = parseFloat(player2.style.top) + 30;
      const distanceToP2 = getDistance(
        obstacleCenterX,
        obstacleCenterY,
        p2CenterX,
        p2CenterY
      );

      // If obstacle is too close to player 2, push it away
      if (distanceToP2 < BUFFER_DISTANCES.OBSTACLE_TO_CHARACTER) {
        console.log(
          `⚠️ Separating obstacle from Player 2: ${Math.round(
            distanceToP2
          )}px → ${BUFFER_DISTANCES.OBSTACLE_TO_CHARACTER}px`
        );

        // Calculate push direction (away from player)
        const angle = Math.atan2(
          obstacleCenterY - p2CenterY,
          obstacleCenterX - p2CenterX
        );
        const pushDistance =
          BUFFER_DISTANCES.OBSTACLE_TO_CHARACTER - distanceToP2;

        // Move obstacle away from player
        const newX =
          parseFloat(obstacle.style.left) +
          Math.cos(angle) * pushDistance;
        const newY =
          parseFloat(obstacle.style.top) + Math.sin(angle) * pushDistance;

        // Keep within bounds
        obstacle.style.left =
          Math.max(0, Math.min(game.clientWidth - 60, newX)) + "px";
        obstacle.style.top =
          Math.max(0, Math.min(game.clientHeight - 60, newY)) + "px";
      }
    }
  });
}

// Check for treasure-obstacle collisions and relocate obstacles if needed
function resolveTreasureObstacleCollisions() {
  const treasureCenterX = parseFloat(treasure.style.left) + 30;
  const treasureCenterY = parseFloat(treasure.style.top) + 30;

  obstacles.forEach((obstacle) => {
    const obstacleCenterX = parseFloat(obstacle.style.left) + 30;
    const obstacleCenterY = parseFloat(obstacle.style.top) + 30;

    // Check if treasure and obstacle are too close (using buffer distance)
    const distance = getDistance(
      treasureCenterX,
      treasureCenterY,
      obstacleCenterX,
      obstacleCenterY
    );

    if (distance < BUFFER_DISTANCES.OBSTACLE_TO_TREASURE) {
      console.log(
        `🚫 Treasure-obstacle too close (${Math.round(distance)}px < ${
          BUFFER_DISTANCES.OBSTACLE_TO_TREASURE
        }px), relocating obstacle`
      );

      // Find a new safe position for the obstacle
      const newPos = getSafeRandomPosition(obstacle, "obstacle");
      obstacle.style.left = newPos.x + "px";
      obstacle.style.top = newPos.y + "px";

      console.log(
        "✅ Obstacle relocated to maintain safe distance from treasure"
      );
    }
  });
}

function createPowerUp() {
  if (level < 3) return; // Power-ups only appear from level 3+
  if (powerUps.length >= 2) return; // Max 2 power-ups at once
  if (Math.random() > 0.3) return; // 30% chance

  const availablePowerUps = Object.entries(powerUpTypes).filter(
    ([_, type]) => level >= type.minLevel
  );
  if (availablePowerUps.length === 0) return;

  const [powerUpName, powerUpType] =
    availablePowerUps[
      Math.floor(Math.random() * availablePowerUps.length)
    ];

  const powerUp = document.createElement("div");
  powerUp.className = "power-up sprite";
  powerUp.innerText = powerUpType.emoji;
  powerUp.dataset.type = powerUpName;

  const pos = getSafeRandomPosition(powerUp, "powerup"); // Use safe positioning with powerup type
  powerUp.style.left = pos.x + "px";
  powerUp.style.top = pos.y + "px";

  gameContainer.appendChild(powerUp);
  powerUps.push(powerUp);

  // Remove power-up after 10 seconds
  setTimeout(() => {
    if (powerUps.includes(powerUp)) {
      powerUp.remove();
      powerUps = powerUps.filter((p) => p !== powerUp);
    }
  }, 10000);
}

function createObstacles() {
  // Clear existing obstacles
  obstacles.forEach((obs) => obs.remove());
  obstacles = [];

  const obstacleTypes = [
    { emoji: "🐊", type: "crocodile", faceable: true },
    { emoji: "🔥", type: "fire", faceable: false },
    { emoji: "🥥", type: "coconut", faceable: false },
  ];
  let obstacleCount = 2;

  if (level >= 13) obstacleCount = 8;
  else if (level >= 9) obstacleCount = 6;
  else if (level >= 6) obstacleCount = 5;
  else if (level >= 4) obstacleCount = 4;
  else if (level >= 3) obstacleCount = 3;

  for (let i = 0; i < obstacleCount; i++) {
    const obs = document.createElement("div");
    obs.className = "obstacle sprite";

    const selectedObstacle =
      obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obs.innerText = selectedObstacle.emoji;
    obs.dataset.type = selectedObstacle.type;
    obs.dataset.faceable = selectedObstacle.faceable;

    const pos = getSafeRandomPosition(obs, "obstacle"); // Use safe positioning with obstacle type
    obs.style.left = pos.x + "px";
    obs.style.top = pos.y + "px";

    // Set movement direction and speed
    const dx = (Math.random() - 0.5) * (2 + level * 0.5);
    const dy = (Math.random() - 0.5) * (2 + level * 0.5);
    obs.dataset.dx = dx;
    obs.dataset.dy = dy;

    // Set initial facing direction for crocodiles
    if (selectedObstacle.faceable) {
      obs.dataset.facingLeft = dx < 0 ? "true" : "false";
      obs.style.transform = dx < 0 ? "scaleX(-1)" : "scaleX(1)";
    }

    gameContainer.appendChild(obs);
    obstacles.push(obs);
  }
}

// Random obstacle respawn when treasure is collected
function randomObstacleRespawn() {
  if (obstacles.length === 0) return;

  // Randomly remove 1-2 obstacles
  const removeCount = Math.min(
    Math.floor(Math.random() * 2) + 1,
    obstacles.length
  );

  for (let i = 0; i < removeCount; i++) {
    const randomIndex = Math.floor(Math.random() * obstacles.length);
    const obstacleToRemove = obstacles[randomIndex];
    obstacleToRemove.remove();
    obstacles.splice(randomIndex, 1);
  }

  // Add new obstacles at random positions
  const obstacleTypes = [
    { emoji: "🐊", type: "crocodile", faceable: true },
    { emoji: "🔥", type: "fire", faceable: false },
    { emoji: "🥥", type: "coconut", faceable: false },
  ];

  for (let i = 0; i < removeCount; i++) {
    const obs = document.createElement("div");
    obs.className = "obstacle sprite";

    const selectedObstacle =
      obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obs.innerText = selectedObstacle.emoji;
    obs.dataset.type = selectedObstacle.type;
    obs.dataset.faceable = selectedObstacle.faceable;

    const pos = getSafeRandomPosition(obs, "obstacle"); // Use safe positioning with obstacle type
    obs.style.left = pos.x + "px";
    obs.style.top = pos.y + "px";

    // Set movement direction and speed
    const dx = (Math.random() - 0.5) * (2 + level * 0.5);
    const dy = (Math.random() - 0.5) * (2 + level * 0.5);
    obs.dataset.dx = dx;
    obs.dataset.dy = dy;

    // Set initial facing direction for crocodiles
    if (selectedObstacle.faceable) {
      obs.dataset.facingLeft = dx < 0 ? "true" : "false";
      obs.style.transform = dx < 0 ? "scaleX(-1)" : "scaleX(1)";
    }

    gameContainer.appendChild(obs);
    obstacles.push(obs);
  }
}

function moveObstacles() {
  // Obstacles start oscillating from Level 2, tracking from Level 3
  if (level < 2) return;

  obstacles.forEach((obs) => {
    // Skip special horizontal-moving crocodiles
    if (obs.dataset.special === "horizontal") return;
    let currentLeft = parseFloat(obs.style.left);
    let currentTop = parseFloat(obs.style.top);
    let dx = parseFloat(obs.dataset.dx);
    let dy = parseFloat(obs.dataset.dy);
    let oldDx = dx; // Store original dx to check for direction change

    // Level 2: Simple oscillating/bouncing movement
    if (level >= 2 && level < 3) {
      // Just bounce around randomly
      if (Math.random() < 0.03) {
        // 3% chance to change direction
        dx = (Math.random() - 0.5) * 3;
        dy = (Math.random() - 0.5) * 3;
        obs.dataset.dx = dx;
        obs.dataset.dy = dy;
      }
    }

    // Level 3+: Player-tracking movement towards nearest character
    if (level >= 3) {
      // Find nearest player
      let nearestPlayer = player1;
      let nearestDistance = Infinity;

      const obsRect = obs.getBoundingClientRect();

      // Check distance to player 1
      const p1Rect = player1.getBoundingClientRect();
      const p1Distance = Math.sqrt(
        Math.pow(p1Rect.left - obsRect.left, 2) +
          Math.pow(p1Rect.top - obsRect.top, 2)
      );

      nearestDistance = p1Distance;

      // Check distance to player 2 if in two-player mode
      if (mode === 2) {
        const p2Rect = player2.getBoundingClientRect();
        const p2Distance = Math.sqrt(
          Math.pow(p2Rect.left - obsRect.left, 2) +
            Math.pow(p2Rect.top - obsRect.top, 2)
        );

        if (p2Distance < nearestDistance) {
          nearestPlayer = player2;
          nearestDistance = p2Distance;
        }
      }

      // Move towards nearest player with increasing intensity based on level
      const playerRect = nearestPlayer.getBoundingClientRect();
      const trackingRange = 300; // Always track within this range
      // Level 3: Slower tracking, Level 4+: Faster tracking
      const baseTracking = level === 3 ? 0.2 : 0.3;
      const trackingStrength = baseTracking + (level - 3) * 0.05; // Increase with level starting from level 3

      if (nearestDistance < trackingRange) {
        const directionX = playerRect.left > obsRect.left ? 1 : -1;
        const directionY = playerRect.top > obsRect.top ? 1 : -1;

        dx += directionX * trackingStrength;
        dy += directionY * trackingStrength;

        // Cap the speed to prevent obstacles from becoming too fast
        const maxSpeed = 3 + (level - 3) * 0.15; // Adjusted for level 3 start
        dx = Math.max(-maxSpeed, Math.min(maxSpeed, dx));
        dy = Math.max(-maxSpeed, Math.min(maxSpeed, dy));

        obs.dataset.dx = dx;
        obs.dataset.dy = dy;
      }
    }

    // Move obstacle
    currentLeft += dx;
    currentTop += dy;

    // Bounce off walls and update facing direction
    if (
      currentLeft <= 0 ||
      currentLeft >= gameContainer.clientWidth - 60
    ) {
      dx = -dx;
      obs.dataset.dx = dx;
    }
    if (
      currentTop <= 0 ||
      currentTop >= gameContainer.clientHeight - 60
    ) {
      dy = -dy;
      obs.dataset.dy = dy;
    }

    // Update facing direction for faceable obstacles (like crocodiles)
    if (obs.dataset.faceable === "true") {
      const newFacingLeft = dx < 0;
      const currentFacingLeft = obs.dataset.facingLeft === "true";

      if (newFacingLeft !== currentFacingLeft) {
        obs.dataset.facingLeft = newFacingLeft ? "true" : "false";
        obs.style.transform = newFacingLeft ? "scaleX(-1)" : "scaleX(1)";
      }
    }

    // Keep in bounds
    currentLeft = Math.max(
      0,
      Math.min(gameContainer.clientWidth - 60, currentLeft)
    );
    currentTop = Math.max(
      0,
      Math.min(gameContainer.clientHeight - 60, currentTop)
    );

    obs.style.left = currentLeft + "px";
    obs.style.top = currentTop + "px";
  });

  // Handle special horizontal-moving crocodiles
  moveSpecialCrocodiles();

  // Remove special crocodiles if not at milestone level
  if (!shouldSpawnSpecialCrocodile(level)) {
    removeSpecialCrocodiles();
  }

  // Enforce element separation after obstacle movement
  enforceElementSeparation();
}

// Check if special crocodile should spawn at this level
function shouldSpawnSpecialCrocodile(currentLevel) {
  // Up to level 25: appears at 5, 10, 15, 20, 25 (every 5th)
  if (currentLevel <= 25) {
    return currentLevel % 5 === 0 && currentLevel >= 5;
  }
  // After level 25: appears every single level (26, 27, 28, 29, 30...)
  return currentLevel > 25;
}

// Special horizontal-moving crocodile that appears at milestone levels
function moveSpecialCrocodiles() {
  const specialCrocs = obstacles.filter(
    (obs) => obs.dataset.special === "horizontal"
  );

  specialCrocs.forEach((croc) => {
    let currentLeft = parseFloat(croc.style.left);
    const speed = parseFloat(croc.dataset.speed) || 3;
    const direction = parseFloat(croc.dataset.direction) || 1;

    // Move horizontally
    currentLeft += speed * direction;

    // Remove if off screen and recreate on opposite side
    if (
      (direction > 0 && currentLeft > gameContainer.clientWidth) ||
      (direction < 0 && currentLeft < -60)
    ) {
      // Remove this croc
      croc.remove();
      const index = obstacles.indexOf(croc);
      if (index > -1) obstacles.splice(index, 1);

      // Create new one on opposite side if still at appropriate level
      if (shouldSpawnSpecialCrocodile(level)) {
        createSpecialCrocodile();
      }
    } else {
      croc.style.left = currentLeft + "px";
    }
  });
}

// Remove special crocodiles when level changes to non-milestone level
function removeSpecialCrocodiles() {
  const specialCrocs = obstacles.filter(
    (obs) => obs.dataset.special === "horizontal"
  );

  specialCrocs.forEach((croc) => {
    croc.remove();
    const index = obstacles.indexOf(croc);
    if (index > -1) obstacles.splice(index, 1);
  });

  if (specialCrocs.length > 0) {
    gameLogger.addLog(
      `🐊 Special horizontal crocodile removed (not a milestone level)`,
      "info"
    );
  }
}

// Create special horizontal-moving crocodile
function createSpecialCrocodile() {
  const game = document.getElementById("game");
  const croc = document.createElement("div");
  croc.className = "obstacle sprite";
  croc.innerText = "🐊";
  croc.dataset.type = "crocodile";
  croc.dataset.faceable = "true";
  croc.dataset.special = "horizontal";

  // Random vertical position (different sections of screen)
  const sections = 3;
  const section = Math.floor(Math.random() * sections);
  const yPos =
    (game.clientHeight / sections) * section +
    Math.random() * (game.clientHeight / sections - 60);

  // Random direction: left-to-right or right-to-left
  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 2 + Math.random(); // Random speed between 2-3

  // Start position based on direction
  const xPos = direction > 0 ? -60 : game.clientWidth;

  croc.style.left = xPos + "px";
  croc.style.top = yPos + "px";
  croc.dataset.speed = speed;
  croc.dataset.direction = direction;

  // Set facing direction
  croc.dataset.facingLeft = direction < 0 ? "true" : "false";
  croc.style.transform = direction < 0 ? "scaleX(-1)" : "scaleX(1)";

  gameContainer.appendChild(croc);
  obstacles.push(croc);

  gameLogger.addLog(
    `🐊 Special horizontal crocodile spawned at level ${level}`,
    "info"
  );
}

function applyMagnetEffect(player) {
  const playerKey = player === player1 ? "player1" : "player2";

  if (
    !activePowerUps[playerKey] ||
    activePowerUps[playerKey].type !== "MAGNET"
  )
    return;

  const playerRect = player.getBoundingClientRect();
  const treasureRect = treasure.getBoundingClientRect();

  const dx = playerRect.left - treasureRect.left;
  const dy = playerRect.top - treasureRect.top;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Increased magnet range and effectiveness
  if (distance < 250) {
    console.log(
      `🧲 Magnet active for ${playerKey}, distance: ${distance.toFixed(
        2
      )}px`
    );

    // Enhanced magnet speed based on distance (closer = faster)
    const baseSpeed = 8;
    const speedMultiplier = Math.max(0.3, (250 - distance) / 250);
    const speed = baseSpeed * speedMultiplier;

    const moveX = (dx / distance) * speed;
    const moveY = (dy / distance) * speed;

    const currentLeft = parseFloat(treasure.style.left);
    const currentTop = parseFloat(treasure.style.top);

    // Apply movement with bounds checking
    const newLeft = Math.max(
      0,
      Math.min(gameContainer.clientWidth - 60, currentLeft + moveX)
    );
    const newTop = Math.max(
      0,
      Math.min(gameContainer.clientHeight - 60, currentTop + moveY)
    );

    treasure.style.left = newLeft + "px";
    treasure.style.top = newTop + "px";

    // Add enhanced visual effect
    if (!treasure.classList.contains("magnet-active")) {
      treasure.classList.add("magnet-active");
      console.log("✨ Magnet visual effect activated");
    }
  } else {
    // Remove visual effect when out of range
    if (treasure.classList.contains("magnet-active")) {
      treasure.classList.remove("magnet-active");
      console.log("🔄 Magnet visual effect deactivated");
    }
  }
}

function activatePowerUp(player, powerUpType) {
  const playerKey = player === player1 ? "player1" : "player2";
  const playerName = player === player1 ? player1Name : player2Name;

  // Clear existing power-up
  if (activePowerUps[playerKey]) {
    clearTimeout(activePowerUps[playerKey].timeout);
  }

  activePowerUps[playerKey] = {
    type: powerUpType,
    duration: powerUpTypes[powerUpType].duration,
  };

  playAudio(powerupSound()); // Power-up sound
  showMessage(
    `⚡ ${playerName} got ${powerUpTypes[powerUpType].effect}!`
  );

  // Update power-up status display
  updatePowerUpDisplay();

  // Set timeout to deactivate
  activePowerUps[playerKey].timeout = setTimeout(() => {
    activePowerUps[playerKey] = null;
    updatePowerUpDisplay();
    showMessage(`⏰ ${playerName}'s power-up expired`);
  }, powerUpTypes[powerUpType].duration * 1000);
}

function updatePowerUpDisplay() {
  const p1PowerUp = activePowerUps.player1;
  const p2PowerUp = activePowerUps.player2;

  if (p1PowerUp || p2PowerUp) {
    powerUpStatus.style.display = "block";
    let statusText = "";

    if (p1PowerUp) {
      statusText += `${player1Name}: ${
        powerUpTypes[p1PowerUp.type].emoji
      } ${powerUpTypes[p1PowerUp.type].effect}`;
    }
    if (p2PowerUp) {
      if (statusText) statusText += "<br>";
      statusText += `${player2Name}: ${
        powerUpTypes[p2PowerUp.type].emoji
      } ${powerUpTypes[p2PowerUp.type].effect}`;
    }

    document.getElementById("powerUpName").innerHTML = statusText;
  } else {
    powerUpStatus.style.display = "none";
  }
}

// Cache bounding rects per frame to avoid repeated DOM queries (performance optimization)
let cachedP1Rect = null;
let cachedP2Rect = null;
let cachedTreasureRect = null;

// Track treasure collection to prevent multiple collections of the same treasure
let treasureJustCollected = false;
let lastTreasurePosition = null;

function checkCollisions() {
  // Update cached rects every frame for accurate collision detection (critical for all characters)
  // Removed caching delay to ensure real-time collision detection
  cachedP1Rect = player1.getBoundingClientRect();
  cachedTreasureRect = treasure.getBoundingClientRect();
  if (mode === 2 && p2Alive) {
    cachedP2Rect = player2.getBoundingClientRect();
  }
  
  const p1Rect = cachedP1Rect;
  const treasureRect = cachedTreasureRect;

  // Validate rects exist and have valid dimensions (works for all character sizes)
  if (!p1Rect || !treasureRect || p1Rect.width === 0 || treasureRect.width === 0) {
    return; // Skip collision check if rects are invalid
  }

  // Check if treasure has moved (reset collection flag if treasure position changed)
  const currentTreasurePos = `${treasure.style.left},${treasure.style.top}`;
  if (lastTreasurePosition !== currentTreasurePos) {
    treasureJustCollected = false;
    lastTreasurePosition = currentTreasurePos;
  }

  // Check treasure collision for player 1 (only if alive and treasure not just collected)
  // Buffer is 0, so collision happens when visual elements overlap (works for all characters)
  if (
    p1Alive &&
    !treasureJustCollected &&
    isOverlappingWithBuffer(
      p1Rect,
      treasureRect,
      COLLISION_BUFFER.treasure
    )
  ) {
    // Get the correct point value from treasure type
    const treasureType = treasure.dataset.type;
    const treasureTypeData = treasureTypes[treasureType];
    const basePoints = treasureTypeData ? treasureTypeData.points : parseFloat(treasure.dataset.points) || 0.5;
    
    const multiplier =
      activePowerUps.player1 && activePowerUps.player1.type === "POINTS"
        ? 2
        : 1;
    const pointsEarned = basePoints * multiplier;
    const oldScore = p1Score;
    
    // Round to 1 decimal place to prevent floating-point precision issues
    p1Score = Math.round((p1Score + pointsEarned) * 10) / 10;
    
    updateDisplay(); // Update display immediately when score changes

    logTreasure(
      player1Name,
      treasureType,
      basePoints,
      multiplier,
      oldScore,
      p1Score
    );
    updateDebugPanel();

    // Mark treasure as collected and move it immediately
    treasureJustCollected = true;
    placeTreasure();
    randomObstacleRespawn(); // Trigger random obstacle respawn
    playAudio(treasureSound()); // Treasure sound
    showMessage(
      `💰 ${player1Name} collected ${
        treasureType
      }! +${pointsEarned.toFixed(1)} points`
    );

    // Check for level progression
    checkLevelProgress();
  }

  // Check treasure collision for player 2 (only if alive and treasure not just collected)
  if (mode === 2 && p2Alive && !treasureJustCollected) {
    const p2Rect = cachedP2Rect;
    // Validate p2Rect exists and has valid dimensions (works for all characters)
    if (p2Rect && p2Rect.width > 0 && 
        isOverlappingWithBuffer(
          p2Rect,
          treasureRect,
          COLLISION_BUFFER.treasure
        )
    ) {
      // Get the correct point value from treasure type
      const treasureType = treasure.dataset.type;
      const treasureTypeData = treasureTypes[treasureType];
      const basePoints = treasureTypeData ? treasureTypeData.points : parseFloat(treasure.dataset.points) || 0.5;
      
      const multiplier =
        activePowerUps.player2 && activePowerUps.player2.type === "POINTS"
          ? 2
          : 1;
      const pointsEarned = basePoints * multiplier;
      const oldScore = p2Score;
      
      // Round to 1 decimal place to prevent floating-point precision issues
      p2Score = Math.round((p2Score + pointsEarned) * 10) / 10;
      
      updateDisplay(); // Update display immediately when score changes

      logTreasure(
        player2Name,
        treasureType,
        basePoints,
        multiplier,
        oldScore,
        p2Score
      );
      updateDebugPanel();

      // Mark treasure as collected and move it immediately
      treasureJustCollected = true;
      placeTreasure();
      randomObstacleRespawn(); // Trigger random obstacle respawn
      playAudio(treasureSound());
      showMessage(
        `💰 ${player2Name} collected ${
          treasureType
        }! +${pointsEarned.toFixed(1)} points`
      );

      // Check for level progression
      checkLevelProgress();
    }
  }

  // Check power-up collisions (only for alive players)
  powerUps.forEach((powerUp, index) => {
    const powerUpRect = powerUp.getBoundingClientRect();

    if (
      p1Alive &&
      isOverlappingWithBuffer(
        cachedP1Rect,
        powerUpRect,
        COLLISION_BUFFER.powerup
      )
    ) {
      activatePowerUp(player1, powerUp.dataset.type);
      powerUp.remove();
      powerUps.splice(index, 1);
    } else if (mode === 2 && p2Alive) {
      if (
        isOverlappingWithBuffer(
          cachedP2Rect,
          powerUpRect,
          COLLISION_BUFFER.powerup
        )
      ) {
        activatePowerUp(player2, powerUp.dataset.type);
        powerUp.remove();
        powerUps.splice(index, 1);
      }
    }
  });

  // Check obstacle collisions
  const currentTime = Date.now();
  let p1Hit = false;
  let p2Hit = false;

  // Check if player can take damage (not in cooldown)
  const p1CanTakeDamage =
    !lastCollisionTime.player1.global ||
    currentTime - lastCollisionTime.player1.global >= COLLISION_COOLDOWN;
  const p2CanTakeDamage =
    !lastCollisionTime.player2.global ||
    currentTime - lastCollisionTime.player2.global >= COLLISION_COOLDOWN;

  obstacles.forEach((obs, obsIndex) => {
    const obsRect = obs.getBoundingClientRect();

    // Player 1 collision - only process if alive, not already hit, and can take damage
    // Using obstacle buffer (22px) to require closer contact for fair gameplay
    if (
      p1Alive &&
      !p1Hit &&
      p1CanTakeDamage &&
      isOverlappingWithBuffer(
        cachedP1Rect,
        obsRect,
        COLLISION_BUFFER.obstacle
      ) &&
      !(
        activePowerUps.player1 && activePowerUps.player1.type === "SHIELD"
      )
    ) {
      p1Lives--;
      updateDisplay(); // Update display immediately when lives change
      p1Hit = true;
      lastCollisionTime.player1.global = currentTime;
      playAudio(obstacleSound); // Hit sound

      // Check if player 1 is knocked out
      if (p1Lives <= 0) {
        p1Alive = false;
        player1.style.opacity = "0.3"; // Dim the dead player
        player1.style.filter = "grayscale(100%)"; // Make them grayscale

        if (mode === 1) {
          // Single player - game over
          showMessage(`💀 ${player1Name} eliminated! Game Over!`);
          logCollision(player1Name, p1Lives, true);
          updateDebugPanel();
          logGameOver("Player 1 out of lives");
          endGame();
        } else if (p2Lives <= 0) {
          // Both players dead in multiplayer
          showMessage(`💀 ${player1Name} eliminated! Both players down!`);
          logCollision(player1Name, p1Lives, true);
          updateDebugPanel();
          logGameOver("Both players out of lives");
          endGame();
        } else {
          // Player 2 still alive - continue game
          showMessage(
            `💀 ${player1Name} eliminated! ${player2Name} continues...`
          );
          logCollision(player1Name, p1Lives, false);
          updateDebugPanel();
        }
      } else {
        showMessage(`💥 ${player1Name} hit obstacle! Lives: ${p1Lives}`);
        logCollision(player1Name, p1Lives, false);
        updateDebugPanel();
      }
    }

    // Player 2 collision - only process if alive, not already hit, and can take damage
    // Using obstacle buffer (22px) to require closer contact for fair gameplay
    if (mode === 2 && p2Alive && !p2Hit && p2CanTakeDamage) {
      const p2Rect = cachedP2Rect || player2.getBoundingClientRect();
      if (
        isOverlappingWithBuffer(
          p2Rect,
          obsRect,
          COLLISION_BUFFER.obstacle
        ) &&
        !(
          activePowerUps.player2 &&
          activePowerUps.player2.type === "SHIELD"
        )
      ) {
        p2Lives--;
        updateDisplay(); // Update display immediately when lives change
        p2Hit = true;
        lastCollisionTime.player2.global = currentTime;
        playAudio(obstacleSound());

        // Check if player 2 is knocked out
        if (p2Lives <= 0) {
          p2Alive = false;
          player2.style.opacity = "0.3"; // Dim the dead player
          player2.style.filter = "grayscale(100%)"; // Make them grayscale

          if (p1Lives <= 0) {
            // Both players dead
            showMessage(
              `💀 ${player2Name} eliminated! Both players down!`
            );
            logCollision(player2Name, p2Lives, true);
            updateDebugPanel();
            logGameOver("Both players out of lives");
            endGame();
          } else {
            // Player 1 still alive - continue game
            showMessage(
              `💀 ${player2Name} eliminated! ${player1Name} continues...`
            );
            logCollision(player2Name, p2Lives, false);
            updateDebugPanel();
          }
        } else {
          showMessage(
            `💥 ${player2Name} hit obstacle! Lives: ${p2Lives}`
          );
          logCollision(player2Name, p2Lives, false);
          updateDebugPanel();
        }
      }
    }
  });
}

// Helper: Get buffered rectangle (shrinks hitbox by buffer pixels on all sides)
function getBufferedRect(rect, buffer) {
  return {
    top: rect.top + buffer,
    bottom: rect.bottom - buffer,
    left: rect.left + buffer,
    right: rect.right - buffer,
  };
}

// Enhanced collision detection with buffer support for more precise hits
// Buffer shrinks the effective collision area, requiring objects to be closer
// For treasure collection (buffer=0), uses direct overlap for all characters
function isOverlappingWithBuffer(rect1, rect2, buffer = 0) {
  // If buffer is 0, use simple overlap check (works for all character sizes)
  if (buffer === 0) {
    return !(
      rect1.top > rect2.bottom ||
      rect1.bottom < rect2.top ||
      rect1.left > rect2.right ||
      rect1.right < rect2.left
    );
  }
  
  // For non-zero buffers, use buffered rects
  const r1 = getBufferedRect(rect1, buffer);
  const r2 = getBufferedRect(rect2, buffer);

  return !(
    r1.top > r2.bottom ||
    r1.bottom < r2.top ||
    r1.left > r2.right ||
    r1.right < r2.left
  );
}

// Keep original function for backward compatibility (zero buffer)
function isOverlapping(rect1, rect2) {
  return isOverlappingWithBuffer(rect1, rect2, 0);
}

function updateDisplay() {
  document.getElementById("timeDisplay").textContent = timeLeft;
  document.getElementById("levelDisplay").textContent = level;
  document.getElementById("highScoreDisplay").textContent = highScore;

  // Always display scores with one decimal place for consistency
  let statsHtml = `${player1Name}: ${p1Score.toFixed(1)} points ❤️ ${p1Lives} lives`;
  if (mode === 2) {
    statsHtml += `<br>${player2Name}: ${p2Score.toFixed(1)} points ❤️ ${p2Lives} lives`;
  }
  document.getElementById("playerStats").innerHTML = statsHtml;
}

function showMessage(text) {
  achievement.innerText = text;
  achievement.style.display = "block";
  setTimeout(() => (achievement.style.display = "none"), 2500);
}

function levelUp() {
  level++;
  timeLeft += 10;
  updateDisplay(); // Update display immediately when time changes

  if (level === 6) {
    p1Lives++;
    if (mode === 2) p2Lives++;
    updateDisplay(); // Update display immediately when lives change
    showMessage("💖 Bonus Life! +1 life added!");
  }

  createObstacles();
  playAudio(achievementSound); // Level up sound
  showMessage(`🎉 Level ${level}! +10 seconds!`);

  // Chance to spawn power-up on level up
  if (level >= 3 && Math.random() < 0.7) {
    setTimeout(createPowerUp, 1000);
  }
}

// Calculate points required for next level based on new progression system
// Level 1→2: 10 pts, Level 2→3: 30 pts (10+20), Level 3→4: 60 pts (30+30), Level 4→5: 100 pts (60+40), etc.
function getPointsForLevel(level) {
  if (level === 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * 10;
  }
  return total;
}

function checkLevelProgress() {
  const maxScore = Math.max(p1Score, mode === 2 ? p2Score : 0);
  const oldLevel = level;

  // Calculate what level the player should be at based on score
  let newLevel = 1;
  while (maxScore >= getPointsForLevel(newLevel + 1)) {
    newLevel++;
  }

  const currentLevelThreshold = getPointsForLevel(level);
  const nextLevelThreshold = getPointsForLevel(level + 1);
  const pointsToNext = nextLevelThreshold - maxScore;

  logLevelCheck(maxScore, level, newLevel);
  gameLogger.addLog(
    `📊 Score: ${maxScore.toFixed(
      1
    )} | Current Level ${level} threshold: ${currentLevelThreshold} | Next Level ${
      level + 1
    } at: ${nextLevelThreshold} | Points needed: ${pointsToNext.toFixed(
      1
    )}`,
    "level"
  );

  if (newLevel > level) {
    level = newLevel;
    timeLeft += 10;
    updateDisplay(); // Update display immediately when time changes

    logLevelUp(oldLevel, level, obstacles.length);
    gameLogger.addLog(
      `🎊 LEVEL UP! ${oldLevel} → ${level} | Score: ${maxScore.toFixed(
        1
      )} | Next level at ${getPointsForLevel(level + 1)} points`,
      "level"
    );
    updateDebugPanel();

    if (level === 6) {
      p1Lives++;
      if (mode === 2) p2Lives++;
      updateDisplay(); // Update display immediately when lives change
      gameLogger.addLog("💖 Bonus Life granted at Level 6!", "level");
      showMessage("💖 Bonus Life! +1 life added!");
    }

    createObstacles();

    // Add special horizontal-moving crocodile
    // Every 5th level up to 25 (5, 10, 15, 20, 25)
    // After level 25, appears every single level (26, 27, 28, 29...)
    if (shouldSpawnSpecialCrocodile(level)) {
      setTimeout(createSpecialCrocodile, 500);
    }

    playAudio(achievementSound());
    showMessage(`🎉 Level ${level}! +10 seconds!`);

    // Chance to spawn power-up on level up
    if (level >= 3 && Math.random() < 0.7) {
      setTimeout(createPowerUp, 1000);
    }
  } else {
    logNoLevelUp(newLevel);
    updateDebugPanel();
  }
}

// Use precise timing for consistent countdown
let lastTickTime = Date.now();

function gameTick() {
  const now = Date.now();
  const elapsed = now - lastTickTime;
  
  // Only decrement time if at least 1000ms have passed (prevents timer drift)
  if (elapsed >= 1000) {
    lastTickTime = now;
    
    if (timeLeft > 0 && (p1Lives > 0 || (mode === 2 && p2Lives > 0))) {
      timeLeft--;
      updateDisplay(); // Update time display immediately for smooth countdown
      
      // Defer heavy operations to avoid blocking timer
      requestAnimationFrame(() => {
        moveObstacles();

        // Apply magnet effects (only for alive players)
        if (p1Alive) applyMagnetEffect(player1);
        if (mode === 2 && p2Alive) applyMagnetEffect(player2);

        // Enforce separation between game elements
        enforceElementSeparation();

        // Spawn power-ups occasionally
        if (Math.random() < 0.02) {
          // 2% chance per second
          createPowerUp();
        }
      });
    } else {
      endGame();
    }
  }
}

function startGame() {
  // Batch DOM reads first (performance optimization)
  const selectedModeButton = document.querySelector(
    ".mode-button.selected"
  );
  const player1NameInput = document.getElementById("player1Name");
  const player2NameInput = document.getElementById("player2Name");
  const pauseBtn = document.getElementById("pauseButton");
  const musicBtn = document.getElementById("playMusicBtn");
  const leaderboardModal = document.getElementById("leaderboardModal");
  const gameHeaderButtons = document.querySelector(
    ".game-header-buttons"
  );

  // Initialize audio (non-blocking)
  initAudio();

  // Read game mode and player names
  mode = parseInt(selectedModeButton.dataset.mode);
  player1Name = player1NameInput.value || "Player 1";
  player2Name = player2NameInput.value || "Player 2";

  // Reset game state (fast operations)
  p1Score = 0;
  p2Score = 0;
  p1Lives = 2;
  p2Lives = 2;
  p1Alive = true;
  p2Alive = true;
  isPaused = false;
  timeLeft = 40;
  level = 1;
  p1X = 100;
  p1Y = 100;
  p2X = 200;
  p2Y = 200;

  // Clear power-ups and reset collision tracking
  activePowerUps = { player1: null, player2: null };
  powerUps.forEach((p) => p.remove());
  powerUps = [];
  lastCollisionTime = { player1: { global: 0 }, player2: { global: 0 } };

  // Batch DOM writes - hide menu elements
  startscreen.style.display = "none";
  if (gameTitle) gameTitle.style.display = "block";
  gameover.style.display = "none";
  if (leaderboardModal) leaderboardModal.style.display = "none";
  
  // Show touch controls on mobile/tablet when game starts
    const touchControls = document.getElementById('touchControls');
    if (touchControls && window.isTouchDevice) {
      touchControls.style.display = 'block';
    }
    if (window.isTouchDevice) {
      requestFullscreenForGame();
      updateOrientationLock();
    }

  // Batch DOM writes - show game elements
  player1.style.opacity = "1";
  player1.style.filter = "none";
  player1.style.display = "block";
  player1.style.left = p1X + "px";
  player1.style.top = p1Y + "px";
  treasure.style.display = "block";
  if (gameHeaderButtons) gameHeaderButtons.style.display = "flex";

  // Reset pause button
  if (pauseBtn) {
    pauseBtn.innerHTML = "⏸ PAUSE";
    pauseBtn.style.background = "rgba(255, 193, 7, 0.8)";
  }

  // Handle player 2 display
  if (mode === 2) {
    player2.style.opacity = "1";
    player2.style.filter = "none";
    player2.style.display = "block";
    player2.style.left = p2X + "px";
    player2.style.top = p2Y + "px";
  } else {
    player2.style.display = "none";
  }

  // Update player appearances and background
  updatePlayerAppearance();
  updateBackgroundPreview(selectedP1Character);

  // Reset treasure collection tracking
  treasureJustCollected = false;
  lastTreasurePosition = null;

  // Place treasure and obstacles
  placeTreasure();
  createObstacles();

  // Update display immediately for first frame
  updateDisplay();

  // Start game timer with precise timing
  clearInterval(timer);
  lastTickTime = Date.now(); // Reset timer reference
  timer = setInterval(gameTick, 100); // Check every 100ms for precision, but only decrement every 1000ms

  // Defer non-critical operations to next frame (performance optimization)
  requestAnimationFrame(() => {
    // Clear debug logs (can be deferred)
    gameLogger.clearAllLogs();
    gameLogger.clearSessionLogs();
    logGameStart(mode, player1Name, player2Name, p1Lives);
    updateDebugPanel();

    // Start background music (deferred to avoid blocking)
    if (!isMuted) {
      startBackgroundMusic();
      isPlaying = true;
      if (musicBtn) {
        musicBtn.textContent = "⏸ Pause Music";
      }
    }
  });
}

// Leaderboard Display Functions
function displayLeaderboard(newEntryId = null) {
  const leaderboardBody = document.getElementById("leaderboardBody");
  const entries = leaderboard.getFormattedLeaderboard();

  leaderboardBody.innerHTML = "";

  entries.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.className = `leaderboard-row position-${entry.position}`;
    row.dataset.entryId = entry.id;

    // Mark new entry for animation
    if (entry.id === newEntryId) {
      row.classList.add("new-entry");
    }

    row.innerHTML = `
      <td class="leaderboard-position">${entry.position}</td>
      <td class="leaderboard-name">${entry.name}</td>
      <td class="leaderboard-score">${entry.score}</td>
      <td class="leaderboard-date">${entry.date}</td>
    `;

    leaderboardBody.appendChild(row);
  });
}

function showLeaderboardWithAnimation(playerName, finalScore) {
  // First, add the score to leaderboard
  const position = leaderboard.addScore(playerName, finalScore);

  console.log(
    `Score submitted: ${playerName} - ${finalScore} points (Position: ${
      position || "Not in top 10"
    })`
  );

  // Show the leaderboard modal
  const modal = document.getElementById("leaderboardModal");
  const gameover = document.getElementById("gameover");

  // Hide game over dialog
  gameover.style.display = "none";

  // Show leaderboard with flex display for proper centering
  modal.style.display = "flex";

  if (position > 0) {
    // Score made it to top 10 - show with animation
    const entries = leaderboard.getFormattedLeaderboard();
    const newEntry = entries.find(
      (entry) => entry.name === playerName && entry.score === finalScore
    );

    if (newEntry) {
      displayLeaderboard(newEntry.id);
      animateScoreInsertion(newEntry.id, position);
    }
  } else {
    // Score didn't make top 10 - show regular leaderboard
    displayLeaderboard();
  }
}

function animateScoreInsertion(newEntryId, position) {
  setTimeout(() => {
    const newRow = document.querySelector(
      `[data-entry-id="${newEntryId}"]`
    );
    if (newRow) {
      // Add insertion animation
      newRow.classList.add("inserting");

      // Animate other rows moving down
      const allRows = document.querySelectorAll(".leaderboard-row");
      allRows.forEach((row, index) => {
        if (row.dataset.entryId !== newEntryId && index >= position - 1) {
          row.classList.add("moving-down");
        }
      });

      // Remove animation classes after animation completes
      setTimeout(() => {
        newRow.classList.remove("inserting");
        allRows.forEach((row) => row.classList.remove("moving-down"));
      }, 800);
    }
  }, 100);
}

function endGame() {
  clearInterval(timer);
  if (movementInterval) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
  keysPressed.clear();
  stopBackgroundMusic();

  let message = `Game Over!<br>${player1Name}: ${p1Score.toFixed(1)} points`;
  if (mode === 2) {
    message += `<br>${player2Name}: ${p2Score.toFixed(1)} points`;
    const winner =
      p1Score > p2Score
        ? player1Name
        : p2Score > p1Score
        ? player2Name
        : "Tie";
    message += `<br><strong>Winner: ${winner}</strong>`;
  }

  const bestScore = Math.max(p1Score, p2Score || 0);
  const bestPlayerName =
    p1Score >= (p2Score || 0) ? player1Name : player2Name;

  if (bestScore > highScore) {
    highScore = bestScore;
    localStorage.setItem("treasureHighScore", highScore);
    message += "<br>🎉 NEW HIGH SCORE!";
  }

  playAudio(gameoverSound()); // Game over sound

  // Show initial game over message briefly, then show leaderboard
  gameover.style.display = "block";
  gameover.innerHTML = `
  ${message}<br><br>
  <div style="color: #FFD700; font-size: 18px;">📊 Updating Leaderboard...</div>
`;

  // After 2 seconds, show the leaderboard with animation
  setTimeout(() => {
    showLeaderboardWithAnimation(bestPlayerName, bestScore);
  }, 2000);
}

function backToMenu() {
  clearInterval(timer);
  if (movementInterval) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
  keysPressed.clear();
  stopBackgroundMusic();

  player1.style.display = "none";
  player2.style.display = "none";
  treasure.style.display = "none";
  document.querySelector(".game-header-buttons").style.display = "none";
  powerUpStatus.style.display = "none";
  gameover.style.display = "none";
  document.getElementById("leaderboardModal").style.display = "none"; // Hide leaderboard
  
  // Hide touch controls when game ends
  const touchControls = document.getElementById('touchControls');
  if (touchControls && window.isTouchDevice) {
    touchControls.style.display = 'none';
  }

  obstacles.forEach((obs) => obs.remove());
  obstacles = [];
  powerUps.forEach((p) => p.remove());
  powerUps = [];

  startscreen.style.display = "block";
  if (gameTitle) gameTitle.style.display = "none"; // Hide game title when returning to menu
}

// Exit game function - returns to start screen
function exitGame() {
  // Show confirmation dialog
  if (
    confirm(
      "Are you sure you want to exit the game? Your progress will be lost."
    )
  ) {
    playAudio(menuClickSound());
    backToMenu();
  }
}

// Key state tracking for simultaneous movement
const keysPressed = new Set();
let movementInterval = null;
let isPaused = false; // Track pause state

// Track key press states
document.addEventListener("keydown", (e) => {
  keysPressed.add(e.key.toLowerCase());

  // Handle non-movement keys immediately
  if (e.key === "Escape") {
    const pauseBtn = document.getElementById("pauseButton");

    if (timer) {
      // PAUSE the game
      isPaused = true;
      clearInterval(timer);
      timer = null;
      // Stop movement interval to freeze player movement
      if (movementInterval) {
        clearInterval(movementInterval);
        movementInterval = null;
      }
      keysPressed.clear(); // Clear all key presses
      pauseBtn.innerHTML = "▶ RESUME";
      pauseBtn.style.background = "rgba(40, 167, 69, 0.8)";
      showMessage("⏸ Game Paused - Press ESC to resume");
    } else {
      // RESUME the game
      isPaused = false;
      lastTickTime = Date.now(); // Reset timer reference on resume
      timer = setInterval(gameTick, 100); // Check every 100ms for precision
      pauseBtn.innerHTML = "⏸ PAUSE";
      pauseBtn.style.background = "rgba(255, 193, 7, 0.8)";
      showMessage("▶ Game Resumed");
    }
    return;
  }

  // Start movement processing if not already running and game is not paused
  if (!isPaused && !movementInterval) {
    movementInterval = setInterval(processMovement, 16); // ~60fps
  }
});

document.addEventListener("keyup", (e) => {
  keysPressed.delete(e.key.toLowerCase());

  // Stop movement processing if no movement keys are pressed
  const movementKeys = [
    "arrowright",
    "arrowleft",
    "arrowup",
    "arrowdown",
    "w",
    "a",
    "s",
    "d",
  ];
  const hasMovementKeys = movementKeys.some((key) =>
    keysPressed.has(key)
  );

  if (!hasMovementKeys && movementInterval) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
});

// Process movement for both players simultaneously
function processMovement() {
  // Exit early if game is paused
  if (isPaused) {
    return;
  }

  if ((p1Lives <= 0 && (mode === 1 || p2Lives <= 0)) || timeLeft <= 0) {
    if (movementInterval) {
      clearInterval(movementInterval);
      movementInterval = null;
    }
    return;
  }

  const speedMultiplier =
    activePowerUps.player1 && activePowerUps.player1.type === "SPEED"
      ? 2
      : 1;
  const speedMultiplier2 =
    activePowerUps.player2 && activePowerUps.player2.type === "SPEED"
      ? 2
      : 1;

  let moved = false;

  // Player 1 movement (Arrow Keys) - only if alive
  if (p1Alive) {
    if (keysPressed.has("arrowright")) {
      p1X += moveStep * speedMultiplier;
      p1FacingLeft = false;
      moved = true;
    }
    if (keysPressed.has("arrowleft")) {
      p1X -= moveStep * speedMultiplier;
      p1FacingLeft = true;
      moved = true;
    }
    if (keysPressed.has("arrowup")) {
      p1Y -= moveStep * speedMultiplier;
      moved = true;
    }
    if (keysPressed.has("arrowdown")) {
      p1Y += moveStep * speedMultiplier;
      moved = true;
    }
  }

  // Player 2 movement (WASD Keys) - only if alive
  if (mode === 2 && p2Alive) {
    if (keysPressed.has("d")) {
      p2X += moveStep * speedMultiplier2;
      p2FacingLeft = false;
      moved = true;
    }
    if (keysPressed.has("a")) {
      p2X -= moveStep * speedMultiplier2;
      p2FacingLeft = true;
      moved = true;
    }
    if (keysPressed.has("w")) {
      p2Y -= moveStep * speedMultiplier2;
      moved = true;
    }
    if (keysPressed.has("s")) {
      p2Y += moveStep * speedMultiplier2;
      moved = true;
    }
  }

  // Initialize touch controls for mobile/tablet
  function initTouchControls() {
    if (!isTouchDevice) return;
    
    const touchControls = document.getElementById('touchControls');
    if (!touchControls) return;
    
    // Touch controls will be shown/hidden when game starts/ends
    // Don't show here - wait for game to start
    
    const dpadButtons = touchControls.querySelectorAll('.dpad-button');
    
    dpadButtons.forEach(button => {
      const direction = button.dataset.direction;
      
      // Touch start - add to keysPressed
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        // Check if game is running by checking if timer exists
        if (isPaused || !timer) return;
        keysPressed.add(direction);
        button.classList.add('pressed');
        
        // Start movement processing if not already running
        if (!movementInterval) {
          movementInterval = setInterval(processMovement, 16); // ~60fps
        }
      }, { passive: false });
      
      // Touch end - remove from keysPressed
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        keysPressed.delete(direction);
        button.classList.remove('pressed');
        
        // Stop movement if no keys pressed
        if (keysPressed.size === 0 && movementInterval) {
          clearInterval(movementInterval);
          movementInterval = null;
        }
      }, { passive: false });
      
      // Touch cancel - remove from keysPressed
      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        keysPressed.delete(direction);
        button.classList.remove('pressed');
        
        // Stop movement if no keys pressed
        if (keysPressed.size === 0 && movementInterval) {
          clearInterval(movementInterval);
          movementInterval = null;
        }
      }, { passive: false });
      
    });
  }
  
  // Initialize touch controls when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTouchControls);
  } else {
    initTouchControls();
  }


  if (moved) {
    // Keep players in bounds with smooth screen wrapping
    const game = document.getElementById("game");
    let p1Wrapped = false;
    let p2Wrapped = false;

    // Player 1 screen wrapping with smooth transition
    if (p1X < -30) {
      p1X = game.clientWidth - 30;
      p1Wrapped = true;
    } else if (p1X > game.clientWidth - 30) {
      p1X = -30;
      p1Wrapped = true;
    }
    if (p1Y < -30) {
      p1Y = game.clientHeight - 30;
      p1Wrapped = true;
    } else if (p1Y > game.clientHeight - 30) {
      p1Y = -30;
      p1Wrapped = true;
    }

    // Player 2 screen wrapping with smooth transition
    if (mode === 2) {
      if (p2X < -30) {
        p2X = game.clientWidth - 30;
        p2Wrapped = true;
      } else if (p2X > game.clientWidth - 30) {
        p2X = -30;
        p2Wrapped = true;
      }
      if (p2Y < -30) {
        p2Y = game.clientHeight - 30;
        p2Wrapped = true;
      } else if (p2Y > game.clientHeight - 30) {
        p2Y = -30;
        p2Wrapped = true;
      }
    }

    // Apply smooth wrapping effect
    if (p1Wrapped) {
      player1.style.transition = "opacity 0.15s ease-in-out";
      player1.style.opacity = "0.3";
      setTimeout(() => {
        player1.style.opacity = "1";
        setTimeout(() => {
          player1.style.transition = "none";
        }, 150);
      }, 50);
    }

    if (p2Wrapped && mode === 2) {
      player2.style.transition = "opacity 0.15s ease-in-out";
      player2.style.opacity = "0.3";
      setTimeout(() => {
        player2.style.opacity = "1";
        setTimeout(() => {
          player2.style.transition = "none";
        }, 150);
      }, 50);
    }

    // Update player positions
    player1.style.left = p1X + "px";
    player1.style.top = p1Y + "px";
    player2.style.left = p2X + "px";
    player2.style.top = p2Y + "px";

    // Update player appearance (facing direction)
    updatePlayerAppearance();

    // Check collisions
    checkCollisions();
  }
}

// Exit button
document.getElementById("exitButton").addEventListener("click", () => {
  exitGame();
});

// Pause button
document.getElementById("pauseButton").addEventListener("click", () => {
  const pauseBtn = document.getElementById("pauseButton");

  if (timer) {
    // PAUSE the game
    isPaused = true;
    clearInterval(timer);
    timer = null;
    // Stop movement interval to freeze player movement
    if (movementInterval) {
      clearInterval(movementInterval);
      movementInterval = null;
    }
    keysPressed.clear(); // Clear all key presses
    pauseBtn.innerHTML = "▶ RESUME";
    pauseBtn.style.background = "rgba(40, 167, 69, 0.8)";
    showMessage("⏸ Game Paused");
  } else {
    // RESUME the game
    isPaused = false;
    lastTickTime = Date.now(); // Reset timer reference on resume
    timer = setInterval(gameTick, 100); // Check every 100ms for precision
    pauseBtn.innerHTML = "⏸ PAUSE";
    pauseBtn.style.background = "rgba(255, 193, 7, 0.8)";
    showMessage("▶ Game Resumed");
  }
});

// Debug toggle button
document.getElementById("debugToggle").addEventListener("click", () => {
  toggleDebugPanel();
});

// Initialize when page loads
document.addEventListener("DOMContentLoaded", init);

// Also initialize immediately if DOM is already loaded
if (document.readyState !== "loading") {
  init();
}
