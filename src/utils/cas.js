// Časi predstav so stenski čas kina: predstava ob 20:00 je v bazi zapisana
// kot 20:00, API pa jo pošlje kot niz ISO v UTC (...T20:00:00.000Z). Zato
// jih povsod beremo v UTC; pretvorba v krajevni pas brskalnika bi čas
// zamaknila za eno do dve uri.

// Vrednost za <input type="datetime-local"> (LLLL-MM-DDTuu:mm)
export const zaVnosDatumaInUre = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');
