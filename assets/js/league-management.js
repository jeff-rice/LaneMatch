// League Management System

// Object to store current active league
let activeLeague = {
    id: '',
    name: ''
  };
  
  // Function to initialize league management system
  function initLeagueManager() {
    // Create league manager UI
    createLeagueManagerUI();
    
    // Load leagues from localStorage
    loadLeagues();
    
    // Set event listeners
    setLeagueEventListeners();
  }
  
  // Function to create league manager UI
  function createLeagueManagerUI() {
    // Create league manager container
    const configSection = document.querySelector('.input-section');
    const configHeading = configSection.querySelector('h2');
    
    // Insert league manager before configuration
    const leagueManagerHTML = `
      <div class="league-manager">
        <h2><i class="fas fa-trophy"></i> League Management</h2>
        <div class="league-controls">
          <div class="league-selector">
            <label for="leagueSelect">Select League:</label>
            <select id="leagueSelect">
              <option value="">-- Select a League --</option>
            </select>
          </div>
          <div class="league-actions">
            <button id="createLeagueBtn" class="secondary league-btn">
              <i class="fas fa-plus"></i> New League
            </button>
            <button id="manageLeagueBtn" class="secondary league-btn">
              <i class="fas fa-cog"></i> Manage
            </button>
          </div>
        </div>
      </div>
    `;
    
    configSection.insertAdjacentHTML('afterbegin', leagueManagerHTML);
  }
  
  // Function to load leagues from localStorage
  function loadLeagues() {
    const leagueSelect = document.getElementById('leagueSelect');
    const leagues = JSON.parse(localStorage.getItem('bowlingLeagues')) || [];
    
    // Clear existing options (except the default)
    while (leagueSelect.options.length > 1) {
      leagueSelect.remove(1);
    }
    
    // Add league options
    leagues.forEach(league => {
      const option = document.createElement('option');
      option.value = league.id;
      option.textContent = league.name;
      leagueSelect.appendChild(option);
    });
    
    // Check if there's an active league in session storage
    const activeLeagueId = sessionStorage.getItem('activeLeagueId');
    if (activeLeagueId) {
      leagueSelect.value = activeLeagueId;
      const selectedLeague = leagues.find(league => league.id === activeLeagueId);
      if (selectedLeague) {
        setActiveLeague(selectedLeague);
      }
    }
  }
  
  // Function to create a new league
  function createLeague() {
    const leagueName = prompt('Enter a name for the new league:');
    if (!leagueName) return; // User cancelled
    
    // Generate unique ID
    const leagueId = 'league_' + Date.now();
    
    // Create new league object
    const newLeague = {
      id: leagueId,
      name: leagueName
    };
    
    // Save to localStorage
    const leagues = JSON.parse(localStorage.getItem('bowlingLeagues')) || [];
    leagues.push(newLeague);
    localStorage.setItem('bowlingLeagues', JSON.stringify(leagues));
    
    // Reload leagues dropdown
    loadLeagues();
    
    // Select the new league
    document.getElementById('leagueSelect').value = leagueId;
    setActiveLeague(newLeague);
  }
  
  // Function to set the active league
  function setActiveLeague(league) {
    activeLeague = league;
    sessionStorage.setItem('activeLeagueId', league.id);
    
    // Update UI to reflect active league
    document.title = `${league.name} - Bowling Lane Assignment Generator`;
    
    // Clear current assignments display
    document.getElementById('assignmentsOutput').innerHTML = '';
    
    // Load league-specific names if available
    const leagueData = JSON.parse(localStorage.getItem(`leagueData_${league.id}`)) || {};
    if (leagueData.bowlerNames) {
      document.getElementById('namesInput').value = leagueData.bowlerNames.join('\n');
    }
    
    // Load league-specific configuration if available
    if (leagueData.config) {
      document.getElementById('startLane').value = leagueData.config.startLane || 1;
      document.getElementById('numLanes').value = leagueData.config.numLanes || 12;
      document.getElementById('bowlersPerLane').value = leagueData.config.bowlersPerLane || 2;
    }
  }
  
  // Function to save league-specific data
  function saveLeagueData() {
    if (!activeLeague.id) return;
    
    // Get current bowler names
    const namesInput = document.getElementById('namesInput').value;
    const bowlerNames = namesInput.split('\n').filter(name => name.trim());
    
    // Get current configuration
    const config = {
      startLane: document.getElementById('startLane').value,
      numLanes: document.getElementById('numLanes').value,
      bowlersPerLane: document.getElementById('bowlersPerLane').value
    };
    
    // Save to localStorage
    const leagueData = {
      bowlerNames,
      config
    };
    
    localStorage.setItem(`leagueData_${activeLeague.id}`, JSON.stringify(leagueData));
  }
  
  // Function to load previous assignments for active league
  function loadPreviousAssignments() {
    if (!activeLeague.id) return [];
    
    const saved = localStorage.getItem(`bowlingHistory_${activeLeague.id}`);
    return saved ? JSON.parse(saved) : [];
  }
  
  // Function to save assignments for active league
  function saveAssignments(assignments) {
    if (!activeLeague.id) return;
    
    let history = loadPreviousAssignments();
    
    // Add timestamp to this assignment set
    const assignmentWithTimestamp = {
      date: new Date().toLocaleString(),
      lanes: assignments
    };
    
    history.push(assignmentWithTimestamp);
    localStorage.setItem(`bowlingHistory_${activeLeague.id}`, JSON.stringify(history));
    
    // Also save the current bowler list and configuration
    saveLeagueData();
  }
  
  // Function to clear history for active league
  function clearLeagueHistory() {
    if (!activeLeague.id) return;
    
    if (confirm(`Are you sure you want to clear assignment history for ${activeLeague.name}?`)) {
      localStorage.removeItem(`bowlingHistory_${activeLeague.id}`);
      document.getElementById('assignmentsOutput').innerHTML = '';
      alert(`Assignment history cleared for ${activeLeague.name}`);
    }
  }
  
  // Function to delete a league
  function deleteLeague() {
    if (!activeLeague.id) return;
    
    if (confirm(`Are you sure you want to delete the league "${activeLeague.name}"?\nThis will remove all history and data for this league.`)) {
      // Remove league from list
      const leagues = JSON.parse(localStorage.getItem('bowlingLeagues')) || [];
      const updatedLeagues = leagues.filter(league => league.id !== activeLeague.id);
      localStorage.setItem('bowlingLeagues', JSON.stringify(updatedLeagues));
      
      // Remove league data
      localStorage.removeItem(`leagueData_${activeLeague.id}`);
      localStorage.removeItem(`bowlingHistory_${activeLeague.id}`);
      
      // Reset active league
      activeLeague = { id: '', name: '' };
      sessionStorage.removeItem('activeLeagueId');
      
      // Reload leagues dropdown
      loadLeagues();
      
      // Clear assignments display
      document.getElementById('assignmentsOutput').innerHTML = '';
      
      alert('League deleted successfully');
    }
  }
  
  // Show league management modal
  function showLeagueManagementModal() {
    if (!activeLeague.id) {
      alert('Please select a league first');
      return;
    }
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('leagueManagementModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'leagueManagementModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Manage League: <span id="modalLeagueName"></span></h2>
          <div class="modal-actions">
            <button id="renameLeagueBtn">
              <i class="fas fa-edit"></i> Rename League
            </button>
            <button id="deleteLeagueBtn" class="danger">
              <i class="fas fa-trash"></i> Delete League
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add event listeners
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      modal.querySelector('#renameLeagueBtn').addEventListener('click', () => {
        renameLeague();
        modal.style.display = 'none';
      });
      
      modal.querySelector('#deleteLeagueBtn').addEventListener('click', () => {
        deleteLeague();
        modal.style.display = 'none';
      });
    }
    
    // Update modal content
    document.getElementById('modalLeagueName').textContent = activeLeague.name;
    
    // Show modal
    modal.style.display = 'block';
  }
  
  // Function to rename a league
  function renameLeague() {
    if (!activeLeague.id) return;
    
    const newName = prompt('Enter a new name for the league:', activeLeague.name);
    if (!newName) return; // User cancelled
    
    // Update league name
    const leagues = JSON.parse(localStorage.getItem('bowlingLeagues')) || [];
    const leagueIndex = leagues.findIndex(league => league.id === activeLeague.id);
    
    if (leagueIndex !== -1) {
      leagues[leagueIndex].name = newName;
      localStorage.setItem('bowlingLeagues', JSON.stringify(leagues));
      
      // Update active league
      activeLeague.name = newName;
      
      // Reload leagues dropdown
      loadLeagues();
      
      // Update document title
      document.title = `${newName} - Bowling Lane Assignment Generator`;
    }
  }
  
  // Set event listeners for league management
  function setLeagueEventListeners() {
    // Create league button
    document.getElementById('createLeagueBtn').addEventListener('click', createLeague);
    
    // Manage league button
    document.getElementById('manageLeagueBtn').addEventListener('click', showLeagueManagementModal);
    
    // League selection
    document.getElementById('leagueSelect').addEventListener('change', function() {
      const leagueId = this.value;
      if (!leagueId) {
        // No league selected
        activeLeague = { id: '', name: '' };
        sessionStorage.removeItem('activeLeagueId');
        document.getElementById('assignmentsOutput').innerHTML = '';
        return;
      }
      
      // Find selected league
      const leagues = JSON.parse(localStorage.getItem('bowlingLeagues')) || [];
      const selectedLeague = leagues.find(league => league.id === leagueId);
      
      if (selectedLeague) {
        setActiveLeague(selectedLeague);
      }
    });
  }
  
  // Override original functions to use league-specific storage
  // These will be called from the main.js file
  
  // Make these functions available globally
  window.loadPreviousAssignments = loadPreviousAssignments;
  window.saveAssignments = saveAssignments;
  window.clearLeagueHistory = clearLeagueHistory;
  
  // Initialize league manager when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initLeagueManager();
  });
  
  // Add CSS for league management
  const style = document.createElement('style');
  style.textContent = `
    .league-manager {
      margin-bottom: 30px;
    }
    
    .league-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .league-selector {
      flex: 2;
      min-width: 200px;
      display: flex;
      align-items: center;
    }
    
    .league-actions {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start; /* Align to the top */
    }
    
    #leagueSelect {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--neutral-gray);
      font-size: 1rem;
      height: 38px; /* Set explicit height */
      box-sizing: border-box;
    }
    
    .league-actions button {
      padding: 8px 15px; /* Make the button padding match the dropdown */
      margin: 0; /* Remove any margin */
      height: 38px; /* Set exact height to match dropdown */
      line-height: 1; /* Adjust line height */
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
  
    /* Fix for the label positioning */
    .league-selector label {
      margin-bottom: 8px;
      display: block;
    }
    
    /* Make sure the controls are aligned at the bottom */
    .league-controls {
      display: flex;
      justify-content: space-between;
      align-items: flex-end; /* Align items at the bottom */
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    button.league-btn {
      padding: 8px 15px !important;
      margin: 0 !important;
      height: 38px !important;
      min-height: 0 !important;
      max-height: 38px !important;
      line-height: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      font-size: 1rem !important;
      flex: 0 0 auto !important;
      min-width: 120px !important;
    }
    
    .modal {
      display: none;
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
      background-color: white;
      margin: 15% auto;
      padding: 20px;
      border-radius: 5px;
      width: 80%;
      max-width: 500px;
    }
    
    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 20px;
    }
    
    button.danger {
      background-color: #e74c3c;
    }
    
    button.danger:hover {
      background-color: #c0392b;
    }
    
    @media (max-width: 768px) {
      .league-controls {
        flex-direction: column;
        align-items: stretch;
      }
      
      .league-actions {
        justify-content: space-between;
      }
    }
  `;
  document.head.appendChild(style);