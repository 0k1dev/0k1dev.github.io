const videos = [
    {
        id: "v1",
        title: "Hài 2018 😂",
        youtube: "https://www.youtube.com/watch?v=uJKJNZjkrj8"
    },
    {
        id: "v2",
        title: "Nhật JLPT N4 T7/2023 🤣",
        youtube: "https://www.youtube.com/watch?v=Io9Yo3f_dQY"
    },
    {
        id: "v3",
        title: "Nhạc sầu P1 😆",
        youtube: "https://www.youtube.com/watch?v=4VZaex4F-nI"
    },
    {
        id: "v4",
        title: "Nhạc sầu P2 😆",
        youtube: "https://www.youtube.com/watch?v=QCx00awBcy4"
    },
    {
        id: "v5",
        title: "Nhạc sầu P3 😆",
        youtube: "https://www.youtube.com/watch?v=EWAZyNaG764"
    },
    { 
        id: "v6",
        title: "Nhạc remix P1",
        youtube: "https://www.youtube.com/watch?v=1rKJ7PsN8tk"
    }
];

// ===== LẤY VIDEO ID =====
function getYouTubeID(url){
    const reg = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(reg);
    return match ? match[1] : null;
}

// ===== VIEW GIẢ =====
function getViews(id){
    let views = localStorage.getItem("views_" + id);
    if(!views){
        views = Math.floor(Math.random() * 90000) + 1000;
    }else{
        views = parseInt(views) + Math.floor(Math.random() * 15);
    }
    localStorage.setItem("views_" + id, views);
    return views;
}

// ===== LIKE =====
function getLikes(id){
    return parseInt(localStorage.getItem("likes_" + id)) || 0;
}

function isLiked(id){
    return localStorage.getItem("liked_" + id) === "1";
}

function likeVideo(id, btn, count){
    if(isLiked(id)) return;

    let likes = getLikes(id) + 1;
    localStorage.setItem("likes_" + id, likes);
    localStorage.setItem("liked_" + id, "1");

    btn.classList.add("liked");
    count.textContent = likes.toLocaleString();
}

// ===== RENDER =====
const container = document.getElementById("video-list");

videos.forEach(v=>{
    const ytId = getYouTubeID(v.youtube);
    if(!ytId) return;

    const views = getViews(v.id);
    const likes = getLikes(v.id);
    const liked = isLiked(v.id);

    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${ytId}"
            allowfullscreen>
        </iframe>

        <div class="video-info">
            <div class="video-title">${v.title}</div>

            <div class="video-meta">
                <span class="views">👁️ ${views.toLocaleString()} lượt xem</span>

                <button class="like-btn ${liked ? "liked" : ""}">
                    ❤️ <span>${likes.toLocaleString()}</span>
                </button>
            </div>
        </div>
    `;

    container.appendChild(card);

    const likeBtn = card.querySelector(".like-btn");
    const likeCount = likeBtn.querySelector("span");

    likeBtn.onclick = () => likeVideo(v.id, likeBtn, likeCount);
});
