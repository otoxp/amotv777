let canaisGlobais = [];
    let dadosEPG = null; // Armazenará a programação
    let hls = new Hls();
    const linkEPG = "https://tinyurl.com/w777tv";
    const proxy = "https://corsproxy.io/?";

    // 1. Carregar EPG ao abrir a página
    window.onload = () => {
        fetch(proxy + encodeURIComponent(linkEPG))
            .then(res => res.text())
            .then(xmlString => {
                const parser = new DOMParser();
                dadosEPG = parser.parseFromString(xmlString, "text/xml");
                console.log("EPG Carregado com sucesso.");
            })
            .catch(e => console.error("Erro ao carregar EPG:", e));
    };

    async function carregarUrl() {
        const url = document.getElementById('url-lista').value;
        if(!url) return alert("Insira uma URL!");
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.text();
            processarM3U(data);
        } catch (e) { alert("Erro de conexão/CORS."); }
    }

    function carregarArquivo(input) {
        const reader = new FileReader();
        reader.onload = (e) => processarM3U(e.target.result);
        reader.readAsText(input.files[0]);
    }

    function processarM3U(data) {
        const linhas = data.split('\n');
        canaisGlobais = [];
        let grupos = new Set();
        let tempCanal = {};

        linhas.forEach(linha => {
            if (linha.startsWith('#EXTINF')) {
                tempCanal = {};
                // Extrai tvg-id para o EPG, nome e grupo
                tempCanal.id = linha.match(/tvg-id="([^"]+)"/)?.[1] || "";
                tempCanal.nome = linha.split(',')[1]?.trim() || "Sem nome";
                tempCanal.grupo = linha.match(/group-title="([^"]+)"/)?.[1] || "Geral";
                tempCanal.logo = linha.match(/tvg-logo="([^"]+)"/)?.[1] || "";
                grupos.add(tempCanal.grupo);
            } else if (linha.startsWith('http')) {
                tempCanal.url = linha.trim();
                if(tempCanal.nome) canaisGlobais.push(tempCanal);
            }
        });
        exibirGrupos(Array.from(grupos).sort());
    }

    function exibirGrupos(grupos) {
        const lista = document.getElementById('lista-grupos');
        lista.innerHTML = grupos.map(g => `<li onclick="exibirCanais('${g}')">${g}</li>`).join('');
    }

    function exibirCanais(grupo) {
        const filtrados = canaisGlobais.filter(c => c.grupo === grupo);
        const lista = document.getElementById('lista-canais');
        lista.innerHTML = filtrados.map(c => `
            <li onclick="playVideo('${c.url}', '${c.nome}', '${c.id}')">
                <img src="${c.logo}" onerror="this.src='https://via.placeholder.com/40x25?text=TV'">
                <span>${c.nome}</span>
            </li>
        `).join('');
        if(window.innerWidth < 768) window.scrollTo({top: 0, behavior: 'smooth'});
    }

    // Função para buscar a programação no XML carregado
    function buscarProgramacao(canalId, canalNome) {
        const epgBox = document.getElementById('epg-content');
        if (!dadosEPG) return epgBox.innerHTML = "EPG não disponível.";

        // Tenta buscar pelo ID ou pelo Nome do canal no XML
        const selector = canalId ? `programme[channel="${canalId}"]` : `programme`;
        const programas = dadosEPG.querySelectorAll(selector);
        
        let html = `Assistindo: <b>${canalNome}</b><hr>`;
        let encontrou = false;

        const agora = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12); // Formato XMLTV YYYYMMDDHHMM

        programas.forEach(p => {
            const start = p.getAttribute('start');
            const stop = p.getAttribute('stop');
            
            // Verifica se o programa está passando agora
            if (agora >= start.slice(0,12) && agora <= stop.slice(0,12)) {
                const titulo = p.querySelector('title').textContent;
                const desc = p.querySelector('desc')?.textContent || "Sem descrição.";
                html += `<div style="color:#007bff">NO AR: <b>${titulo}</b></div><small>${desc}</small>`;
                encontrou = true;
            }
        });

        if (!encontrou) html += "Nenhuma informação de programa encontrada para este horário.";
        epgBox.innerHTML = html;
    }

    function playVideo(url, nome, id) {
        const video = document.getElementById('video-player');
        buscarProgramacao(id, nome);

        if (Hls.isSupported()) {
            hls.destroy();
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play();
        }
    }

    function filtrarCanais() {
        const termo = document.getElementById('busca').value.toLowerCase();
        const itens = document.querySelectorAll('#lista-canais li');
        itens.forEach(item => {
            item.style.display = item.innerText.toLowerCase().includes(termo) ? "flex" : "none";
        });
    }