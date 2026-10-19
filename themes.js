(() => {
  const themes = [
    { id: 'light', name: 'Light', colors: { '--ink':'#17181b','--paper':'#f3f1e9','--muted':'#77766f','--lime':'#d9f365','--pink':'#ff6b8f','--blue':'#859fff','--line':'rgba(23,24,27,.18)','--section':'#e9e7df','--panel':'#fffdf5','--hero-art':'#d9f365','--card-a':'#f1efb6','--card-b':'#ffc7d2','--card-c':'#d2dcff','--card-d':'#c8e9d2','--card-e':'#f7d9ad' } },
    { id: 'dark', name: 'Dark', colors: { '--ink':'#f4f1e8','--paper':'#17191f','--muted':'#aaa9b3','--lime':'#c9f36b','--pink':'#ff7299','--blue':'#8ca5ff','--line':'rgba(244,241,232,.18)','--section':'#22242c','--panel':'#2b2d35','--hero-art':'#b6df61','--card-a':'#34382b','--card-b':'#452f3a','--card-c':'#2d3750','--card-d':'#293d35','--card-e':'#494034' } },
    { id: 'cyber', name: 'Cyber Hacker', colors: { '--ink':'#a8ffe2','--paper':'#06100f','--muted':'#6bcbaa','--lime':'#a8ff00','--pink':'#ff3bf5','--blue':'#22e4ff','--line':'rgba(118,255,214,.24)','--section':'#0a1b19','--panel':'#10231f','--hero-art':'#00d49b','--card-a':'#123b2d','--card-b':'#3b1740','--card-c':'#103647','--card-d':'#174435','--card-e':'#344017' } },
    { id: 'space', name: 'Space', colors: { '--ink':'#f2eaff','--paper':'#101127','--muted':'#aaa8d0','--lime':'#f0d76b','--pink':'#f27bbd','--blue':'#8ea8ff','--line':'rgba(225,220,255,.2)','--section':'#191b38','--panel':'#24264a','--hero-art':'#5948aa','--card-a':'#383256','--card-b':'#56304d','--card-c':'#303e68','--card-d':'#284a53','--card-e':'#665034' } },
    { id: 'nature', name: 'Nature', colors: { '--ink':'#26382b','--paper':'#eff4e8','--muted':'#667a66','--lime':'#9ac66a','--pink':'#d97978','--blue':'#789ab2','--line':'rgba(38,56,43,.2)','--section':'#e1ead8','--panel':'#f9fbf1','--hero-art':'#a8c87a','--card-a':'#d8e5b8','--card-b':'#efc7ba','--card-c':'#c8d9e3','--card-d':'#c3dfc4','--card-e':'#ead8ad' } },
    { id: 'sunset', name: 'Sunset', colors: { '--ink':'#492d45','--paper':'#fff0e6','--muted':'#8d6678','--lime':'#ffc36b','--pink':'#f36b79','--blue':'#9b7bc1','--line':'rgba(73,45,69,.2)','--section':'#f6ded7','--panel':'#fff9f2','--hero-art':'#ff9e7c','--card-a':'#f3d49f','--card-b':'#f2bdc0','--card-c':'#d9c8e8','--card-d':'#c8d9c4','--card-e':'#f0c48c' } },
    { id: 'ocean', name: 'Ocean', colors: { '--ink':'#173846','--paper':'#eaf6f6','--muted':'#547883','--lime':'#68d6c7','--pink':'#f27fa1','--blue':'#54a9d3','--line':'rgba(23,56,70,.2)','--section':'#d7ecee','--panel':'#f6ffff','--hero-art':'#64c6d1','--card-a':'#c7e2c8','--card-b':'#f3c9d4','--card-c':'#b9dfea','--card-d':'#aee1d6','--card-e':'#d9dfbd' } },
    { id: 'candy', name: 'Candy', colors: { '--ink':'#502d4c','--paper':'#fff0f7','--muted':'#916b88','--lime':'#b6e96f','--pink':'#ff75b8','--blue':'#8da9ff','--line':'rgba(80,45,76,.18)','--section':'#f7ddeb','--panel':'#fffaff','--hero-art':'#ffa5cf','--card-a':'#f5dc9d','--card-b':'#ffc5dc','--card-c':'#d2d5ff','--card-d':'#c3ead0','--card-e':'#f6d2b6' } },
    { id: 'retro', name: 'Retro Arcade', colors: { '--ink':'#fff2c7','--paper':'#21183b','--muted':'#c6a9db','--lime':'#f7ed58','--pink':'#ff5fa2','--blue':'#52d7f2','--line':'rgba(255,242,199,.22)','--section':'#30224f','--panel':'#3c2d5d','--hero-art':'#f0519d','--card-a':'#51426b','--card-b':'#65334e','--card-c':'#334e74','--card-d':'#315e58','--card-e':'#735533' } },
    { id: 'synthwave', name: 'Synthwave', colors: { '--ink':'#fff0ff','--paper':'#24102f','--muted':'#d298ce','--lime':'#ffcf5d','--pink':'#ff4fc8','--blue':'#6c8dff','--line':'rgba(255,240,255,.2)','--section':'#351448','--panel':'#461c59','--hero-art':'#f044b5','--card-a':'#58336b','--card-b':'#70274d','--card-c':'#394b86','--card-d':'#295f66','--card-e':'#775039' } },
    { id: 'desert', name: 'Desert', colors: { '--ink':'#493726','--paper':'#f6edda','--muted':'#87745a','--lime':'#d8a949','--pink':'#c86f62','--blue':'#718c9c','--line':'rgba(73,55,38,.2)','--section':'#eadfc9','--panel':'#fff8e9','--hero-art':'#d8a949','--card-a':'#e4d49e','--card-b':'#e9c2ac','--card-c':'#c3d0cf','--card-d':'#c7d0a5','--card-e':'#e9bd82' } },
    { id: 'lavender', name: 'Lavender', colors: { '--ink':'#342b50','--paper':'#f3efff','--muted':'#7c7199','--lime':'#c3e77c','--pink':'#e987bd','--blue':'#8996e8','--line':'rgba(52,43,80,.18)','--section':'#e5def6','--panel':'#fcfaff','--hero-art':'#b6a4ee','--card-a':'#dce3b1','--card-b':'#f0c4dc','--card-c':'#c7ceef','--card-d':'#c2dfce','--card-e':'#efdbb2' } },
    { id: 'mint', name: 'Mint', colors: { '--ink':'#21443d','--paper':'#eaf8f1','--muted':'#60867b','--lime':'#9ce58a','--pink':'#ed8cab','--blue':'#7caed0','--line':'rgba(33,68,61,.2)','--section':'#d7eee3','--panel':'#f7fff9','--hero-art':'#77d7aa','--card-a':'#d4e8ad','--card-b':'#f3c8d3','--card-c':'#c7deeb','--card-d':'#aee2c7','--card-e':'#eddbad' } },
    { id: 'cherry', name: 'Cherry', colors: { '--ink':'#4b202d','--paper':'#fff0f0','--muted':'#936573','--lime':'#c4df78','--pink':'#f15771','--blue':'#8999d2','--line':'rgba(75,32,45,.2)','--section':'#f4dfe0','--panel':'#fffafa','--hero-art':'#ef687d','--card-a':'#e5dfaa','--card-b':'#f4b9c5','--card-c':'#cbd2ed','--card-d':'#c1dfc4','--card-e':'#ecc59f' } },
    { id: 'mono', name: 'Monochrome', colors: { '--ink':'#191919','--paper':'#f1f1ef','--muted':'#737373','--lime':'#c8c8c4','--pink':'#a3a3a3','--blue':'#777b80','--line':'rgba(25,25,25,.2)','--section':'#dededb','--panel':'#fafaf8','--hero-art':'#bcbcb7','--card-a':'#deded1','--card-b':'#d8d1d1','--card-c':'#d0d2d3','--card-d':'#cbd2ca','--card-e':'#ded5c9' } },
    { id: 'autumn', name: 'Autumn', colors: { '--ink':'#492e20','--paper':'#fbf0dc','--muted':'#896d51','--lime':'#d6aa47','--pink':'#c8664c','--blue':'#7189a1','--line':'rgba(73,46,32,.2)','--section':'#eee0c7','--panel':'#fff8eb','--hero-art':'#d99744','--card-a':'#e5d49c','--card-b':'#edc3ae','--card-c':'#c5d0d5','--card-d':'#c6d2aa','--card-e':'#e8bc7d' } },
    { id: 'sakura', name: 'Sakura', colors: { '--ink':'#4a3243','--paper':'#fff4f6','--muted':'#987989','--lime':'#bdd98a','--pink':'#ef8eae','--blue':'#94a9d0','--line':'rgba(74,50,67,.18)','--section':'#f6e2e9','--panel':'#fffafd','--hero-art':'#f3aac0','--card-a':'#e6e6b5','--card-b':'#f6c6d8','--card-c':'#d0d9ed','--card-d':'#c9e2d1','--card-e':'#f0d3b5' } },
    { id: 'golden', name: 'Golden Hour', colors: { '--ink':'#3d3420','--paper':'#fff6d9','--muted':'#84754c','--lime':'#e6c34f','--pink':'#e88769','--blue':'#8295b4','--line':'rgba(61,52,32,.2)','--section':'#f0e5bd','--panel':'#fffbed','--hero-art':'#e9bd51','--card-a':'#e5dfa2','--card-b':'#f0c9b3','--card-c':'#cbd6e5','--card-d':'#c9dfb3','--card-e':'#edc98d' } },
    { id: 'ice', name: 'Ice', colors: { '--ink':'#1f3c51','--paper':'#edf8ff','--muted':'#64849b','--lime':'#9ce4da','--pink':'#f28cae','--blue':'#72b9e7','--line':'rgba(31,60,81,.2)','--section':'#dceef7','--panel':'#f9fdff','--hero-art':'#8ed7ed','--card-a':'#d7e9c2','--card-b':'#f2cad6','--card-c':'#bee1f1','--card-d':'#c0e7df','--card-e':'#e8dfc2' } },
    { id: 'terminal', name: 'Terminal', colors: { '--ink':'#65ff83','--paper':'#080d09','--muted':'#54b968','--lime':'#b6ff00','--pink':'#ff5e7d','--blue':'#4ed9c5','--line':'rgba(101,255,131,.23)','--section':'#101b12','--panel':'#142119','--hero-art':'#134d25','--card-a':'#18351e','--card-b':'#3d1e29','--card-c':'#163438','--card-d':'#1a4029','--card-e':'#40361a' } }
  ];

  const toggle = document.getElementById('theme-toggle');
  const menu = document.getElementById('theme-menu');
  const options = document.getElementById('theme-options');
  const current = document.getElementById('theme-current');
  if (!toggle || !menu || !options) return;
  const savedId = localStorage.getItem('playroom.theme') || 'light';

  function applyTheme(theme, save = true) {
    document.body.dataset.theme = theme.id;
    Object.entries(theme.colors).forEach(([property, value]) => document.documentElement.style.setProperty(property, value));
    current.textContent = theme.name.toUpperCase();
    if (save) localStorage.setItem('playroom.theme', theme.id);
    options.querySelectorAll('.theme-option').forEach(option => {
      const selected = option.dataset.theme === theme.id;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    document.documentElement.style.colorScheme = ['dark','cyber','space','retro','synthwave','terminal'].includes(theme.id) ? 'dark' : 'light';
  }

  themes.forEach(theme => {
    const option = document.createElement('button');
    option.type = 'button'; option.className = 'theme-option'; option.dataset.theme = theme.id;
    option.style.setProperty('--theme-preview-paper', theme.colors['--paper']);
    option.style.setProperty('--theme-preview-ink', theme.colors['--ink']);
    option.style.setProperty('--theme-preview-accent', theme.colors['--lime']);
    option.innerHTML = `<span class="theme-swatch" aria-hidden="true"></span><span class="theme-name">${theme.name}</span><span class="theme-check" aria-hidden="true">✓</span>`;
    option.onclick = () => applyTheme(theme);
    options.append(option);
  });

  const selected = themes.find(theme => theme.id === savedId) || themes[0];
  applyTheme(selected, false);
  toggle.onclick = () => {
    const open = menu.hidden;
    menu.hidden = !open; toggle.setAttribute('aria-expanded', String(open));
    if (open) options.querySelector('.selected')?.focus();
  };
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.theme-picker')) { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  });
})();

