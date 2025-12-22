const videos = [
    { file: "videos/video1.mp4", title: "Cười xỉu 🤣" },
    { file: "videos/video2.mp4", title: "Không nhịn được cười" },
    { file: "videos/video3.mp4", title: "Hài quá trời 😂" },
    // thêm tới 100 video ở đây
];

const container = document.getElementById("video-list");

videos.forEach(v => {
    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
        <video src="${v.file}" controls preload="metadata"></video>
        <div class="title">${v.title}</div>
    `;

    container.appendChild(card);
});
