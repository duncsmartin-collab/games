// ---------- start ----------
applySkin(); syncUI(); newPuzzle(); wgNew(); cwNew(); drawBusters(); greet(); show();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (PZ) layout(); cwLayout(); });
window.FETCH = { get puzzle() { return PZ; }, CW, S, award, finish, complete, busterBonus };
