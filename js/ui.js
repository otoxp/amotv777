// Função para desenhar a lista de Grupos na coluna da esquerda
function exibirGrupos(grupos) {
    const listaGruposUI = document.getElementById('lista-grupos');
    if (!listaGruposUI) return;

    // Limpa a lista atual e adiciona os novos grupos
    listaGruposUI.innerHTML = grupos.map(grupo => `
        <li onclick="selecionarGrupo(this, '${grupo}')">
            ${grupo}
        </li>
    `).join('');
}

// Função chamada ao clicar em um grupo
function selecionarGrupo(elemento, nomeGrupo) {
    // 1. Destaca o grupo selecionado visualmente
    document.querySelectorAll('#lista-grupos li').forEach(li => li.classList.remove('active'));
    elemento.classList.add('active');

    // 2. Filtra os canais que pertencem a esse grupo
    const canaisDoGrupo = canaisGlobais.filter(c => c.grupo === nomeGrupo);
    
    // 3. Desenha os canais na coluna da direita
    const listaCanaisUI = document.getElementById('lista-canais');
    listaCanaisUI.innerHTML = canaisDoGrupo.map(canal => `
        <li onclick="playVideo('${canal.url}', '${canal.nome}', '${canal.id}')">
            <img src="${canal.logo}" onerror="this.src='https://via.placeholder.com/40x25?text=TV'">
            <span>${canal.nome}</span>
        </li>
    `).join('');

    // 4. Se estiver no celular, sobe a tela para o player após escolher o grupo
    if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Função para a barra de busca (filtra canais dentro do grupo aberto)
function filtrarCanais() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const itens = document.querySelectorAll('#lista-canais li');
    
    itens.forEach(item => {
        const nomeCanal = item.innerText.toLowerCase();
        item.style.display = nomeCanal.includes(termo) ? "flex" : "none";
    });
}