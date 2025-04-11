const imputsArr = document.querySelectorAll(".cell-input");

let selectedCell = imputsArr[0];
const englishAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ukrainianAlphabet = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ";

const inputs = () => Array.from(document.querySelectorAll(".cell-input"));
const statusBar = document.getElementById("status-bar");
const resetModal = document.getElementById("reset-modal");

imputsArr.forEach((input) => {
  input.addEventListener("click", () => {
    selectedCell = input;
  });
});

function openNewModal() {
  resetModal.style.display = "block";
}

// Function to reset the table
function newTable() {
  inputs().forEach((input) => (input.value = ""));
  updateStatus("New table created.");
}

// Confirm reset action
document.getElementById("yes-button").addEventListener("click", () => {
  newTable();
  resetModal.style.display = "none";
});

// Close modal without action
document.getElementById("no-button").addEventListener("click", () => {
  resetModal.style.display = "none";
});

function autoEnglishAlphabet() {
  if (!selectedCell) return;
  fillFrom(selectedCell, englishAlphabet);
}

function autoEnglishAlphabetLowerCase() {
  if (!selectedCell) return;
  fillFrom(selectedCell, englishAlphabet.toLowerCase());
}

function autoUkrainianAlphabet() {
  if (!selectedCell) return;
  fillFrom(selectedCell, ukrainianAlphabet);
}

function autoUkrainianAlphabetLowerCase() {
  if (!selectedCell) return;
  fillFrom(selectedCell, ukrainianAlphabet.toLowerCase());
}

function autoNumber() {
  if (!selectedCell) return;
  const numbers = "0123456789";
  fillFrom(selectedCell, numbers);
}

function fillFrom(startCell, chars) {
  const allInputs = inputs();
  const startIndex = allInputs.indexOf(startCell);
  for (let i = 0; i < chars.length && startIndex + i < allInputs.length; i++) {
    allInputs[startIndex + i].value = chars[i];
  }
}

function createTableBlob() {
  let output = "";
  inputs().forEach((input, index) => {
    if (input.value.trim()) {
      const row = Math.floor(index / 16)
        .toString(16)
        .toUpperCase();
      const col = (index % 16).toString(16).toUpperCase();
      output += `${row}${col}=${input.value}\n`;
    }
  });
  return new Blob([output], { type: "text/plain" });
}

function saveTable() {
  const blob = createTableBlob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "table.tbl";
  link.click();
  updateStatus("File saved.");
}

function saveTableAs() {
  const blob = createTableBlob();
  if (window.showSaveFilePicker) {
    (async () => {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: "table.tbl",
          types: [
            {
              description: "TBLater Table File",
              accept: { "text/plain": [".tbl"] },
            },
          ],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        updateStatus("File saved as...");
      } catch (err) {
        updateStatus("Save As canceled.");
      }
    })();
  } else {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table.tbl";
    link.click();
    updateStatus("File saved.");
  }
}

function openTable() {
  const fileInput = document.getElementById("file-input");
  fileInput.accept = ".tbl";
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split("\n");
      newTable(); // clear table first
      lines.forEach((line) => {
        const [cell, value] = line.split("=");
        if (cell && value) {
          const row = parseInt(cell[0], 16);
          const col = parseInt(cell[1], 16);
          const index = row * 16 + col;
          const allInputs = inputs();
          if (index < allInputs.length) {
            allInputs[index].value = value.trim();
          }
        }
      });
      updateStatus("File loaded.");
    };
    reader.readAsText(file);
  };
  fileInput.click();
}

function updateStatus(message) {
  if (statusBar) statusBar.textContent = message;
}
