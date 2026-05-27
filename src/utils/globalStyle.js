const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  :root {
    --accent: #1D9E75; --accent-hover: #0F6E56; --accent-light: #E1F5EE;
    --accent-text: #085041; --sidebar-bg: #04342C; --sidebar-w: 230px;
    --bg: #FAFAF8; --surface: #FFFFFF; --surface2: #F5F4F0;
    --border: rgba(0,0,0,0.08); --border2: rgba(0,0,0,0.14);
    --text: #1a1a18; --text2: #6b6b67; --text3: #9b9b97;
    --radius: 8px; --radius-lg: 12px; --radius-xl: 16px;
    --shadow: 0 1px 4px rgba(0,0,0,0.08); --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
  }
  * { font-family: 'Be Vietnam Pro', sans-serif; }
  body { background: var(--bg); color: var(--text); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  /* Animation */
  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .page-content > * { animation: fadeIn 0.25s ease both; }

  /* Form controls */
  .form-control {
    height: 38px; padding: 0 12px; border: 1px solid var(--border2);
    border-radius: var(--radius);
    font-size: 13.5px; color: var(--text); background: white; outline: none; transition: 0.15s; width: 100%;
  }
  .form-control:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(29,158,117,0.12); }
  select.form-control { cursor: pointer; }
  textarea.form-control { height: 80px; padding: 10px 12px; resize: none; }

  /* Data table */
  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .data-table th {
    text-align: left; color: var(--text3); font-weight: 600; font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.06em; padding: 10px 16px;
    border-bottom: 1px solid var(--border); background: var(--surface2);
  }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); color: var(--text); }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tbody tr:hover td { background: #F8FBF9; }
  .td-name { font-weight: 500; }
  .td-muted { color: var(--text2); font-size: 12px; }

  /* Ring SVG */
  svg.ring { transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: var(--surface2); stroke-width: 8; }
  .ring-fill { fill: none; stroke: var(--accent); stroke-width: 8; stroke-linecap: round; }

  /* Inv rows */
  .inv-row {
    display: flex; justify-content: space-between; padding: 8px 0;
    border-bottom: 1px solid var(--border); font-size: 13.5px;
  }
  .inv-row:last-child { border-bottom: none; font-weight: 600; font-size: 14.5px; }
  .inv-total { color: var(--accent); }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; right: 24px; background: var(--text); color: white;
    padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500;
    box-shadow: var(--shadow-md); z-index: 2000; display: flex; align-items: center; gap: 8px;
    transform: translateY(20px); opacity: 0; transition: 0.25s; pointer-events: none;
  }
  .toast.show { transform: translateY(0); opacity: 1; }

  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; opacity: 0; pointer-events: none; transition: 0.2s;
  }
  .modal-backdrop.open { opacity: 1; pointer-events: all; }
  .modal-inner {
    background: white; border-radius: var(--radius-xl); width: 520px; max-width: 95vw;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18); transform: translateY(10px);
    transition: 0.2s; max-height: 90vh; overflow-y: auto;
  }
  .modal-backdrop.open .modal-inner { transform: translateY(0); }

  /* Search */
  .search-input {
    width: 240px; height: 34px; padding: 0 12px 0 34px;
    border: 1px solid var(--border2); border-radius: var(--radius);
    font-size: 13px;
    background: white; outline: none; transition: 0.15s; color: var(--text);
  }
  .search-input:focus { border-color: var(--accent); width: 280px; }

  /* CI list */
  .ci-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 18px;
    border-bottom: 1px solid var(--border); transition: 0.12s; cursor: pointer;
  }
  .ci-item:last-child { border-bottom: none; }
  .ci-item:hover { background: #F8FBF9; }

  /* Bar chart */
  .bar-fill { width: 100%; background: var(--accent-light); border-radius: 4px 4px 0 0; min-height: 4px; transition: 0.2s; cursor: pointer; }
  .bar-fill:hover, .bar-fill.hi { background: var(--accent); }

  /* Progress */
  .progress-bar { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: 0.3s; }

  /* Dot colors */
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .dot-green { background: var(--accent); }
  .dot-red { background: #E24B4A; }
  .dot-amber { background: #EF9F27; }
  .dot-blue { background: #378ADD; }
  .notif-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #E24B4A; border: 2px solid var(--sidebar-bg); }
`;

export default globalStyle;