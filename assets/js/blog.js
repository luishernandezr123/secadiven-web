/*!
 * Shared blog functions: YAML frontmatter parser, markdown renderer, date formatter.
 * Used by both blog/index.html and blog/entrada.html
 */

(function() {
  'use strict';

  /* Simple YAML frontmatter parser (no external lib needed) */
  function parseFrontmatter(md) {
    var front = {};
    var match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: md };

    var yaml = match[1];
    var body = match[2];

    yaml.split('\n').forEach(function(line) {
      var colonIdx = line.indexOf(':');
      if (colonIdx === -1) return;
      var key = line.substring(0, colonIdx).trim();
      var value = line.substring(colonIdx + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      front[key] = value;
    });

    return { meta: front, body: body };
  }

  /* Date formatter: YYYY-MM-DD → "25 de mayo de 2026" (es-VE) */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    var day = parseInt(parts[2], 10);
    var month = months[parseInt(parts[1], 10) - 1];
    var year = parts[0];
    return day + ' de ' + month + ' de ' + year;
  }

  /* Render markdown using Marked.js (loaded from CDN in blog pages) */
  function renderMarkdown(md) {
    if (typeof marked !== 'undefined' && marked.parse) {
      return marked.parse(md);
    }
    /* Fallback: basic markdown-to-HTML */
    return md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hbulo])/gm, '<p>$&')
      .replace(/([^>])$/gm, '$1</p>');
  }

  window.BlogUtils = {
    parseFrontmatter: parseFrontmatter,
    formatDate: formatDate,
    renderMarkdown: renderMarkdown
  };
})();
