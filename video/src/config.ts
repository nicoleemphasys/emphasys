// Single source of truth for timing, copy, colors and asset paths.
// Frame numbers are absolute (30 fps) unless noted as scene-local.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 2250;

export const COLORS = {
  deep: '#052E65',
  navy: '#21437C',
  sky: '#43A7F9',
  orange: '#F76B13',
  orangeLight: '#FF9A5C',
  band: '#FFF1E6',
  white: '#FFFFFF',
};

export const FONT = {
  family: 'Poppins',
  bold: 700,
  medium: 500,
  regular: 400,
  tracking: -0.025, // em
};

export const SCENES = {
  s01: {title: 'The keys', start: 0, end: 180},
  s02: {title: 'The people behind it', start: 180, end: 480},
  s03: {title: 'Clearer workflows', start: 480, end: 720},
  s04: {title: 'Compliance confidence', start: 720, end: 960},
  s05: {title: 'Better resident experiences', start: 960, end: 1200},
  s06: {title: 'Stronger staff support', start: 1200, end: 1440},
  s07: {title: 'More useful insight', start: 1440, end: 1680},
  s08: {title: 'Fifty years', start: 1680, end: 1890},
  s09: {title: 'Come add your tile', start: 1890, end: 2250},
} as const;

export type SceneId = keyof typeof SCENES;
export const sceneLength = (id: SceneId) => SCENES[id].end - SCENES[id].start;

// Vessel tags for scenes 3–7 (index = tracker dot).
export const VESSELS = [
  'Clearer workflows',
  'Compliance confidence',
  'Better resident experiences',
  'Stronger staff support',
  'More useful insight',
];

// On-screen copy, used exactly as written in the brief.
export const COPY = {
  s01: ['Somewhere today,', 'someone gets the keys', 'to a', 'home.'],
  s02: {
    intro: ['Behind every', 'set of keys:'],
    roles: ['A caseworker.', 'An inspector.', 'A finance team.', 'A front desk.'],
    you: 'You.',
  },
  s03: ['Less chasing paper.', 'More time', 'for people.'],
  s04: {
    checklist: ['Unit inspected', 'Files complete', 'Deadlines on track'],
    headline: ['Walk into every', 'review', 'ready.'],
  },
  s05: {
    cardTitle: 'Submitted',
    cardBody: 'We got it. No trip needed.',
    headline: ['Fewer trips downtown.', 'Faster answers', 'for families.'],
  },
  s06: ['Help that', 'shows up on', 'the', 'hard days.'],
  s07: [
    'See what’s happening',
    'across your agency',
    'while there’s still',
    'time to act.',
  ],
  s08: {
    range: '1976 – 2026',
    headline: ['Fifty years alongside', 'the people who', 'house people.'],
  },
  s09: {
    tagline: ['For the people', 'who house people.'],
    question: ['What makes', 'home possible?'],
    booth: 'Come tell us at Booth #1504',
  },
};

// Footage clips. Drop the files into public/footage/ with these exact names.
// Missing clips render as striped placeholders.
export const FOOTAGE = {
  s01Keys: {file: 's01-keys.mp4', note: 'Keys mid-fall into an open palm, warm window light. Push-in 105% → 112%.'},
  s02Files: {file: 's02-files.mp4', note: 'Stacked case files\non a desk'},
  s02Inspector: {file: 's02-inspector.mp4', note: ''},
  s02Phone: {file: 's02-phone.mp4', note: ''},
  s02LateOffice: {file: 's02-lateoffice.mp4', note: ''},
  s03PaperStack: {file: 's03-paperstack.mp4', note: 'Hands sorting a tall stack of files'},
  s04Detector: {file: 's04-inspector-detector.mp4', note: 'Inspector checking a smoke detector, tablet in hand'},
  s04Tablet: {file: 's04-tablet.mp4', note: 'Tablet checklist close-up'},
  s05KitchenPhone: {file: 's05-kitchen-phone.mp4', note: 'Hands holding a phone at a kitchen table. No faces.'},
  s05Mailbox: {file: 's05-mailbox.mp4', note: ''},
  s05Fridge: {file: 's05-fridge.mp4', note: ''},
  s06Huddle: {file: 's06-huddle.mp4', note: 'Team huddle at a whiteboard'},
  s06Laughing: {file: 's06-laughing.mp4', note: 'Two coworkers laughing at a desk'},
  s06SupportTeam: {file: 's06-support-team.mp4', note: 'Support team\non headsets'},
  s07Director: {file: 's07-director.mp4', note: ''},
  s09TileDrop: {file: 's09-tile-drop.mp4', note: 'Slow-mo hand dropping an acrylic tile\ninto a vessel'},
};
