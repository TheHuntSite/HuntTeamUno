// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

/* -----------------------------
   FIREBASE CONFIG
--------------------------------*/
const firebaseConfig = {
  apiKey: "AIzaSyDNSd6smxpEtppVuEhtRaC-19XcyPNglP0",
  authDomain: "huntsite-64e23.firebaseapp.com",
  databaseURL: "https://huntsite-64e23-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "huntsite-64e23",
  storageBucket: "huntsite-64e23.firebasestorage.app",
  messagingSenderId: "1063124348808",
  appId: "1:1063124348808:web:c9e835ad82edada18c143d"
};

/* -----------------------------
   CONFIG
--------------------------------*/

const inventoryItems = [
  { image: "inv_1.png", title: "Orange Salamander" },
  { image: "inv_2.png", title: "Agility arena ticket" },
  { image: "inv_3.png", title: "Monkey Nuts" },
  { image: "inv_4.png", title: "Opal Bolts" },
  { image: "inv_5.png", title: "Lit Sapphire Lantern" },
  { image: "inv_6.png", title: "Tribal Mask (any)" },
  { image: "inv_7.png", title: "Nettle Tea" },
  { image: "inv_8.png", title: "Vampyre Dust" },
  { image: "inv_9.png", title: "Wild Pie" },
  { image: "inv_10.png", title: "Snake Weed" },
  { image: "inv_11.png", title: "Super Antipoison (3)" },
  { image: "inv_12.png", title: "Cave Nightshade" },
  { image: "inv_13.png", title: "Poisoned Karambwan" },
  { image: "inv_14.png", title: "Silver Sickle" },
  { image: "inv_15.png", title: "Mud Rune" },
  { image: "inv_16.png", title: "Adamant Halberd" },
  { image: "inv_17.png", title: "Eclipse Red" },
  { image: "inv_18.png", title: "Cod" },
  { image: "inv_19.png", title: "Amulet of Magic" },
  { image: "inv_20.png", title: "Snelm (any)" },
  { image: "inv_21.png", title: "Kebbit Bolts" },
  { image: "inv_22.png", title: "Pheonix Feather" },
  { image: "inv_23.png", title: "Mithril Dart" },
  { image: "inv_24.png", title: "Limpwurt Root" },
  { image: "inv_25.png", title: "Volcanic Sulphur" },
  { image: "inv_26.png", title: "Sunfire Splinters" },
  { image: "inv_27.png", title: "Lizardman Fang" },
  { image: "inv_28.png", title: "Blessed Wyrm Bones" }
];

/* -----------------------------
   INIT FIREBASE
--------------------------------*/
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* -----------------------------
   BUILD INVENTORY GRID
--------------------------------*/
function buildInventoryGrid() {
  const grid = document.getElementById("inventory-grid");
  grid.innerHTML = "";

  inventoryItems.forEach((item, index) => {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";

    const container = document.createElement("div");
    container.className = "item-container";

    const inventoryImg = document.createElement("img");
    inventoryImg.src = item.image;
    inventoryImg.className = "inventory-item";
    inventoryImg.dataset.index = index;
    inventoryImg.title = item.title;
    inventoryImg.alt = item.title;

    const overlayImg = document.createElement("img");
    overlayImg.src = "overlay.png";
    overlayImg.className = "overlay-item";
    overlayImg.dataset.index = index;

    container.appendChild(inventoryImg);
    container.appendChild(overlayImg);
    slot.appendChild(container);
    grid.appendChild(slot);
  });
}

/* -----------------------------
   UPDATE UI FROM DATABASE
--------------------------------*/
function updateOverlays(statuses) {
  document.querySelectorAll(".overlay-item").forEach((overlay, index) => {
    const entry = statuses?.[index + 1];
    const status = entry?.status ?? 0;
    overlay.style.display = status === 1 ? "block" : "none";
  });
}

/* -----------------------------
   REALTIME LISTENERS
--------------------------------*/
function listenForOverlayChanges() {
  const statusRef = ref(db, "overlayStatus");

  onValue(statusRef, snapshot => {
    if (!snapshot.exists()) return;
    updateOverlays(snapshot.val());
  });
}

function listenForTeamName() {
  const teamNameRef = ref(db, "siteConfig/teamName");

  onValue(teamNameRef, snapshot => {
    if (!snapshot.exists()) return;

    const teamName = snapshot.val();
    document.title = teamName;

    const h1 = document.getElementById("team-title");
    if (h1) h1.textContent = teamName;
  });
}

/* -----------------------------
   ATOMIC TOGGLE (IMPORTANT)
--------------------------------*/
function toggleOverlayInFirebase(index) {
  const statusRef = ref(db, `overlayStatus/${index + 1}`);

  runTransaction(statusRef, currentData => {
    const currentStatus = currentData?.status ?? 0;
    return { status: currentStatus === 1 ? 0 : 1 };
  });
}

/* -----------------------------
   INPUT HANDLERS (FAST SAFE)
--------------------------------*/
function addItemClickListeners() {
  document.querySelectorAll(".item-container").forEach(container => {
    const inventoryItem = container.querySelector(".inventory-item");
    const index = Number(inventoryItem.dataset.index);

    container.addEventListener("pointerdown", e => {
      e.preventDefault(); // prevents drag/select edge cases
      toggleOverlayInFirebase(index);
    });
  });
}

/* -----------------------------
   INIT
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  buildInventoryGrid();
  listenForOverlayChanges();
  addItemClickListeners();
  listenForTeamName();
});