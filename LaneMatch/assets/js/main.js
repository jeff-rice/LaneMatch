// Fisher-Yates shuffle algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateAssignments() {
  const startLane = parseInt(document.getElementById('startLane').value);
  const numLanes = parseInt(document.getElementById('numLanes').value);
  const bowlersPerLane = parseInt(document.getElementById('bowlersPerLane').value);

  if (
    startLane < 1 ||
    startLane > 80 ||
    numLanes < 1 ||
    numLanes > 80 ||
    startLane + numLanes - 1 > 80 ||
    bowlersPerLane < 1 ||
    bowlersPerLane > 6
  ) {
    alert(
      'Invalid configuration. Ensure:\n- Start lane: 1-80\n- Number of lanes: 1-80\n- Total lanes ≤ 80\n- Bowlers per lane: 1-6'
    );
    return;
  }

  const LANES = Array.from({ length: numLanes }, (_, i) => startLane + i);
  const input = document.getElementById('namesInput').value.trim();
  const bowlers = input.split('\n').filter((name) => name.trim());
  const totalSlots = numLanes * bowlersPerLane;

  if (bowlers.length > totalSlots) {
    alert(
      `Too many bowlers (${bowlers.length}). Maximum is ${totalSlots} for ${numLanes} lanes with ${bowlersPerLane} per lane.`
    );
    return;
  }
  
  // Modified check: Only verify we have at least 1 bowler
  if (bowlers.length < 1) {
    alert('Please enter at least one bowler name.');
    return;
  }

  // Use the league-specific function to load previous assignments
  const previousAssignments = window.loadPreviousAssignments ? window.loadPreviousAssignments() : [];
  const lastWeek =
    previousAssignments.length > 0
      ? previousAssignments[previousAssignments.length - 1].lanes
      : null;

  let assignments = {};
  let availableBowlers = shuffle([...bowlers]);
  let maxAttempts = bowlers.length * 15; // Increased attempts for uneven distributions
  let attempts = 0;

  // Initialize assignments for each lane
  for (let lane of LANES) {
    assignments[lane] = [];
  }

  // Keep trying to assign all bowlers
  while (availableBowlers.length > 0 && attempts < maxAttempts) {
    for (let lane of LANES) {
      if (availableBowlers.length === 0) break;
      if (assignments[lane].length >= bowlersPerLane) continue;

      let candidateAssigned = false;
      let candidateIndex = 0;

      while (candidateIndex < availableBowlers.length) {
        const candidate = availableBowlers[candidateIndex];
        let hasConflict = false;

        if (lastWeek) {
          const lastLane = Object.entries(lastWeek).find(([_, bowlers]) =>
            bowlers.includes(candidate)
          )?.[0];
          
          // Skip if no last lane found (might be a new bowler)
          if (lastLane) {
            const lastOpponents =
              lastWeek[lastLane]?.filter((b) => b !== candidate) || [];

            // Check if the bowler was on this lane last week
            const laneNumber = parseInt(lane);
            const lastLaneNumber = parseInt(lastLane);
            
            // Avoid placing on the same lane as last week
            if (lastLaneNumber === laneNumber) {
              hasConflict = true;
            } 
            // Also avoid placing on cross lanes if they're a pair (even-odd)
            else if (
              Math.floor(laneNumber / 2) === Math.floor(lastLaneNumber / 2) && 
              Math.abs(laneNumber - lastLaneNumber) === 1
            ) {
              hasConflict = true;
            }
            
            // Avoid pairing with previous opponents
            if (assignments[lane].some((b) => lastOpponents.includes(b))) {
              hasConflict = true;
            }
          }
        }

        if (!hasConflict) {
          assignments[lane].push(candidate);
          availableBowlers.splice(candidateIndex, 1);
          candidateAssigned = true;
          break;
        } else {
          candidateIndex++;
        }
      }

      // If we couldn't assign a bowler to this lane, reshuffle and try again
      if (!candidateAssigned && availableBowlers.length > 0) {
        availableBowlers = shuffle(availableBowlers);
        attempts++;
      }
    }
    
    // If we've done a complete pass through all lanes and still have bowlers,
    // prioritize filling lanes with fewer bowlers first in the next iteration
    if (availableBowlers.length > 0) {
      // Resort lanes to prioritize emptier lanes
      LANES.sort((a, b) => assignments[a].length - assignments[b].length);
    }
  }

  if (availableBowlers.length > 0) {
    alert(
      `Warning: Could not assign ${
        availableBowlers.length
      } bowlers due to conflicts: ${availableBowlers.join(', ')}`
    );
  }

  // Render the assignments with styling
  displayAssignments(assignments);

  // Save assignments to history using league-specific function if available
  if (window.saveAssignments) {
    window.saveAssignments(assignments);
  } else {
    let history = loadPreviousAssignments();
    history.push(assignments);
    localStorage.setItem('bowlingHistory', JSON.stringify(history));
  }
}

function displayAssignments(assignments) {
  const output = document.getElementById('assignmentsOutput');
  output.innerHTML = '';
  
  // Add current date/time
  const dateDisplay = document.createElement('p');
  dateDisplay.textContent = `Generated on: ${new Date().toLocaleString()}`;
  dateDisplay.style.fontStyle = 'italic';
  dateDisplay.style.marginBottom = '15px';
  output.appendChild(dateDisplay);
  
  // Sort lanes numerically
  const sortedLanes = Object.keys(assignments).sort((a, b) => parseInt(a) - parseInt(b));
  
  for (let lane of sortedLanes) {
    const div = document.createElement('div');
    div.className = 'lane';
    
    // Create lane number with icon
    const laneNumber = document.createElement('strong');
    laneNumber.innerHTML = `<i class="fas fa-bowling-ball"></i> Lane ${lane}: `;
    div.appendChild(laneNumber);
    
    // Add bowler names
    const bowlerNames = document.createTextNode(assignments[lane].join(', '));
    div.appendChild(bowlerNames);
    
    output.appendChild(div);
  }
}

function clearHistory() {
  // Use league-specific function if available
  if (window.clearLeagueHistory) {
    window.clearLeagueHistory();
  } else {
    if (confirm('Are you sure you want to clear assignment history?')) {
      localStorage.removeItem('bowlingHistory');
      document.getElementById('assignmentsOutput').innerHTML = '';
      alert('Assignment history cleared');
    }
  }
}

// Add event listeners when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get the button elements
  const generateBtn = document.getElementById('generateBtn');
  const clearBtn = document.getElementById('clearBtn');
  
  // Add event listeners if buttons exist
  if (generateBtn) {
    generateBtn.addEventListener('click', generateAssignments);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearHistory);
  }
});