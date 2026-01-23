function playVideo(url, nome, id) {
    const video = document.getElementById('video-player');
    
    // Tenta usar o proxy se o link for http para evitar o bloqueio HTTPS
    let finalUrl = url;
    if (url.startsWith('http:')) {
        finalUrl = proxy + encodeURIComponent(url);
    }

    if (Hls.isSupported()) {
        hls.destroy();
        hls = new Hls();
        hls.loadSource(finalUrl); // Carrega via proxy se necessário
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        video.src = finalUrl;
        video.play();
    }
}
