// DOM elements
const memeForm = document.getElementById("meme-form");
const imageUpload = document.getElementById("image-upload");
const topTextInput = document.getElementById("top-text");
const bottomTextInput = document.getElementById("bottom-text");
const memeCanvas = document.getElementById("meme-canvas");
const downloadButton = document.getElementById("download-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const memeGallery = document.getElementById("meme-gallery");
const previewMessage = document.getElementById("preview-message");
const memeIdInput = document.getElementById("meme-id");

const ctx = memeCanvas.getContext("2d");
let image = null;
let memes = JSON.parse(localStorage.getItem("memes")) || [];

// 🖼 Load image and show preview
imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        image = new Image();
        image.onload = drawMeme;
        image.src = event.target.result;
        previewMessage.style.display = "none";
        downloadButton.disabled = false;
    };
    reader.readAsDataURL(file);
});

// 🎨 Draw meme on canvas
function drawMeme() {
    if (!image) return;
    ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
    ctx.drawImage(image, 0, 0, memeCanvas.width, memeCanvas.height);

    const topText = topTextInput.value.toUpperCase();
    const bottomText = bottomTextInput.value.toUpperCase();

    ctx.font = "bold 30px Impact";
    ctx.fillStyle = "white";

    ctx.lineWidth = 3;
    ctx.textAlign = "center";

    ctx.fillText(topText, memeCanvas.width / 2, 50);
    

    ctx.fillText(bottomText, memeCanvas.width / 2, memeCanvas.height - 20);
   
}

// 👂 Update meme preview live
[topTextInput, bottomTextInput].forEach((input) => {
    input.addEventListener("input", drawMeme);
});

// 💾 Save or Update Meme
memeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!image) {
        alert("Please upload an image first!");
        return;
    }

    const memeData = memeCanvas.toDataURL("image/png");
    const topText = topTextInput.value.trim();
    const bottomText = bottomTextInput.value.trim();

    const id = memeIdInput.value;
    if (id) {
        // Update existing meme
        const index = memes.findIndex((m) => m.id === id);
        memes[index] = { id, memeData, topText, bottomText };
        cancelEditButton.style.display = "none";
    } else {
        // Create new meme
        memes.push({ id: Date.now().toString(), memeData, topText, bottomText });
    }

    localStorage.setItem("memes", JSON.stringify(memes));
    renderMemes();
    memeForm.reset();
    image = null;
    previewMessage.style.display = "block";
    ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
    downloadButton.disabled = true;
    memeIdInput.value = "";
});

// ⬇ Download Meme
downloadButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = memeCanvas.toDataURL("image/png");
    link.click();
});

// 🖼 Display memes in gallery
function renderMemes() {
    if (memes.length === 0) {
        memeGallery.innerHTML = "<p>No memes yet. Get creating!</p>";
        return;
    }

    memeGallery.innerHTML = memes.map(meme => `
        <div class="meme-item">
            <img src="${meme.memeData}" alt="Meme">
            <div class="meme-actions">
                <button class="edit-btn" onclick="editMeme('${meme.id}')">✏ Edit</button>
                <button class="delete-btn" onclick="deleteMeme('${meme.id}')">🗑 Delete</button>
            </div>
        </div>
    `).join("");
}

// ✏ Edit Meme
window.editMeme = function (id) {
    const meme = memes.find(m => m.id === id);
    if (!meme) return;

    const img = new Image();
    img.onload = () => {
        image = img;
        drawMeme();
        topTextInput.value = meme.topText;
        bottomTextInput.value = meme.bottomText;
        memeIdInput.value = meme.id;
        cancelEditButton.style.display = "inline-block";
        previewMessage.style.display = "none";
        downloadButton.disabled = false;
    };
    img.src = meme.memeData;
};

// ❌ Delete Meme
window.deleteMeme = function (id) {
    memes = memes.filter(m => m.id !== id);
    localStorage.setItem("memes", JSON.stringify(memes));
    renderMemes();
};

// 🚫 Cancel Edit
cancelEditButton.addEventListener("click", () => {
    memeIdInput.value = "";
    memeForm.reset();
    cancelEditButton.style.display = "none";
    image = null;
    ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
    previewMessage.style.display = "block";
    downloadButton.disabled = true;
});

// 🖼 Initialize
renderMemes();
