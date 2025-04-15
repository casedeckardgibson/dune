const gridSize = 10;
const board = document.getElementById("gameBoard");

// Game state
let selected = null;
let spice = 1000;
let happiness = 100;
let pollution = 0;
let workers = 20;
const tileData = [];

// UI references
const popup = document.getElementById("messagePopup");
const timeBar = document.getElementById("timeBar");
const missionText = document.getElementById("missionText");
const missionPortrait = document.getElementById("missionPortrait");
const missionVideo = document.getElementById("missionVideo");

for (let i = 0; i < gridSize * gridSize; i++) {
  const tile = document.createElement("div");
  tile.dataset.index = i;
  board.appendChild(tile);
  tileData.push(null);
}

document.getElementById("placeHouse").onclick = () => selected = "sietch";
document.getElementById("placeFactory").onclick = () => selected = "harvester";
document.getElementById("placePark").onclick = () => selected = "windtrap";

board.addEventListener("click", (e) => {
  const index = e.target.dataset.index;
  if (index === undefined || tileData[index] !== null || selected === null) return;

  let cost = 0;
  switch (selected) {
    case "sietch":
      cost = 100;
      if (spice < cost) return showMessage("Insufficient Spice");
      if (workers < 6) return showMessage("Insufficient Workers");
      spice -= cost;
      workers -= 6;
      tileData[index] = "sietch";
      e.target.style.backgroundImage = "url('assets/sietch.png')";
      break;
    case "harvester":
      cost = 200;
      const harvesters = tileData.filter(x => x === "harvester").length;
      const allowedHarvesters = Math.floor(workers / 21);
      if (spice < cost) return showMessage("Insufficient Spice");
      if (harvesters >= allowedHarvesters) return showMessage("Not enough Workers for another Harvester");
      spice -= cost;
      tileData[index] = "harvester";
      e.target.style.backgroundImage = "url('assets/spiceHarvester.png')";
      break;
    case "windtrap":
      cost = 120;
      if (spice < cost) return showMessage("Insufficient Spice");
      spice -= cost;
      tileData[index] = "windtrap";
      e.target.style.backgroundImage = "url('assets/windTrap.png')";
      break;
  }

  updateUI();
});

function updateUI() {
  document.getElementById("money").textContent = spice;
  document.getElementById("happiness").textContent = happiness;
  document.getElementById("pollution").textContent = pollution;
  document.getElementById("workers").textContent = workers;
}

function showMessage(text) {
  popup.textContent = text;
  popup.classList.remove("hidden");
  popup.classList.add("visible");
  setTimeout(() => {
    popup.classList.remove("visible");
    popup.classList.add("hidden");
  }, 2000);
}

function animateTimeBar() {
  timeBar.style.transition = 'none';
  timeBar.style.width = '0%';
  void timeBar.offsetWidth;
  timeBar.style.transition = 'width 20s linear';
  timeBar.style.width = '100%';
}

function showAchievement(title, imagePath) {
  showMessage(`Achievement: ${title}`);
  missionPortrait.src = imagePath;
  missionPortrait.style.display = "block";
}

function playVideo(src) {
  missionVideo.src = src;
  missionVideo.style.display = "block";
  missionVideo.play();
  missionVideo.onended = () => {
    missionVideo.style.display = "none";
    missionVideo.src = "";
  };
}

// Missions
let missionIndex = 0;
let missionComplete = false;
let choosingEnding = false;
let selectedEnding = null;

