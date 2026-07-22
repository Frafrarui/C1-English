document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.paragraph-bank').forEach((bank) => {
    const container = bank.closest('.exam-part');
    if (!container) return;

    const gapTargets = container.querySelectorAll('.gap-target');
    const optionButtons = bank.querySelectorAll('.paragraph-option');
    const hint = bank.querySelector('.bank-hint');
    let activeGap = null;

    function setActiveGap(gap) {
      gapTargets.forEach((g) => g.classList.remove('active'));
      activeGap = gap;
      if (gap) gap.classList.add('active');
    }

    function updateOptionAvailability() {
      const used = new Set();
      gapTargets.forEach((g) => {
        if (g.dataset.filledLetter) used.add(g.dataset.filledLetter);
      });
      optionButtons.forEach((btn) => {
        const isUsed = used.has(btn.dataset.letter);
        btn.classList.toggle('used', isUsed);
        btn.disabled = isUsed;
      });
    }

    function fillGap(gap, letter, text) {
      gap.dataset.filledLetter = letter;
      gap.querySelector('.gap-target-label').classList.add('hidden');
      const contentEl = gap.querySelector('.gap-target-content');
      contentEl.textContent = `${letter}) ${text}`;
      contentEl.classList.remove('hidden');
      gap.querySelector('input[type="hidden"]').value = letter;
      gap.classList.add('filled');
      updateOptionAvailability();
    }

    function clearGap(gap) {
      delete gap.dataset.filledLetter;
      gap.querySelector('.gap-target-label').classList.remove('hidden');
      const contentEl = gap.querySelector('.gap-target-content');
      contentEl.textContent = '';
      contentEl.classList.add('hidden');
      gap.querySelector('input[type="hidden"]').value = '';
      gap.classList.remove('filled');
      updateOptionAvailability();
    }

    gapTargets.forEach((gap) => {
      gap.addEventListener('click', () => {
        if (gap.classList.contains('filled')) {
          clearGap(gap);
          setActiveGap(null);
          return;
        }
        setActiveGap(gap === activeGap ? null : gap);
      });
    });

    optionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        if (!activeGap) {
          if (hint) {
            hint.classList.add('shake');
            setTimeout(() => hint.classList.remove('shake'), 400);
          }
          return;
        }
        fillGap(activeGap, btn.dataset.letter, btn.dataset.text);
        setActiveGap(null);
      });
    });
  });
});
