const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addTaskBtn = document.getElementById("add-task-btn");
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const saveEditBtn = document.getElementById("save-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const pendingTasksElement = document.getElementById("pending-tasks");

let currentEditingTask = null;

const addTaskSound = new Audio('sounds/addTask.mp3');
const completeTaskSound = new Audio('sounds/completeTask.mp3');
const deleteTaskSound = new Audio('sounds/deleteTask.mp3');

// Music Player
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volumeSlider = document.getElementById('volume-slider');
const currentSongText = document.getElementById('current-song');

const songs = [
    'sounds/I Wanna Be Yours Slowed Reverb-(SambalpuriStar.In).mp3',
    'sounds/Let Me Down Slowly.mp3',
    'sounds/Main Kabhi Bhoolunga Na Tujhe (Slowed Reverb)-(SambalpuriStar.In).mp3',
    'sounds/Neele Neele Ambar Par (Slowed Reverb)-(SambalpuriStar.In).mp3',
    'sounds/Rait Zara Si (Slowed Reverb)-(SambalpuriStar.In).mp3',
    'sounds/Tere Hawaale (Slowed Reverb)-(SambalpuriStar.In).mp3'
];

let currentSongIndex = 0;
let isPlaying = false;
const audioPlayer = new Audio();
audioPlayer.volume = volumeSlider.value;

// Load first song
function loadSong(index) {
    audioPlayer.src = songs[index];
    // Clean up the song name for display
    let songName = songs[index].split('/').pop()
        .replace('.mp3', '')
        .replace('-(SambalpuriStar.In)', '')
        .replace('(Slowed Reverb)', '')
        .trim();
    currentSongText.textContent = songName;
}

// Play/Pause
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.textContent = '⏵';
    } else {
        audioPlayer.play();
        playPauseBtn.textContent = '⏸';
    }
    isPlaying = !isPlaying;
});

// Previous song
prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
});

// Next song
nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
});

// Auto-play next song when current one ends
audioPlayer.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audioPlayer.play();
});

// Initialize and autoplay music
document.addEventListener('DOMContentLoaded', () => {
    // First load the initial song
    loadSong(currentSongIndex);
    
    // Add error handling for audio loading
    audioPlayer.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        currentSongText.textContent = 'Error loading song';
    });

    // Try to autoplay
    const startPlaying = async () => {
        try {
            await audioPlayer.play();
            isPlaying = true;
            playPauseBtn.textContent = '⏸';
        } catch (error) {
            console.log("Autoplay prevented - waiting for user interaction");
            isPlaying = false;
            playPauseBtn.textContent = '⏵';
            
            // Add a notification to click play
            currentSongText.textContent = 'Click play to start music';
        }
    };

    startPlaying();
});

fab.addEventListener("click", () => {
    modal.style.display = "block";
});

addTaskBtn.addEventListener("click", () => {
    addTask();
    modal.style.display = "none";
});

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function addTask() {
    if (inputBox.value.trim() === '') {
        alert("You must write something!");
        return;
    }
    
    let li = document.createElement("li");
    li.innerHTML = `
        <div class="task-content">
            <span class="task-text">${inputBox.value}</span>
            <div class="task-actions">
                <button class="edit-btn"><span class="material-icons">edit</span></button>
                <button class="delete-btn"><span class="material-icons">close</span></button>
            </div>
        </div>
    `;
    listContainer.appendChild(li);
    
    // Add animations
    li.style.opacity = '0';
    li.style.transform = 'translateY(20px)';
    setTimeout(() => {
        li.style.opacity = '1';
        li.style.transform = 'translateY(0)';
    }, 50);

    addTaskSound.play();
    inputBox.value = "";
    updatePendingTasksCount();
    saveData();
}

function updatePendingTasksCount() {
    const totalTasks = listContainer.querySelectorAll('li').length;
    const completedTasks = listContainer.querySelectorAll('li.checked').length;
    pendingTasksElement.textContent = totalTasks - completedTasks;
}

function editTask(taskElement) {
    currentEditingTask = taskElement;
    const taskText = taskElement.querySelector('.task-text').textContent;
    editInput.value = taskText;
    editModal.style.display = 'block';
    editInput.focus();
}

listContainer.addEventListener("click", function(e) {
    const target = e.target;
    const taskItem = target.closest('li');
    
    if (!taskItem) return;

    if (target.closest('.edit-btn')) {
        editTask(taskItem);
    } else if (target.closest('.delete-btn')) {
        deleteTaskSound.play();
        taskItem.classList.add("fade-out");
        setTimeout(() => {
            taskItem.remove();
            updatePendingTasksCount();
            saveData();
        }, 700);
    } else if (!target.closest('.task-actions')) {
        taskItem.classList.toggle("checked");
        if(taskItem.classList.contains("checked")) {
            completeTaskSound.play();
        }
        updatePendingTasksCount();
        saveData();
    }
}, false);

// Edit modal event listeners
saveEditBtn.addEventListener('click', () => {
    if (currentEditingTask && editInput.value.trim() !== '') {
        currentEditingTask.querySelector('.task-text').textContent = editInput.value;
        editModal.style.display = 'none';
        saveData();
    }
});

cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

function saveData() {
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
    listContainer.innerHTML = localStorage.getItem("data");
}

showTask();

// Removed old music toggle as we now have a full music player
