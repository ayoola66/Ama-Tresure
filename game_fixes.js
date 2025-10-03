// Game initialization and coordinate system fixes
let gameInitialized = false;

function initializeGameElements() {
  if (gameInitialized) return;

  // Set game container relative positioning
  const game = document.getElementById('game');
  game.style.position = 'relative';
  
  // Hide legacy scoreboard
  if (scoreboard) scoreboard.style.display = 'none';
  
  // Ensure all sprites are in the game container
  [player1, player2, treasure].forEach(sprite => {
    if (sprite && sprite.parentElement !== game) {
      sprite.style.position = 'absolute';
      game.appendChild(sprite);
    }
  });

  gameInitialized = true;
}

function randomPosition() {
  const game = document.getElementById('game');
  // Use relative coordinates within the game box
  const x = Math.random() * (game.clientWidth - 60);
  const y = Math.random() * (game.clientHeight - 60);
  return { x, y };
}

function handleScreenWrap(x, y, element) {
  const game = document.getElementById('game');
  if (x < 0) x = game.clientWidth - 60;
  if (x > game.clientWidth - 60) x = 0;
  if (y < 0) y = game.clientHeight - 60;
  if (y > game.clientHeight - 60) y = 0;
  
  element.style.left = x + "px";
  element.style.top = y + "px";
  
  return { x, y };
}

function moveObstacles() {
  const game = document.getElementById('game');
  obstacles.forEach(obs => {
    const currentLeft = parseFloat(obs.style.left);
    const currentTop = parseFloat(obs.style.top);
    const dx = parseFloat(obs.dataset.dx);
    
    // Move horizontally
    let newLeft = currentLeft + dx;
    
    // Bounce off walls
    if (newLeft <= 0 || newLeft >= game.clientWidth - 60) {
      obs.dataset.dx = -dx;
      newLeft = currentLeft - dx;
    }
    
    // Apply movement
    obs.style.left = newLeft + "px";
    
    // If level 5+, add tracking
    if (level >= 5) {
      const target = mode === 2 ? 
        (Math.random() < 0.5 ? player1 : player2) : 
        player1;
      
      const targetRect = target.getBoundingClientRect();
      const obsRect = obs.getBoundingClientRect();
      
      // Calculate direction to player
      const tdx = targetRect.left - obsRect.left;
      const tdy = targetRect.top - obsRect.top;
      const dist = Math.sqrt(tdx * tdx + tdy * tdy);
      
      if (dist < levelSettings.trackingRange) {
        const strength = levelSettings.baseTrackingStrength + 
          (level - 5) * levelSettings.trackingLevelBonus;
        
        const moveY = (tdy / dist) * strength;
        obs.style.top = (currentTop + moveY) + "px";
      }
    }
  });
}