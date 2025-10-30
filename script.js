const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const fab = document.getElementById("fab");
const modal = document.getElementById("modal");
const addTaskBtn = document.getElementById("add-task-btn");

const addTaskSound = new Audio('sounds/addTask.mp3');
const completeTaskSound = new Audio('sounds/completeTask.mp3');
const deleteTaskSound = new Audio('sounds/deleteTask.mp3');
const backgroundMusic = new Audio('sounds/backgroundMusic.mp3');
backgroundMusic.loop = true;

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
    if (inputBox.value === '') {
        alert("You must write something!");
    } else {
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);
        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
        addTaskSound.play();
    }
    inputBox.value = "";
    saveData();
}

listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        if(e.target.classList.contains("checked")) {
            completeTaskSound.play();
        }
        saveData();
    } else if (e.target.tagName === "SPAN") {
        deleteTaskSound.play();
        e.target.parentElement.classList.add("fade-out");
        setTimeout(() => {
            e.target.parentElement.remove();
            saveData();
        }, 700);
    }
}, false);

function saveData() {
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
    listContainer.innerHTML = localStorage.getItem("data");
}

showTask();

// Background music toggle
const musicToggle = document.createElement('button');
musicToggle.innerText = 'Music: Off';
musicToggle.classList.add('music-toggle');
document.body.appendChild(musicToggle);

musicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicToggle.innerText = 'Music: On';
    } else {
        backgroundMusic.pause();
        musicToggle.innerText = 'Music: Off';
    }
});
