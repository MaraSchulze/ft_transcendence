import { apiRequest } from './apiServices.js';
const API_URL = 'api/tournaments/';
const REFRESH_INTERVAL = 5000;

let intervalId = null;

function createTournamentsHTML() {
    return `
        <div class="container py-5">
            <h1 class="text-center mb-4">Active Tournaments</h1>
            
            <!-- New Tournament Button -->
            <div class="text-center mb-4">
                <button id="new-tournament-btn" class="btn btn-success">New Tournament</button>
            </div>
            
            <!-- New Tournament Form Modal -->
            <div id="new-tournament-modal" class="modal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Create New Tournament</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="new-tournament-form">
                                <div class="mb-3">
                                    <label for="tournament-name" class="form-label">Tournament Name</label>
                                    <input type="text" class="form-control" id="tournament-name" required>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="submit" class="btn btn-primary">Create Tournament</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading spinner -->
            <div id="loading-spinner" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <!-- Tournaments list -->
            <div id="tournaments-container" class="row g-4">
            </div>

            <!-- Error alert -->
            <div id="error-alert" class="alert alert-danger d-none" role="alert">
                Failed to load tournaments. Please try again later.
            </div>
        </div>
    `;
}


async function fetchTournaments() {
    try {
        const response = await apiRequest(API_URL, 'GET');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tournaments = await response.json();
        return tournaments;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }
}

function createTournamentCard(tournament) {
    // Count the number of players
    const playerCount = ['player1_name', 'player2_name', 'player3_name', 'player4_name']
        .filter(key => tournament[key])
        .length;
    
    // Determine button properties
    const buttonText = playerCount === 4 ? 'Play' : 'Join';
    const buttonClass = playerCount === 4 ? 'btn-success' : 'btn-success';
    const buttonDisplay = playerCount > 4 ? 'd-none' : ''; // Hide if more than 4 players
    
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(tournament.tournament_name)}</h5>
                    <div class="mt-3">
                        <h6 class="mb-3">Players:</h6>
                        <ul class="list-unstyled">
                            ${tournament.player1_name ? `<li>Player 1: ${escapeHtml(tournament.player1_name)}</li>` : ''}
                            ${tournament.player2_name ? `<li>Player 2: ${escapeHtml(tournament.player2_name)}</li>` : ''}
                            ${tournament.player3_name ? `<li>Player 3: ${escapeHtml(tournament.player3_name)}</li>` : ''}
                            ${tournament.player4_name ? `<li>Player 4: ${escapeHtml(tournament.player4_name)}</li>` : ''}
                        </ul>
                    </div>
                    <div class="mt-3 text-center">
                        <button 
                            class="btn ${buttonClass} ${buttonDisplay}"
                            data-tournament-id="${tournament.id}"
                            data-action="${buttonText}"
                            ${playerCount >= 4 ? 'data-ready="true"' : ''}
                        >
                            ${buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add this function to handle button clicks
async function handleTournamentAction(tournamentId, action) {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const username = storedUser.name;

        if (action === 'Join') {
            // Make the API call to join the tournament
            await apiRequest(`api/tournaments/${tournamentId}/join/`, 'POST', {
                player_name: username
            });
        } else if (action === 'Play') {
            // Redirect to the game page or handle game start
            window.location.href = `/game/${tournamentId}`;
        }

        // Refresh the tournaments list
        updateTournaments();
    } catch (error) {
        console.error('Error handling tournament action:', error);
        alert('Failed to perform action: ' + error.message);
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function updateTournaments() {
    const tournamentsContainer = document.getElementById('tournaments-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorAlert = document.getElementById('error-alert');
    
    if (!tournamentsContainer) return;

    try {
        errorAlert.classList.add('d-none');
        const tournaments = await fetchTournaments();
        console.log('Received tournaments:', tournaments);
        
        if (tournaments.length === 0) {
            tournamentsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No active tournaments found.</p>
                </div>
            `;
        } else {
            tournamentsContainer.innerHTML = tournaments
                .map(tournament => createTournamentCard(tournament))
                .join('');
        }
        document.addEventListener('click', async (event) => {
            const target = event.target;
            if (target.matches('.btn[data-tournament-id]')) {
                const tournamentId = target.getAttribute('data-tournament-id');
                const action = target.getAttribute('data-action');
                await handleTournamentAction(tournamentId, action);
            }
        });
        
    } catch (error) {
        console.error('Update error:', error);
        errorAlert.classList.remove('d-none');
    } finally {
        loadingSpinner.classList.add('d-none');
    }
}

export function loadPage(appDiv) {
    if (intervalId) {
        clearInterval(intervalId);
    }

    appDiv.innerHTML = createTournamentsHTML();
    updateTournaments();
    intervalId = setInterval(updateTournaments, REFRESH_INTERVAL);

    // Add event listener to the "New Tournament" button
    const newTournamentBtn = document.getElementById('new-tournament-btn');
    newTournamentBtn.addEventListener('click', () => {
        const newTournamentModal = new bootstrap.Modal(document.getElementById('new-tournament-modal'));
        newTournamentModal.show();
    });

    // Add event listener for the form submission to create a new tournament
    const newTournamentForm = document.getElementById('new-tournament-form');
    newTournamentForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const tournamentNameInput = document.getElementById('tournament-name');
        const tournamentName = tournamentNameInput.value;

        try {
            await createNewTournament(tournamentName);
            // Hide the modal
            const newTournamentModal = bootstrap.Modal.getInstance(document.getElementById('new-tournament-modal'));
            newTournamentModal.hide();
            // Clear the form
            tournamentNameInput.value = '';
            // Refresh the tournaments list
            updateTournaments();
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('Failed to create a new tournament: ' + error.message);
        }
    });

    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
}

// Function to create a new tournament via the API
async function createNewTournament(tournamentName) {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const username = storedUser.name;
        const response = await apiRequest('api/tournaments/add/', 'POST', {
            tournament_name: tournamentName,
            player_name: username
        });
        const responseText = await response.text(); // Get the raw response as text

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }
        const data = JSON.parse(responseText);
        console.log('Tournament created:', data);
        return data;
    } catch (error) {
        console.error('Error creating new tournament:', error);
        throw error;
    }
}