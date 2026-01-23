function carregarUrl() {
    const urlOriginal = document.getElementById('url-lista').value;
    if (!urlOriginal) return alert("Insira uma URL");

    // Usando um proxy público para evitar o erro de CORS
    const proxy = "https://corsproxy.io/?"; 
    const urlComProxy = proxy + encodeURIComponent(urlOriginal);

    console.log("Tentando carregar via proxy:", urlComProxy);

    fetch(urlComProxy)
        .then(response => {
            if (!response.ok) throw new Error("Erro na rede ou link inválido");
            return response.text();
        })
        .then(data => {
            processarM3U(data);
            alert("Lista carregada com sucesso!");
        })
        .catch(err => {
            console.error(err);
            alert("Erro de CORS ou Link Inválido. Tente baixar o arquivo e carregar localmente.");
        });
}