const missions = [
  {
    character: "Mentat",
    description: "Build a Spice Harvester",
    portrait: "assets/mentat.png",
    condition: () => tileData.includes("harvester"),
    reward: () => { spice += 100; showMessage("Mentat rewards 100 spice."); }
  },
  {
    character: "Duncan Idaho",
    description: "Establish a Sietch",
    portrait: "assets/duncan.png",
    condition: () => tileData.includes("sietch"),
    reward: () => { workers += 3; showMessage("Duncan sends 3 workers."); }
  },
  {
    character: "Gurney Halleck",
    description: "Reach 1000 Spice",
    portrait: "assets/gurney.png",
    condition: () => spice >= 1000,
    reward: () => { happiness += 10; showMessage("Gurney Halleck lifts spirits."); }
  },
  {
    character: "Lady Jessica",
    description: "Reach 200 Happiness",
    portrait: "assets/Jessica.png",
    condition: () => happiness >= 200,
    reward: () => { spice += 100; showMessage("Jessica rewards 100 spice."); }
  },
  {
    character: "Duke Leto",
    description: "Build 7 Spice Harvesters",
    portrait: "assets/leto.png",
    condition: () => tileData.filter(x => x === "harvester").length >= 7,
    reward: () => { spice += 300; showMessage("Duke Leto rewards 300 spice."); }
  },
  {
    character: "Chani",
    description: "Build 12 Wind Traps",
    portrait: "assets/chani.png",
    condition: () => tileData.filter(x => x === "windtrap").length >= 12,
    reward: () => { playVideo("assets/chani.mp4"); showMessage("Achievement: Muad'Dib"); }
  },
  {
    character: "Stilgar",
    description: "Establish 12 Sietches",
    portrait: "assets/stilgar.png",
    condition: () => tileData.filter(x => x === "sietch").length >= 12,
    reward: () => { spice += 300; showMessage("Stilgar rewards 300 spice."); }
  },
  {
    character: "Leto Kynes",
    description: "Reach 0 Pollution",
    portrait: "assets/kynes.png",
    condition: () => pollution === 0,
    reward: () => { playVideo("assets/kynes.mp4"); showMessage("Achievement: Planetologist"); }
  },
  {
    character: "Emperor Shaddam",
    description: "Reach 10,000 Spice",
    portrait: "assets/shaddam.png",
    condition: () => spice >= 10000,
    reward: () => { showMessage("Achievement: Prophet"); }
  },
  {
    character: "Baron Harkonnen",
    description: "Fall below 50 Happiness",
    portrait: "assets/baron.png",
    condition: () => happiness < 50,
    reward: () => { showMessage("Achievement: Grandson"); }
  }
];

function pickMission() {
  if (missionIndex < missions.length) {
    const m = missions[missionIndex];
    missionText.textContent = `🎯 Mission (${m.character}): ${m.description}`;
    missionPortrait.src = m.portrait || "";
    missionPortrait.style.display = m.portrait ? "block" : "none";
    missionVideo.style.display = "none";
    missionComplete = false;
  } else if (!choosingEnding) {
    presentEndingChoices();
  }
}

function checkMissionProgress() {
  if (missionComplete || choosingEnding || selectedEnding) return;

  const mission = missions[missionIndex];
  if (mission && mission.condition()) {
    missionComplete = true;
    mission.reward();
    updateUI();
    setTimeout(() => {
      missionIndex++;
      pickMission();
    }, 4000);
  }
}

function presentEndingChoices() {
  choosingEnding = true;
  missionText.innerHTML = `
    🔻 <strong>Choose Your Ending:</strong><br><br>
    <button onclick="chooseEnding('baron')">Alternate: Baron Harkonnen</button><br>
    <small>Fall below 50 Happiness & reach 4000 Pollution</small><br><br>
    <button onclick="chooseEnding('kwisatz')">Main: Lisan al Gaib</button><br>
    <small>Reach 21,000 Spice, 300 Happiness, 0 Pollution, and 5,000 Workers</small>
  `;
  missionPortrait.style.display = "none";
  missionVideo.style.display = "none";
}

function chooseEnding(choice) {
  selectedEnding = choice;
  choosingEnding = false;
  if (choice === "baron") {
    missionPortrait.src = "assets/baron.png";
    missionText.innerHTML = `✅ Ending Chosen: Baron Harkonnen<br>🏆 Grandson Governor of Dune`;
  } else {
    missionPortrait.src = "assets/paul.png";
    missionText.innerHTML = `✅ Ending Chosen: Lisan al Gaib<br>🏆 Kwisatz Haderach`;
  }
  missionPortrait.style.display = "block";
}

// Game loop
animateTimeBar();
pickMission();

setInterval(() => {
  animateTimeBar();

  let newWorkers = 0;

  tileData.forEach(type => {
    switch (type) {
      case "sietch":
        newWorkers += happiness >= 300 ? 7 : happiness > 100 ? 5 : 2;
        spice -= 20;
        happiness += 10;
        pollution += 1;
        break;
      case "harvester":
        spice += 50;
        happiness -= 20;
        pollution += 15;
        break;
      case "windtrap":
        spice -= 15;
        happiness += 20;
        pollution -= 13;
        break;
    }
  });

  workers += newWorkers;
  happiness = Math.max(0, Math.min(300, happiness));
  pollution = Math.max(0, pollution);

  updateUI();
  checkMissionProgress();

  // Ending conditions
  if (selectedEnding === "baron" && happiness < 50 && pollution >= 4000) {
    showMessage("Ending Achieved: Grandson Governor of Dune");
    selectedEnding = null;
  } else if (
    selectedEnding === "kwisatz" &&
    spice >= 21000 &&
    happiness >= 300 &&
    pollution === 0 &&
    workers >= 5000
  ) {
    showMessage("Ending Achieved: Kwisatz Haderach");
    selectedEnding = null;
  }
}, 20000);
