import type { Register, ThemeSetArgs, ThemeBackdropGlass } from 'claude-code'

import { makeColors } from './make-colors.js'
import { RAZZO } from './scena'

// Carbone (Pulsar) di sera, chiaro bianco e grigio senza accento di giorno.
const { theme, problems } = makeColors({
  label: 'Spazio Carbone',
  roles: { accent: '#E9E6EC', danger: '#E07A72', success: '#8FBF9A', warning: '#E3BC79', pro: '#B7A6E0' },
  light: {
    roles: { accent: '#1C1F28', danger: '#B5483F', success: '#4F7A5A', warning: '#9A6B1F', pro: '#6B5A94' },
    gray: {
      anchors: {
        'surface-0': '#EEF0F3',
        'surface-1': '#F6F7F9',
        'surface-2': '#F6F7F9',
        'text-primary': '#1C1F28',
        'text-secondary': '#4A4D55',
        'text-muted': '#5F626A',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#121013',
        'surface-1': '#18151A',
        'surface-2': '#1C191D',
        'surface-3': '#221F24',
        'text-primary': '#EEEBF0',
        'text-secondary': '#A6A3A8',
        'text-muted': '#8A878C',
      },
      // Bordi più leggeri: i contorni dell'app sono il grigio più chiaro al 10%, quindi si abbassa quel grigio.
      stops: { 0: '#8E8A92', 10: '#8E8A92', 20: '#8E8A92', 30: '#8E8A92', 40: '#8E8A92' },
    },
  },
})

// Tre modi di stare sopra il razzo: /vetro passa dall'uno all'altro.
type Velo = 'sfocato' | 'velo' | 'pieno'
const VELI: Velo[] = ['sfocato', 'velo', 'pieno']
const VETRO: Record<Velo, ThemeBackdropGlass | false> = {
  sfocato: { blur: 28, tint: '#121013', opacity: 0.42 },
  velo: { blur: 0, opacity: 0.82 },
  pieno: false,
}
const NOMI: Record<Velo, string> = {
  sfocato: 'Vetro sfocato',
  velo: 'Velo pieno, senza sfocatura',
  pieno: 'Pannelli pieni',
}

const look = (velo: Velo): ThemeSetArgs => ({
  colors: theme,
  backdrop: { scene: 'razzo', glass: VETRO[velo] },
})

const leggiVelo = (v: unknown): Velo => (VELI.includes(v as Velo) ? (v as Velo) : 'sfocato')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const bloccante = problems.find(line => line.startsWith("Desktop won't paint"))
    if (bloccante !== undefined) {
      $.ui.toast(bloccante)
    }
    await $.command.register({ name: 'vetro', description: 'Cambia il velo sopra il razzo: sfocato, pieno senza sfocatura, pannelli pieni' })
    const set = await $.theme.set(look(leggiVelo(await $.store.get('velo'))))
    // Lo stato dice solo un problema vero; quando il tema si disegna, la riga si toglie.
    $.ui.status(set.isDrawn ? undefined : set.reason)
    return next(e)
  })

  on('command.run', { command: 'vetro' }, async $ => {
    const ora = leggiVelo(await $.store.get('velo'))
    const dopo = VELI[(VELI.indexOf(ora) + 1) % VELI.length] ?? 'sfocato'
    await $.store.set('velo', dopo)
    await $.theme.set(look(dopo))
    return { text: NOMI[dopo] }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'razzo') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={RAZZO} alt="La navicella a pixel di Spazio che fluttua sopra un paesaggio a pixel grigio" isInteractive />
  })
}
