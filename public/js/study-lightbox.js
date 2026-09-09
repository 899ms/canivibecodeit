/* Study figures: click to enlarge. Every figure is a plain link to its
   full-size file (works with no JS); with JS the link opens the page's
   <dialog class="study-lightbox"> instead: dark backdrop, image contained
   to the viewport, caption under it. Closes on the X, a click on the
   backdrop, or Escape (native to <dialog>); focus goes back to the link
   that opened it. External file: the CSP script allowlist stays hash-free. */
(() => {
  const dialog = document.querySelector('dialog.study-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const img = dialog.querySelector('img');
  const cap = dialog.querySelector('figcaption');
  const closeBtn = dialog.querySelector('[data-lb-close]');
  let opener = null;

  const open = (link) => {
    opener = link;
    const inner = link.querySelector('img');
    img.src = link.getAttribute('href');
    img.alt = inner ? inner.alt : '';
    const caption = link.dataset.caption || (inner ? inner.alt : '');
    cap.textContent = caption;
    cap.hidden = !caption;
    dialog.showModal();
    closeBtn.focus();
  };

  // Capture phase: the site's view-transition router also listens for link
  // clicks (bubble) and would navigate to the image; it skips clicks whose
  // default is already prevented, so this must run first.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-zoom]');
    if (link) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" through
      e.preventDefault();
      open(link);
      return;
    }
    if (!dialog.open) return;
    if (e.target.closest('[data-lb-close]')) {
      dialog.close();
      return;
    }
    // a click on the dialog element itself (not its content) is the backdrop
    if (e.target === dialog) dialog.close();
  }, true);

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    if (opener) {
      opener.focus();
      opener = null;
    }
  });
})();
