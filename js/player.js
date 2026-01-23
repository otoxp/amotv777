// Links ofuscados em Base64 para não ficarem expostos no GitHub
const linkListaOfuscado = "MnhsN2JmeXY="; // Final do seu tinyurl (2yl7bfyv)
const linkEPGOfuscado = "aHR0cHM6Ly90aW55dXJsLmNvbS93Nzc3dHY="; 
const proxy = "https://corsproxy.io/?";

let dadosEPG = null;
let hls = new Hls();

// 1. Inicialização ao abrir a página
window.onload = () => {
    // Decodifica o EPG e a Lista
    const linkEPG = atob("aHR0cHM6Ly90aW55dXJsLmNvbS93Nzc3dHY=");
    const linkLista = "https://tinyurl.com/" + atob("MnhsN2JmeXY=");

    console.log("Iniciando Player...");
    
    // Carrega o EPG em segundo plano
    fetch(proxy + encodeURIComponent(linkEPG))
        .then(res => res.text())
        .then(xml => {
            const parser = new DOMParser();
            dadosEPG = parser.parseFromString(xml, "text/xml");
            console.log("EPG carregado.");
        }).catch(e => console.log("Erro EPG"));

    // Tenta carregar do localStorage, se não tiver, usa a sua lista padrão
    let listaSalva = localStorage.getItem('amot777_iptv_url');
    
    if (!listaSalva) {
        listaSalva = linkLista;
        localStorage.setItem('amot777_iptv_url', listaSalva);
    }

    document.getElementById('url-lista').value = listaSalva;
    
    // Chama a função de carregar a lista (definida no parser.js ou aqui)
    carregarUrl(true);
};

// 2. Função de Play com HLS (compatível com celular e PC)
function playVideo(url, nome, id) {
    const video = document.getElementById('video-player');
    
    // Atualiza a caixa de EPG
    if(typeof buscarProgramacao === "function") {
        buscarProgramacao(id, nome);
    }

    if (Hls.isSupported()) {
        hls.destroy();
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Nativo para Safari (iOS)
        video.src = url;
        video.play();
    }
}

// 3. Função para limpar os dados se você quiser trocar de lista
function limparDados() {
    if (confirm("Deseja apagar a lista salva?")) {
        localStorage.removeItem('amot777_iptv_url');
        location.reload();
    }
}
