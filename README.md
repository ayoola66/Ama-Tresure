Ama Treasure Adventure

An engaging, top-down treasure hunting game built with HTML, CSS, and JavaScript. Navigate around a beautiful treasure island, collect various treasures, and survive increasing challenges before time runs out. The game features both single-player and two-player competitive modes, with progressive difficulty and exciting power-ups that appear from level 3 onwards.

# Run this in your project directory terminal:

python3 -m http.server 8000

# Then visit:

http://localhost:8000/play_index.html

## Game Features

### Core Gameplay

- **Single-player and two-player competitive modes**: Choose your adventure style
- **Simultaneous keyboard controls**: Both players can move at the same time on one keyboard
- **Dynamic treasure collection system**: Multiple treasure types with different point values
- **Progressive difficulty**: Each level brings more obstacles and challenges
- **Screen-wrapping movement**: Players can move off one edge and appear on the opposite side
- **Real-time scoring and stats tracking**: Live updates of time, level, score, and lives
- **Smooth character movement**: Responsive controls with visual feedback

### Audio System (Browser-Compatible)

- **High-quality MP3 audio**: Real background music and sound effects with procedural fallback
- **Collapsible audio panel**: Clean, toggle-able music settings panel in top-right corner
- **Dynamic sound effects**: Different tones for various game actions (treasure collection, power-ups, collisions)
- **Independent volume controls**: Separate sliders for music and sound effects with real-time adjustment
- **Smart interface design**: Audio controls stay out of gameplay area but remain easily accessible
- **Mute functionality**: Master toggle for all audio on/off
- **Real-time audio feedback**: Immediate sound response to player actions

### Power-ups System (Level 3+)

- **🧲 Magnet Power**: Attracts nearby treasures automatically with visual pulse effect
- **⚡ Speed Boost**: Temporary 2x movement speed for faster navigation
- **🛡️ Shield**: Temporary invincibility against obstacles
- **✨ Point Multiplier**: Double points for all treasures collected during duration

### Treasure Types

- **💰 Common Coins**: 1 point each, 60% spawn rate
- **⚪ Silver Treasure**: 3 points each, 25% spawn rate
- **🌟 Gold Treasure**: 5 points each, 10% spawn rate
- **💎 Rare Gems**: 10 points each, 5% spawn rate

## Level Progression

### Level 1-2: Introduction

- **2 obstacles** with basic random movement
- Standard movement speed for obstacles and players
- Only basic treasure types (mostly coins)
- No power-ups available yet

### Level 3-4: Power-ups Introduced!

- **3 obstacles** with more aggressive movement patterns
- **Power-ups begin spawning**: 🧲 Magnet and ⚡ Speed available
- Obstacles start showing slight tracking behaviour towards players
- More varied treasure types appear
- **Real jeopardy**: Obstacles move faster and more unpredictably

### Level 5-6: Advanced Tracking

- **4-5 obstacles** with enhanced AI tracking
- Obstacles actively pursue players within range
- **🛡️ Shield and ✨ Point Multiplier power-ups** become available
- **Bonus life awarded at Level 6** for both players
- Obstacles bounce off walls more aggressively

### Level 7+: Maximum Challenge

- **6+ obstacles** with sophisticated tracking behaviour
- Fast-moving obstacles with advanced pursuit AI
- Higher power-up spawn rates (up to 2 active at once)
- Maximum difficulty with strategic gameplay required
- Obstacles coordinate movement patterns

### Character Selection

- **Multiple character options**: Choose from different character emojis before starting
- **Independent selection**: Each player can pick their own character in 2-player mode
- **Visual customization**: Characters appear throughout the game with your chosen emoji
- **Directional facing**: Characters automatically flip to face movement direction

## Controls

### Player 1

- Arrow Keys (Up, Down, Left, Right) to move
- Character automatically faces movement direction (especially left/right)
- Choose from multiple character options before starting
- Collect treasures by touching them
- Avoid or use power-ups strategically

### Player 2 (2-player mode)

- WASD keys (W=Up, A=Left, S=Down, D=Right)
- Same movement mechanics as Player 1
- Independent character selection from Player 1
- **Simultaneous movement**: Both players can move at the same time on one keyboard
- Compete for treasures and points

## Special Features

### Time Bonuses

- Level Up: +10 seconds every 5 points
- Score Bonus: +5 seconds (at 15+ points, every 5 points)
- Power-up Duration: Varies by type

### Obstacles Behaviour

- **🐊 Crocodiles, 🔥 Fire, 🥥 Coconuts**: Three types with bouncing animations
- **Dynamic respawn**: Obstacles disappear and reappear randomly when treasures are collected
- **Directional facing**: Crocodiles face their movement direction for enhanced realism
- **Level 1-2**: Simple random movement patterns
- **Level 3+**: Enhanced movement with player attraction within 200px range
- **Level 5+**: Sophisticated tracking AI that predicts player movement
- **Wall bouncing**: Obstacles reverse direction when hitting boundaries
- **Quantity scaling**: 2 → 3 → 4 → 5 → 6+ obstacles as levels progress

### User Interface

- **Clean island theme**: Beautiful treasure island background
- **Real-time HUD**: Time, level, high score, and player stats always visible
- **Power-up status display**: Shows active power-ups and remaining duration
- **Collapsible audio panel**: Toggle-able music settings with smooth animations (top-right 🎵 button)
- **Smart UI design**: Audio controls expand/collapse without interfering with gameplay
- **Auto-close functionality**: Audio panel closes automatically when clicking outside
- **Achievement notifications**: Sliding notifications for game events
- **Separate Exit/Pause buttons**: Distinct controls for pausing game vs. returning to menu

## Getting Started

1. **Open the game**: Load `play_index.html` in your web browser
2. **Select game mode**: Choose Single Player or Two Players
3. **Enter player names**: Customise your player identities
4. **Read the tutorial**: Expand "How to Play" for detailed instructions
5. **Start playing**: Click "🚀 Play Game" to begin your adventure
6. **Adjust audio**: Click the 🎵 button (top-right) to open/close music settings panel
7. **Pause anytime**: Press ESC or click the PAUSE button; use EXIT to return to menu

## Tips for Success

- **Power-up strategy**: Save shields for high-obstacle levels, use magnets when treasures are far
- **Level 3+ awareness**: Obstacles become much more dangerous - stay mobile!
- **Two-player coordination**: Share power-ups strategically and don't compete destructively
- **Simultaneous movement**: Both players can move at the same time - no keyboard conflicts!
- **Magnet timing**: Use magnet power-ups when treasures spawn in dangerous areas
- **Screen wrapping**: Use edge-to-edge teleportation to escape pursuing obstacles
- **Audio optimization**: Use the 🎵 button to adjust music/effects volumes for better focus
- **Audio cues**: Listen for different sounds to know what's happening without looking
- **Character choice**: Pick characters that are visually distinct in 2-player mode
- **Dynamic obstacles**: Expect obstacles to respawn after treasure collection - stay alert!
