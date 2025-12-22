const videos = [
    {
        title: "Hài 2018 😂",
        youtube: "https://www.youtube.com/watch?v=uJKJNZjkrj8"
    },
    {
        title: "Nhật JLPT N4 T7/2023 🤣",
        youtube: "https://www.youtube.com/watch?v=Io9Yo3f_dQY"
    },
    {
        title: "Nhạc sầu P1 😆",
        youtube: "https://www.youtube.com/watch?v=4VZaex4F-nI"
    },
    {
        title: "Nhạc sầu P2 😆",
        youtube: "https://www.youtube.com/watch?v=QCx00awBcy4"
    },
    {
        title: "Nhạc sầu P3 😆",
        youtube: "https://www.youtube.com/watch?v=EWAZyNaG764"
    },
    { 
        title: "Nhạc remix P1 ",
        youtube: "https://www.youtube.com/watch?v=1rKJ7PsN8tk"
    }
];

// Lấy video ID từ link YouTube
function getYouTubeID(url){
    const reg =
      /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(reg);
    return match ? match[1] : null;
}

const container = document.getElementById("video-list");

videos.forEach(v=>{
    const id = getYouTubeID(v.youtube);
    if(!id) return;

    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${id}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
        <div class="video-title">${v.title}</div>
    `;

    container.appendChild(card);
});
