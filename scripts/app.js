const player = document.getElementById('player');
const channelsEl = document.getElementById('channels');
const groupSelect = document.getElementById('groupSelect');
const groupsContainer = document.getElementById('groupsContainer');
const searchInput = document.getElementById('search');
const currentTitle = document.getElementById('currentTitle');
const currentGroup = document.getElementById('currentGroup');
const loadingEl = document.getElementById('loading');

let channels = [];

function parseM3U(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
  const result = [];
  let lastMeta = null;
  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      lastMeta = line;
    } else if (!line.startsWith('#')) {
      const url = line;
      let title = url;
      let group = 'Sem grupo';
      let logo = '';
      if (lastMeta) {
        const gMatch = lastMeta.match(/group-title="([^"]+)"/i);
        const lMatch = lastMeta.match(/tvg-logo="([^"]+)"/i);
        group = gMatch ? gMatch[1] : group;
        logo = lMatch ? lMatch[1] : '';
        const afterComma = lastMeta.split(',').slice(1).join(',').trim();
        if (afterComma) title = afterComma;
      }
      result.push({ title, url, group, logo });
      lastMeta = null;
    }
  }
  return result;
}

function renderGroups() {
  const byGroup = {};
  channels.forEach(ch => {
    byGroup[ch.group] = byGroup[ch.group] || [];
    byGroup[ch.group].push(ch);
  });
  groupSelect.innerHTML = '<option value="__all">Todos os grupos</option>';
  groupsContainer.innerHTML = '';
  Object.keys(byGroup).sort().forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    groupSelect.appendChild(opt);

    const btn = document.createElement('div');
    btn.className = 'group';
    btn.tabIndex = 0;
    btn.textContent = `${g} (${byGroup[g].length})`;
    btn.onclick = () => {
      groupSelect.value = g;
      filterAndRender();
      btn.focus();
    };
    btn.onkeypress = e => {
      if (e.key === 'Enter') btn.onclick();
    };
    groupsContainer.appendChild(btn);
  });
}

function filterAndRender() {
  const q = searchInput.value.trim().toLowerCase();
  const sel = groupSelect.value;
  const filtered = channels.filter(ch => {
    if (sel !== '__all' && ch.group !== sel) return false;
    if (q && !(ch.title.toLowerCase().includes(q) || (ch.group && ch.group.toLowerCase().includes(q)))) return false;
    return true;
  });
  renderChannels(filtered);
}

function renderChannels(list) {
  channelsEl.innerHTML = '';
  if (list.length === 0) {
    channelsEl.innerHTML = '<div class="muted">Nenhum canal encontrado.</div>';
    return;
  }
  list.forEach((ch, idx) => {
    const el = document.createElement('div');
    el.className = 'channel';
    el.tabIndex = 0;
    el.dataset.index = idx;

    const img = document.createElement('img');
    img.src = ch.logo || 'https://via.placeholder.com/88x48?text=TV';
    img.loading = 'lazy';

    const title = document.createElement('div');
    title.style.flex = '1';

    const tMain = document.createElement('div');
    tMain.textContent = ch.title;

    const tSub = document.createElement('div');
    tSub.textContent = ch.group;
    tSub.className = 'muted';
    tSub.style.fontSize = '12px';

    title.appendChild(tMain);
    title.appendChild(tSub);
    el.appendChild(img);
    el.appendChild(title);

    el.onclick = () => playChannel(ch);
    el.onkeypress = e => {
      if (e.key === 'Enter') el.onclick();
    };

    channelsEl.appendChild(el);
  });
}

function playChannel(ch) {
  currentTitle.textContent = ch.title;
  currentGroup.textContent = ch.group;
  localStorage.setItem('lastChannel', JSON.stringify(ch));

  document.querySelectorAll('.channel').forEach(el => el.classList.remove('active-channel'));
  const el = document.querySelector(`.channel[data-index="${channels.indexOf(ch)}"]`);
  if (el) el.classList.add('active-channel');

  const url = ch.url;
  if (Hls.isSupported() && url.match(/\.m3u8($|\?)/i)) {
    if (window._hls) {
      window._hls.destroy();
      window._hls = null;
    }
    const hls = new Hls({ capLevelToPlayerSize: true });
    window._hls = hls;
    hls.loadSource(url);
    hls.attachMedia(player);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      player.play().catch(() => {});
    });
  } else {
    player.src = url;
    player.play().catch(() => {});
  }
}

document.getElementById('loadBtn').addEventListener('click', async () => {
  const url = document.getElementById('m3uUrl').value.trim();
  if (!url) {
    alert('Cole a URL M3U ou envie um arquivo .m3u no campo "Escolher arquivo".');
    return;
  }
  loadingEl.style.display = 'block';
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Erro ao baixar M3U: ' + resp.status);
    const txt = await resp.text();
    channels = parseM3U(txt);
    renderGroups();
    filterAndRender();
  } catch (err) {
    alert('Falha ao carregar lista: ' + err.message + '\nSe for CORS, cole o link direto bruto (raw).');
  }
  loadingEl.style.display = 'none';
});

document.getElementById('fileInput').addEventListener('change', async ev => {
  const f = ev.target.files[0];
  if (!f) return;
  const txt = await f.text();
  channels = parseM3U(txt);
  renderGroups();
  filterAndRender();
});

searchInput.addEventListener('input', filterAndRender);
groupSelect.addEventListener('change', filterAndRender);

document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

document.getElementById('openInNew').addEventListener('click', () => {
  const src = player.currentSrc || player.src;
  if (!src) {
    alert('Nenhum stream ativo');
    return;
  }
  window.open(src, '_blank');
});

document.addEventListener('keydown', e => {
  const active = document.activeElement;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const items = Array.from(document.querySelectorAll('.channel'));
    let idx = items.indexOf(active);
    if (idx === -1) idx = 0;
    if (e.key === 'ArrowDown') idx = Math.min(items.length - 1, idx + 1);
    if (e.key === 'ArrowUp') idx = Math.max(0, idx - 1);
    items[idx] && items[idx].focus();
    e.preventDefault();
  } else if (e.key === 'Enter') {
    if (active && active.classList.contains('channel')) active.click();
  } else if (e.key === 'Backspace' || e.key === 'Escape') {
    document.getElementById('search').focus();
  }
});

window.addEventListener('load', () => {
  const saved = localStorage.getItem('lastChannel');
  if (saved) {
    const ch = JSON.parse(saved);
    playChannel(ch);
    const input = document.getElementById("iptvUrl");
const button = document.getElementById("loadBtn");

input.addEventListener("input", () => {
  const url = input.value.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    button.classList.add("ready");
  } else {
    button.classList.remove("ready");
  }
});
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

});
