/**
 * The Loeby Program — content.
 *
 * Two tracks run in parallel:
 *  1. REHAB — phase-gated hamstring rehab. Advances on passing criteria, never on
 *     a calendar. Gates are modelled on protocols whose reinjury rates are ~1–4%
 *     rather than the ~30% typical of "rest until it stops hurting".
 *  2. FOUNDATION — the movement/posture rebuild. Unaffected by the hamstring, so
 *     it starts on day one and never ends.
 *
 * Every lesson follows the same three beats:
 *   what's happening → what it fixes → what it changes (visually).
 * The third beat is always last and always framed as a consequence.
 */

export interface VideoRef {
  title: string;
  by: string;
  url: string;
  /** true = a specific verified video; false = creator/resource hub */
  isVideo: boolean;
}

export interface Movement {
  id: string;
  name: string;
  dose: string;
  cue: string;
  why?: string;
  video?: VideoRef;
}

export interface Block {
  title: string;
  note?: string;
  /** Nothing in the block is required. Shown as a chip, and left out of the
   *  block's done count so it never reads as an unfinished obligation. */
  optional?: boolean;
  movements: Movement[];
}

/**
 * One prescribed day inside a phase. `required` names movement ids from the
 * phase's own blocks — days select from that library rather than duplicating it,
 * so a cue only ever needs editing in one place.
 *
 * The last day of a phase is the steady state: it repeats until the phase gates
 * are passed. Days advance on a completed day followed by a clean next morning,
 * never on a calendar.
 */
export interface Day {
  n: number;
  name: string;
  /** Shown at the top of the day — what today is, and what's new about it. */
  intro: string;
  required: string[];
  /** Foundation movement ids running alongside the phase work today. */
  foundation: string[];
}

export interface Phase {
  id: number;
  name: string;
  headline: string;
  goal: string;
  /** Objective criteria required to unlock the next phase. */
  gate: string[];
  blocks: Block[];
  avoid?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  whatsHappening: string;
  whatItFixes: string;
  /** The quiet one. Always last, always a consequence — never the pitch. */
  whatChanges: string;
  video?: VideoRef;
}

// ---------------------------------------------------------------- videos

/**
 * Every `isVideo: true` entry below was checked against YouTube directly —
 * playabilityStatus OK, with the title and channel read back off the watch page.
 * If you add one, verify it the same way rather than trusting a search result.
 */
const V = {
  // ---- mechanism / lessons
  harrisHamstrings: {
    title: 'The Secret To Fixing Tight Hamstrings (99% have never tried this)',
    by: 'Conor Harris · Biomechanics',
    url: 'https://www.youtube.com/watch?v=t6Sk4qF2JdQ',
    isVideo: true,
  },

  // ---- Phase 0
  isoHeelPress: {
    title: 'Supine isometric heel digs',
    by: 'Aspetar · Sports medicine hospital',
    url: 'https://www.youtube.com/watch?v=SKKxhCgQ7hM',
    isVideo: true,
  },
  breathing9090: {
    title: '90/90 breathing — reset your breathing, reduce rib flare',
    by: 'Pilates with Cassie',
    url: 'https://www.youtube.com/watch?v=ERfHfl_6bGY',
    isVideo: true,
  },
  deadBug: {
    title: "You're doing dead bugs wrong — fix this",
    by: 'Squat University',
    url: 'https://www.youtube.com/watch?v=0XVbn86Btj0',
    isVideo: true,
  },
  gluteMedius: {
    title: 'The weakest muscle in your lower body (your glute medius)',
    by: 'Cori Lefkowith · Redefining Strength',
    url: 'https://www.youtube.com/watch?v=qv6wzV1AayI',
    isVideo: true,
  },
  awakenGlutes: {
    title: 'How to awaken your glutes — 3 moves daily',
    by: 'Cori Lefkowith · Redefining Strength',
    url: 'https://www.youtube.com/watch?v=M3Ox0WssrsI',
    isVideo: true,
  },
  kneeToWall: {
    title: 'Knee-to-wall for ankle mobility',
    by: 'Dr. Jess Harvey · Osteopath',
    url: 'https://www.youtube.com/watch?v=ElrpduJn92Y',
    isVideo: true,
  },
  thoracic: {
    title: 'Improve thoracic mobility in 5 minutes',
    by: 'Dr. Jen Fraboni, PT, DPT · DocJenFit',
    url: 'https://www.youtube.com/watch?v=FvAQGRP1-3M',
    isVideo: true,
  },
  hipFlexors: {
    title: '3 exercises to relieve tight hip flexors',
    by: 'Dr. Jen Fraboni, PT, DPT · DocJenFit',
    url: 'https://www.youtube.com/watch?v=IQLx_M3xqFg',
    isVideo: true,
  },

  // ---- Phase 1
  gluteBridge: {
    title: 'How to do a glute bridge — 4 easy tips',
    by: 'Cori Lefkowith · Redefining Strength',
    url: 'https://www.youtube.com/watch?v=cvKZXsz-QIA',
    isVideo: true,
  },
  slBridge: {
    title: 'How to do a single-leg bridge',
    by: 'Hinge Health · Physical therapists',
    url: 'https://www.youtube.com/watch?v=fUOB9VcyvYo',
    isVideo: true,
  },
  hingeDowel: {
    title: 'How to do a hip hinge with a dowel',
    by: 'Tangelo Health',
    url: 'https://www.youtube.com/watch?v=45DQiwq4oKk',
    isVideo: true,
  },
  hipThrust: {
    title: 'Stop doing your hip thrusts wrong',
    by: 'Dana Linn Bailey',
    url: 'https://www.youtube.com/watch?v=C1wpa1CWauI',
    isVideo: true,
  },
  standingAbduction: {
    title: 'Standing hip abduction — glute med strength',
    by: 'Dr. Carl Baird',
    url: 'https://www.youtube.com/watch?v=CNosLXpX8no',
    isVideo: true,
  },

  // ---- Phase 2
  asklingProtocol: {
    title: 'The Askling protocol, demonstrated',
    by: 'Physiotutors',
    url: 'https://www.youtube.com/watch?v=D6bGLfCk4QU',
    isVideo: true,
  },
  asklingDiver: {
    title: 'L-Protocol Diver',
    by: 'SPARC Physiotherapy',
    url: 'https://www.youtube.com/watch?v=BUTNpmatmjI',
    isVideo: true,
  },
  asklingGlider: {
    title: 'The Askling L-Protocol for hamstring strains',
    by: 'Chris Johnson, PT',
    url: 'https://www.youtube.com/watch?v=ONCSNxmQTzE',
    isVideo: true,
  },
  rdl: {
    title: 'How to Romanian deadlift properly (avoid back pain)',
    by: 'Sharelle Grant',
    url: 'https://www.youtube.com/watch?v=fKWeeTI8jlQ',
    isVideo: true,
  },
  slRdl: {
    title: 'The best single-leg RDL tutorial',
    by: 'Squat University',
    url: 'https://www.youtube.com/watch?v=Zfr6wizR8rs',
    isVideo: true,
  },

  // ---- Phase 3
  nordic: {
    title: 'How to set up, perform & program Nordic hamstring curls',
    by: 'E3 Rehab · DPTs',
    url: 'https://www.youtube.com/watch?v=_e9vFU9-tkc',
    isVideo: true,
  },
  heavyRdl: {
    title: 'How to do Romanian deadlifts with perfect technique',
    by: 'Jeff Nippard',
    url: 'https://www.youtube.com/watch?v=_oyxCn2iSjU',
    isVideo: true,
  },
  returnToRunning: {
    title: 'How to return to running after a hamstring strain',
    by: 'Dr. Jeff Lewis, PT, DPT',
    url: 'https://www.youtube.com/watch?v=89zcGuNjHJU',
    isVideo: true,
  },
  pogos: {
    title: 'Double-leg pogo hops — ankle & plyometric drill',
    by: 'Therapeutic EDGE',
    url: 'https://www.youtube.com/watch?v=Odp7J26_47s',
    isVideo: true,
  },

  // ---- Phase 4
  accels: {
    title: '4 proven acceleration drills',
    by: 'Outperform',
    url: 'https://www.youtube.com/watch?v=BpWhprv5PLw',
    isVideo: true,
  },
  maxV: {
    title: 'Flying sprints explained — unlocking top speed',
    by: 'Matt Tometz · Speed coach',
    url: 'https://www.youtube.com/watch?v=kFLwmd0yzOU',
    isVideo: true,
  },
  cutting: {
    title: 'How to introduce & progress cutting',
    by: '[P]rehab · DPTs',
    url: 'https://www.youtube.com/watch?v=iMdKR3Q3QuA',
    isVideo: true,
  },

  // ---- Foundation (permanent track, every phase)
  wall9090: {
    title: 'Wall 90/90 with posterior pelvic tilt',
    by: 'The Movement Clinic',
    url: 'https://www.youtube.com/watch?v=v6W8wngQvdg',
    isVideo: true,
  },
  hipSwitch: {
    title: '90/90 hip switch',
    by: 'The Active Life',
    url: 'https://www.youtube.com/watch?v=m51AZSXMvEA',
    isVideo: true,
  },
  seatedIR: {
    title: 'Seated active hip internal rotation',
    by: 'E3 Rehab · DPTs',
    url: 'https://www.youtube.com/watch?v=bMIERPNApdc',
    isVideo: true,
  },
  wallSlides: {
    title: 'Wall slides for serratus activation',
    by: '[P]rehab · DPTs',
    url: 'https://www.youtube.com/watch?v=oMSVe7PWJ3o',
    isVideo: true,
  },
  lowerTrapY: {
    title: 'The lower trapezius Y — posture & strength',
    by: 'Wellen',
    url: 'https://www.youtube.com/watch?v=T8k5JQsIeIY',
    isVideo: true,
  },
  tSpineExtension: {
    title: 'Thoracic extensions over a foam roller',
    by: 'Dr. Cara Giusti, PT, DPT',
    url: 'https://www.youtube.com/watch?v=PVNJ7nMv0Y0',
    isVideo: true,
  },
  suitcaseCarry: {
    title: 'The suitcase carry',
    by: 'Strong by Lee',
    url: 'https://www.youtube.com/watch?v=4i7tNufOHs8',
    isVideo: true,
  },
  stepUp: {
    title: 'Step-ups for glute strength',
    by: 'Upright Health',
    url: 'https://www.youtube.com/watch?v=mFmH75G7m7k',
    isVideo: true,
  },
  aSkip: {
    title: 'The A-skip, and why running tall matters',
    by: 'Matthew Alty',
    url: 'https://www.youtube.com/watch?v=qwcDGGB392g',
    isVideo: true,
  },
  harrisShoulders: {
    title: 'Stop doing banded pull-aparts for posture — do this instead',
    by: 'Conor Harris · Biomechanics',
    url: 'https://www.youtube.com/watch?v=46-QoAk-jo4',
    isVideo: true,
  },
  harrisHipIR: {
    title: 'The truth about hip internal rotation',
    by: 'Conor Harris · Biomechanics',
    url: 'https://www.youtube.com/watch?v=31FPKiJVO7k',
    isVideo: true,
  },
  harrisGait: {
    title: 'The simplest way to improve your gait mechanics',
    by: 'Conor Harris · Biomechanics',
    url: 'https://www.youtube.com/watch?v=cnNZ8YSaq74',
    isVideo: true,
  },

  // ---- reading, for the lessons
  asklingRef: {
    title: 'The Askling L-Protocol, explained',
    by: 'Physiopedia',
    url: 'https://www.physio-pedia.com/Askling_Protocol',
    isVideo: false,
  },
  e3Hamstring: {
    title: 'Hamstring strain rehab, evidence-based',
    by: 'E3 Rehab · DPTs',
    url: 'https://e3rehab.com/hamstring-strain-rehab/',
    isVideo: false,
  },
  malek: {
    title: 'Dr. Leada Malek, PT, DPT, SCS — author of Science of Stretch',
    by: 'Board-certified sports physio',
    url: 'https://www.drmalekpt.com/about',
    isVideo: false,
  },
  esquer: {
    title: 'Dr. Jen Esquer, PT, DPT — mobility & strength',
    by: 'The Optimal Body',
    url: 'https://www.docjenfit.com/theoptimalbody/',
    isVideo: false,
  },
  duvall: {
    title: 'Dr. Sarah Duvall, DPT — pelvis, core & posture',
    by: 'Core Exercise Solutions',
    url: 'https://www.coreexercisesolutions.com/about-sarah/',
    isVideo: false,
  },
  kaylaLee: {
    title: 'Female lower-body biomechanics',
    by: 'Kayla Lee · Physio',
    url: 'https://kaylaleephysio.com/',
    isVideo: false,
  },
  harrisHub: {
    title: 'Anterior pelvic tilt — the mechanism',
    by: 'Conor Harris · Biomechanics',
    url: 'https://www.conorharris.com/store',
    isVideo: false,
  },
} satisfies Record<string, VideoRef>;

// ---------------------------------------------------------------- rehab phases

export const PHASES: Phase[] = [
  {
    id: 0,
    name: 'Calm',
    headline: 'Let it settle. Keep training everything else.',
    goal:
      'Protect the healing tissue, keep blood moving, and start the foundation work that has nothing to do with your hamstring.',
    gate: [
      'You can walk with no limp, pain-free',
      'Heel press at ~50% effort stays under 3/10 pain',
      'No morning-after flare from yesterday’s work',
    ],
    avoid: [
      'Stretching the hamstring — not even gently',
      '“Testing” it to see how bad it is',
      'Lunges, RDLs, deadlifts, running, sprinting',
    ],
    blocks: [
      {
        title: 'Hamstring — gentle isometrics',
        note: 'Pain stays under 5/10 during, and must not be worse the next morning. That rule governs this whole program.',
        movements: [
          {
            id: 'iso-heel-press',
            name: 'Isometric heel press',
            dose: '5 × 15s hold, ~30% effort',
            cue: 'Lie on your back, injured knee bent ~20°. Press your heel down into the floor gently. No pain — back off if there is.',
            why: 'Isometrics load the muscle without lengthening it. This is the safest first signal that it’s allowed to work again.',
            video: V.isoHeelPress,
          },
        ],
      },
      {
        title: 'Walk',
        movements: [
          {
            id: 'walk',
            name: 'Easy walking',
            dose: 'As much as is comfortable',
            cue: 'The limp is your ceiling. If you’re limping, go slower and shorter — don’t push through it.',
            why: 'Movement brings blood to healing tissue. Limping teaches a compensation you’ll have to undo later.',
          },
        ],
      },
      {
        title: 'Glutes — no hamstring load',
        movements: [
          {
            id: 'clamshell',
            name: 'Side-lying clamshell',
            dose: '2 × 15 per side',
            cue: 'Hips stacked, don’t let your top hip roll back. Slow.',
            why: 'Glute medius — the one that keeps your knee from caving and your pelvis level when you walk.',
            video: V.gluteMedius,
          },
          {
            id: 'banded-abduction',
            name: 'Banded abduction',
            dose: '2 × 15',
            cue: 'Band above the knees, push out against it without leaning.',
            why: 'The same glute medius, but standing — the version that carries over into walking. It is also the muscle that makes the side of the hip look full rather than dented in.',
            video: V.awakenGlutes,
          },
        ],
      },
      {
        title: 'Train — entirely optional',
        note: 'None of this is required, today or any day. Your hamstring heals exactly the same whether you do it or skip it. It is here only because you are not injured everywhere, and if you feel like training, you can.',
        optional: true,
        movements: [
          {
            id: 'upper-body',
            name: 'Upper body, as normal',
            dose: 'Optional · full sessions',
            cue: 'Press, pull, carry. Nothing that loads the hamstring. Skip it freely — this is here for the days you want it.',
            why: 'Training hard somewhere keeps the habit, the appetite and the mood intact while the leg catches up. Rehab fails more often from stopping everything than from doing too much.',
          },
          {
            id: 'good-leg',
            name: 'Uninjured leg — single-leg work',
            dose: 'Optional · 2–3 sets',
            cue: 'Step-ups, leg press, leg extensions on the good side only. Also optional — a bonus, never a box to tick.',
            why: 'Training one limb produces measurable strength carryover to the other. You are literally training the injured leg by training the healthy one.',
          },
        ],
      },
    ],
  },
  {
    id: 1,
    name: 'Reload',
    headline: 'Teach it to take load again — and wake the glutes up.',
    goal: 'Move from isometric to moving load through a pain-free range, and start the glutes taking over hip extension.',
    gate: [
      'Full pain-free range of motion',
      'Single-leg bridge, pain-free, both sides',
      'Walking and stairs feel completely normal',
    ],
    avoid: ['Running', 'Anything at long hamstring length (deep RDLs, high kicks)'],
    blocks: [
      {
        title: 'Hamstring — load it',
        movements: [
          {
            id: 'bridge',
            name: 'Double-leg bridge',
            dose: '3 × 12',
            cue: 'Tuck your pelvis first (ribs down, low back flat), THEN lift. You should feel glutes, not hamstrings or low back.',
            why: 'The tuck is everything. Without it you just arch your back and the hamstrings do the work again.',
            video: V.gluteBridge,
          },
          {
            id: 'sl-bridge',
            name: 'Single-leg bridge',
            dose: '3 × 8 per side',
            cue: 'Same tuck. Keep your hips level — don’t let one side drop.',
            why: 'One side at a time exposes the weaker hip — the one that has been letting your pelvis drop. Evening that out is what levels your walk.',
            video: V.slBridge,
          },
          {
            id: 'hinge-dowel',
            name: 'Hip hinge with a dowel',
            dose: '3 × 10',
            cue: 'Dowel on your back touching head, mid-back and tailbone. Push your hips back, keep all three points touching. Short range at first.',
            why: 'This is the pattern that fixes how you pick things up — and it’s the foundation of every glute exercise worth doing.',
            video: V.hingeDowel,
          },
        ],
      },
      {
        title: 'Glutes',
        movements: [
          {
            id: 'hip-thrust',
            name: 'Hip thrust',
            dose: '3 × 12',
            cue: 'Chin tucked, ribs down, finish with a posterior tilt — not a low-back arch.',
            why: 'The single best glute-building movement there is. Bret Contreras built the research on it.',
            video: V.hipThrust,
          },
          {
            id: 'ab-duction-standing',
            name: 'Standing banded abduction',
            dose: '3 × 15 per side',
            cue: 'Stand tall, no leaning. Slow on the way back.',
            why: 'Standing loads the glute medius the way life actually does. This is the one that stops your knee caving inward when you run.',
            video: V.standingAbduction,
          },
        ],
      },
      { title: 'Foundation', note: 'Keep all of Phase 0’s pelvis, mobility and breathing work.', movements: [] },
    ],
  },
  {
    id: 2,
    name: 'Lengthen',
    headline: 'The phase that decides whether there’s a third one.',
    goal:
      'Load the hamstring at long lengths. This is the Askling L-Protocol — the approach that cut recovery from 51 days to 28 and, when paired with its return test, dropped reinjury to 1–4%.',
    gate: [
      'Askling H-test: fast active straight-leg raise with no grabbing, apprehension or pain',
      'Full range under load, both sides equal',
      'No morning-after soreness from the Glider',
    ],
    avoid: ['Sprinting', 'Returning to soccer'],
    blocks: [
      {
        title: 'The Askling L-Protocol',
        note: 'Every rep stops JUST BEFORE pain. Never into it. This is a lengthening protocol, not a stretching one — the muscle is working the whole time.',
        movements: [
          {
            id: 'extender',
            name: 'The Extender',
            dose: '3 × 12 — twice a day',
            cue: 'On your back, hold the injured thigh at 90° hip flexion. Slowly straighten the knee to just before pain, then bend back.',
            why: 'Teaches the muscle that it is safe to be long again. Almost all of the fear of re-tearing lives at this end of the range, and this is where it gets undone.',
            video: V.asklingProtocol,
          },
          {
            id: 'diver',
            name: 'The Diver',
            dose: '3 × 6',
            cue: 'Stand on the injured leg, hinge forward at the hip with the other leg extending behind you. Slow and controlled.',
            why: 'Long-length loading while you are standing on it — much closer to the position a sprint actually puts you in.',
            video: V.asklingDiver,
          },
          {
            id: 'glider',
            name: 'The Glider',
            dose: '3 × 4 — once every 3 days',
            cue: 'Hold a support. Injured leg slightly bent, glide the other foot backward so the injured hamstring lengthens under load. Pull yourself back with your arms, not the leg.',
            why: 'The hardest one, and the most protective. Only every third day — it needs recovery.',
            video: V.asklingGlider,
          },
        ],
      },
      {
        title: 'Strength',
        movements: [
          {
            id: 'rdl',
            name: 'Romanian deadlift',
            dose: '4 × 8, load progressing',
            cue: 'Hips back, spine long, bar close. Stop where your hamstrings tension — not where your back rounds.',
            why: 'Trains the hamstring strong at long length, which is exactly where it tore.',
            video: V.rdl,
          },
          { id: 'sl-rdl', name: 'Single-leg RDL', dose: '3 × 8 per side', cue: 'Hips square. Slow. Balance is part of the exercise.', why: 'Forces each leg to do its own work, which exposes the side that has been coasting. It is also the best carry-over to sprinting mechanics in the whole program.', video: V.slRdl },
        ],
      },
          {
        title: 'Carry it into how you walk',
        note: 'Floor drills give you the position. These make it survive being upright and loaded, which is the only way it reaches your actual gait.',
        movements: [
          {
            id: 'suitcase-carry',
            name: 'Suitcase carry',
            dose: '3 × 30m, one side at a time',
            cue: 'Weight in one hand, walk tall, do not let your ribs shift or your body lean away from it. Breathe out.',
            why: 'Your obliques have to hold the ribcage over the pelvis while you walk. This is the stacked position you have been drilling on the floor, now under load and on your feet.',
            video: V.suitcaseCarry,
          },
          {
            id: 'step-up',
            name: 'Step-up',
            dose: '3 × 8 per side',
            cue: 'Drive through the whole foot, stand all the way tall, and lower slowly. Knee tracks over the middle of the foot, hips stay level.',
            why: 'A step-up is one half of a stride. It is the most direct rehearsal of walking well there is — and it builds the glute in the exact range that makes it sit fuller.',
            video: V.stepUp,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Strength & Power',
    headline: 'Build it stronger than it was before.',
    goal: 'Heavy posterior chain, Nordic curl progressions, and the first running.',
    gate: [
      'Nordic curl controlled to at least 45° both sides',
      'Jog 20 minutes pain-free',
      'Injured side within 10% of the other on strength tests',
    ],
    blocks: [
      {
        title: 'The big one',
        movements: [
          {
            id: 'nordic',
            name: 'Nordic hamstring curl (progressions)',
            dose: '3 × 5, lowering slowly',
            cue: 'Start with a band or partner assist, or a short range. Control the lowering — that’s the whole exercise.',
            why: 'The most evidence-backed hamstring injury-prevention exercise that exists. This is the insurance policy.',
            video: V.nordic,
          },
          { id: 'heavy-rdl', name: 'Heavy RDL', dose: '4 × 6', cue: 'Progressive load. Form never degrades.', why: 'Load is what makes tissue tougher. This is where the hamstring stops being the weak link — and where the back of the leg fills out.', video: V.heavyRdl },
        ],
      },
      {
        title: 'Return to running',
        movements: [
          { id: 'jog', name: 'Jog → strides', dose: 'Build gradually', cue: 'Easy jog first. Then strides at ~70%, walking back between.', why: 'Running is just a long series of one-legged landings. Reintroducing it gradually is how you find out whether the strength work transferred.', video: V.returnToRunning },
          { id: 'plyos', name: 'Pogos & low-level plyos', dose: '3 × 20s', cue: 'Stiff ankles, quiet landings.', why: 'Trains the tendon to store and return energy. Quiet landings mean your ankle and hip are absorbing the force instead of your knee.', video: V.pogos },
        ],
      },
          {
        title: 'Carry it into how you walk',
        note: 'Floor drills give you the position. These make it survive being upright and loaded, which is the only way it reaches your actual gait.',
        movements: [
          {
            id: 'suitcase-carry',
            name: 'Suitcase carry',
            dose: '3 × 30m, one side at a time',
            cue: 'Weight in one hand, walk tall, do not let your ribs shift or your body lean away from it. Breathe out.',
            why: 'Your obliques have to hold the ribcage over the pelvis while you walk. This is the stacked position you have been drilling on the floor, now under load and on your feet.',
            video: V.suitcaseCarry,
          },
          {
            id: 'step-up',
            name: 'Step-up',
            dose: '3 × 8 per side',
            cue: 'Drive through the whole foot, stand all the way tall, and lower slowly. Knee tracks over the middle of the foot, hips stay level.',
            why: 'A step-up is one half of a stride. It is the most direct rehearsal of walking well there is — and it builds the glute in the exact range that makes it sit fuller.',
            video: V.stepUp,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Sprint',
    headline: 'The destination — and the thing that makes it permanent.',
    goal:
      'Rebuild top-end speed deliberately. Sprint exposure is what makes a hamstring durable; avoiding it forever is what causes the next strain.',
    gate: ['Sprinting at full effort with no apprehension', 'Back to soccer'],
    blocks: [
      {
        title: 'Speed',
        movements: [
          { id: 'accels', name: 'Acceleration runs', dose: '6 × 20m, full recovery', cue: 'Build to full effort over weeks, not days.', why: 'Acceleration is the safest way back to speed — high force, short range. The hamstring’s danger zone is top speed, so we build the engine before opening it up.', video: V.accels },
          { id: 'max-v', name: 'Max velocity exposure', dose: '4 × 30m flys', cue: 'Full recovery between reps. Quality only — stop when speed drops.', why: 'This is the exposure the hamstring actually needs. A muscle that has never been to top speed cannot be trusted at top speed.', video: V.maxV },
          { id: 'cod', name: 'Change of direction', dose: 'Progressive', cue: 'Cuts and decelerations before returning to a match.', why: 'Soccer is not run in a straight line. Decelerating and cutting is the last thing to rebuild, and it is what the game will ask for in the first minute.', video: V.cutting },
        ],
      },
      {
        title: 'Run tall',
        movements: [
          {
            id: 'a-skip',
            name: 'A-skips & wall drills',
            dose: '3 × 20m before every sprint session',
            cue: 'Tall through the hips, ribs down, knee up and foot striking underneath you rather than out in front.',
            why: 'This is posture training disguised as a warm-up. You cannot sprint well with a tipped pelvis and quiet glutes, which is why sprinting ends up teaching your body the position faster than any floor drill.',
            video: V.aSkip,
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- foundation

/**
 * The posture rebuild. This is NOT a phase — it runs underneath all five of
 * them, every day, and it does not end when the hamstring is better.
 *
 * Ordering is deliberate and mechanical: ribcage and pelvis position first,
 * then hip rotation, then the shoulders. Shoulders sit last because rounded
 * shoulders are mostly a consequence of where the ribcage is parked. Pulling
 * the shoulders back without moving the ribs underneath them just trades one
 * held position for another, and it never sticks.
 */
export const FOUNDATION: Block[] = [
  {
    title: 'Stack the ribs over the pelvis',
    note: 'This is the anterior pelvic tilt work, and it is the reason the lower belly sticks out. Position, not body fat.',
    movements: [
      {
        id: '90-90-breathing',
        name: '90/90 breathing',
        dose: '5 × 5 breaths',
        cue: 'On your back, feet on a wall or chair, knees at 90°. Exhale fully through your mouth, let your ribs drop, feel your low back flatten toward the floor.',
        why: 'The exhale is what brings your pelvis out of tilt. Nothing else in the program moves it as directly, and it is more effective for anterior tilt than any stretch.',
        video: V.breathing9090,
      },
      {
        id: 'wall-9090-tilt',
        name: 'Wall 90/90 with a ball squeeze',
        dose: '3 × 5 breaths',
        cue: 'Same position, with a ball or cushion between your knees. Squeeze it gently, exhale, and let your tailbone curl up off the floor an inch. Hold there and keep breathing.',
        why: 'Your inner thighs are the muscles that tuck the pelvis under. Squeezing recruits them, so the tilt gets corrected by muscle rather than held by effort — which is what makes the lower belly flatten without losing a pound.',
        video: V.wall9090,
      },
      {
        id: 'dead-bug',
        name: 'Dead bug',
        dose: '3 × 8 per side',
        cue: 'Low back stays flat on the floor the entire time. If it arches, shorten the range.',
        why: 'Teaches your deep core to hold the pelvis still while your limbs move — the exact thing missing in anterior tilt, and the reason the correction survives outside the session.',
        video: V.deadBug,
      },
    ],
  },
  {
    title: 'Open the hips and ankles',
    note: 'You sit and stand with your legs turned out and your glutes gripping. That is not a strength problem — it is a range problem, and it is why the glutes never get to work through any range.',
    movements: [
      {
        id: 'hip-switch',
        name: '90/90 hip switch',
        dose: '2 × 8 slow switches',
        cue: 'Sit with both knees at 90°, one in front, one out to the side. Rotate both knees across to the other side without using your hands. Go slow — this is not a stretch to sink into.',
        why: 'Restores the internal rotation you have been missing. A hip that can rotate in is a hip whose glute can actually lengthen and contract, instead of one that only knows how to clench.',
        video: V.hipSwitch,
      },
      {
        id: 'seated-hip-ir',
        name: 'Seated hip internal rotation',
        dose: '2 × 10 per side',
        cue: 'Sitting, knees at 90°, lift one foot out to the side without letting the knee move. Actively, not passively.',
        why: 'The active version is what makes the range yours. Passive stretching gives it back for an hour; owning the range is what changes how you stand.',
        video: V.seatedIR,
      },
      {
        id: 'half-kneeling-hip-flexor',
        name: 'Half-kneeling hip flexor',
        dose: '2 × 45s per side',
        cue: 'Squeeze the glute of the down leg FIRST, then shift forward an inch. Ribs down. You should feel it in the front of the hip, not the low back.',
        why: 'Short hip flexors pull the front of the pelvis down, which is half of the tilt. The glute squeeze is what makes this a correction rather than a stretch you undo an hour later.',
        video: V.hipFlexors,
      },
      {
        id: 'knee-to-wall',
        name: 'Knee-to-wall ankle',
        dose: '3 × 10 per side',
        cue: 'Foot a few inches from the wall, drive your knee forward over your toes without the heel lifting.',
        why: 'Ankle range is the hidden driver of your knee pain, and it is what lets you sit back into a hinge instead of falling forward into your quads.',
        video: V.kneeToWall,
      },
    ],
  },
  {
    title: 'Unround the upper back',
    note: 'Do the ribcage work above first. Shoulders follow the ribcage they are attached to — that order is not optional.',
    movements: [
      {
        id: 'open-book',
        name: 'Open book rotation',
        dose: '2 × 8 per side',
        cue: 'Side-lying, knees stacked, rotate your top arm open and follow it with your eyes. Let your ribs move.',
        why: 'Thoracic rotation is the first thing an office job takes. Getting it back is what lets your shoulders sit back without you holding them there.',
        video: V.thoracic,
      },
      {
        id: 't-spine-extension',
        name: 'Thoracic extension over a roller',
        dose: '3 × 5, moving up the spine',
        cue: 'Roller across the mid-back, hands supporting your head. Exhale as you extend back over it. Do not let the movement happen at your low back — ribs stay down.',
        why: 'Opens the segments that have been stuck flexed all day. The exhale cue matters: extend without flaring, or you just move the tilt upstairs.',
        video: V.tSpineExtension,
      },
      {
        id: 'wall-slides',
        name: 'Wall slides',
        dose: '3 × 8',
        cue: 'Forearms on the wall, slide up while pushing into it. Reach at the top — let your shoulder blades travel around your ribcage rather than pinching together.',
        why: 'Trains serratus, which holds the shoulder blade onto the ribcage. Rounded shoulders are usually this muscle failing, not the ones in the back being weak.',
        video: V.wallSlides,
      },
      {
        id: 'lower-trap-y',
        name: 'Lower trap Y',
        dose: '3 × 10',
        cue: 'Face down or leaning on an incline, arms in a Y. Lift with the thumbs up, initiating from below your shoulder blades. Light or no weight.',
        why: 'The lower trapezius is what holds the upper back tall over hours, not seconds. This is the strength half — mobility alone is why posture never lasts.',
        video: V.lowerTrapY,
      },
    ],
  },
];

/** Foundation lookup by movement id. */
export const FOUNDATION_MOVEMENTS: Record<string, Movement> = Object.fromEntries(
  FOUNDATION.flatMap((b) => b.movements.map((m) => [m.id, m])),
);

/** Every movement in the program, phase work and foundation alike, by id. */
export const MOVEMENT_BY_ID: Record<string, Movement> = Object.fromEntries([
  ...PHASES.flatMap((p) => p.blocks.flatMap((b) => b.movements.map((m) => [m.id, m] as const))),
  ...FOUNDATION.flatMap((b) => b.movements.map((m) => [m.id, m] as const)),
]);

// ---------------------------------------------------------------- days

/**
 * The ramp inside each phase. Volume climbs only after the previous day was
 * completed and the next morning came back clean.
 */
export const DAYS: Record<number, Day[]> = {
  0: [
    {
      n: 1,
      name: 'Settle',
      intro:
        'Three things, about ten minutes. That is the entire day — and it is deliberately almost nothing, because the tissue is two days old and the most useful thing you can do is not irritate it. Doing more today does not make it heal faster.',
      required: ['iso-heel-press', 'walk'],
      foundation: ['90-90-breathing'],
    },
    {
      n: 2,
      name: 'Open the ankles',
      intro:
        'Yesterday held up, so we add two things that are nowhere near the hamstring — ankles and upper back. Both are on the list of things that caused this in the first place.',
      required: ['iso-heel-press', 'walk'],
      foundation: ['90-90-breathing', 'knee-to-wall', 'open-book'],
    },
    {
      n: 3,
      name: 'Wake the core',
      intro:
        'Adding the dead bug. This is the one that teaches your pelvis to stay put, which is the actual root of the tight-hamstring problem.',
      required: ['iso-heel-press', 'walk'],
      foundation: ['90-90-breathing', 'knee-to-wall', 'open-book', 'dead-bug'],
    },
    {
      n: 4,
      name: 'Wake the glutes',
      intro:
        'Glutes join today. Nothing here loads the hamstring — it is all sideways work, which is exactly the part that has been missing.',
      required: ['iso-heel-press', 'walk', 'clamshell', 'banded-abduction'],
      foundation: ['90-90-breathing', 'knee-to-wall', 'open-book', 'dead-bug', 'hip-switch'],
    },
    {
      n: 5,
      name: 'Full foundation',
      intro:
        'This is the complete Phase 0 day, and it is the one you repeat from here. Not forever — only until the three checkpoints on the Progress tab are all true. Then Phase 1 opens.',
      required: ['iso-heel-press', 'walk', 'clamshell', 'banded-abduction'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'dead-bug', 'hip-switch', 'knee-to-wall', 'open-book', 'half-kneeling-hip-flexor'],
    },
  ],
  1: [
    {
      n: 1,
      name: 'First load',
      intro:
        'The hamstring is allowed to move under load now. Start with the two that teach the pattern — bridge and hinge — and nothing else.',
      required: ['bridge', 'hinge-dowel'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'dead-bug', 'hip-switch', 'knee-to-wall', 'open-book', 'half-kneeling-hip-flexor'],
    },
    {
      n: 2,
      name: 'One side at a time',
      intro: 'Single-leg work joins, which is where the difference between your two sides shows up.',
      required: ['bridge', 'hinge-dowel', 'sl-bridge', 'ab-duction-standing'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'dead-bug', 'hip-switch', 'knee-to-wall', 'open-book', 'half-kneeling-hip-flexor', 'wall-slides'],
    },
    {
      n: 3,
      name: 'Full reload',
      intro: 'The hip thrust comes in and this becomes the repeating Phase 1 day.',
      required: ['bridge', 'hinge-dowel', 'sl-bridge', 'ab-duction-standing', 'hip-thrust'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'dead-bug', 'hip-switch', 'knee-to-wall', 'open-book', 'half-kneeling-hip-flexor', 'wall-slides', 'seated-hip-ir'],
    },
  ],
  2: [
    {
      n: 1,
      name: 'Extender only',
      intro:
        'The Askling protocol starts with one exercise, twice a day. That is not a soft opening — it is how the protocol is written, and the restraint is the reason it works.',
      required: ['extender'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'hip-switch', 'seated-hip-ir', 'open-book', 'wall-slides'],
    },
    {
      n: 2,
      name: 'Add the Diver',
      intro: 'Standing long-length work joins. Still stopping just before pain, every rep.',
      required: ['extender', 'diver'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'hip-switch', 'seated-hip-ir', 'open-book', 'wall-slides', 't-spine-extension'],
    },
    { n: 3, name: 'Add load', intro: 'Romanian deadlifts begin, light. Form before weight.', required: ['extender', 'diver', 'rdl', 'suitcase-carry'], foundation: ['90-90-breathing', 'wall-9090-tilt', 'hip-switch', 'seated-hip-ir', 'open-book', 'wall-slides', 't-spine-extension', 'half-kneeling-hip-flexor'] },
    {
      n: 4,
      name: 'Full protocol',
      intro:
        'All three Askling exercises plus your strength work. The Glider stays every third day — it needs the recovery. This is the repeating Phase 2 day.',
      required: ['extender', 'diver', 'glider', 'rdl', 'sl-rdl', 'suitcase-carry', 'step-up'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'dead-bug', 'hip-switch', 'seated-hip-ir', 'open-book', 'wall-slides', 't-spine-extension', 'half-kneeling-hip-flexor'],
    },
  ],
  3: [
    { n: 1, name: 'Feet back under you', intro: 'Easy running and low-level hops. Nothing heavy yet.', required: ['jog', 'plyos'], foundation: ['90-90-breathing', 'wall-9090-tilt', 'hip-switch', 'seated-hip-ir', 'wall-slides', 't-spine-extension'] },
    { n: 2, name: 'Add the heavy work', intro: 'Loaded hinging joins the running.', required: ['jog', 'plyos', 'heavy-rdl', 'step-up'], foundation: ['90-90-breathing', 'wall-9090-tilt', 'hip-switch', 'seated-hip-ir', 'wall-slides', 't-spine-extension', 'lower-trap-y'] },
    {
      n: 3,
      name: 'Full strength day',
      intro: 'Nordics come in — the insurance policy. This is the repeating Phase 3 day.',
      required: ['jog', 'plyos', 'heavy-rdl', 'nordic', 'suitcase-carry', 'step-up'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'dead-bug', 'hip-switch', 'seated-hip-ir', 'open-book', 'wall-slides', 't-spine-extension', 'lower-trap-y'],
    },
  ],
  4: [
    { n: 1, name: 'Acceleration only', intro: 'Short, hard, full recovery. Build the engine before opening it up.', required: ['accels', 'a-skip'], foundation: ['90-90-breathing', 'hip-switch', 'seated-hip-ir', 'wall-slides', 't-spine-extension', 'lower-trap-y'] },
    { n: 2, name: 'Top speed', intro: 'Flying runs join. This is the exposure the hamstring has been waiting for.', required: ['accels', 'max-v', 'a-skip'], foundation: ['90-90-breathing', 'wall-9090-tilt', 'hip-switch', 'seated-hip-ir', 'wall-slides', 't-spine-extension', 'lower-trap-y'] },
    {
      n: 3,
      name: 'Full speed day',
      intro: 'Cutting and decelerating come in. Clear this repeatedly and you are back to playing.',
      required: ['accels', 'max-v', 'cod', 'a-skip'],
      foundation: ['90-90-breathing', 'wall-9090-tilt', 'dead-bug', 'hip-switch', 'seated-hip-ir', 'open-book', 'wall-slides', 't-spine-extension', 'lower-trap-y'],
    },
  ],
};

/** The prescribed day, clamping past the end onto the repeating steady-state day. */
export function dayFor(phase: number, n: number): Day {
  const days = DAYS[phase] ?? DAYS[0];
  return days[Math.min(Math.max(n, 1), days.length) - 1];
}

export function dayCount(phase: number): number {
  return (DAYS[phase] ?? DAYS[0]).length;
}

// ---------------------------------------------------------------- lessons

export const LESSONS: Lesson[] = [
  {
    id: 'tight-hamstrings',
    title: 'Why your hamstrings feel tight — and why stretching isn’t fixing it',
    whatsHappening:
      'Your pelvis is tipped forward. Your hamstrings attach to the back of it, so when it tips they get pulled long and held there all day. They’re not short — they’re already overstretched, and bracing against it.',
    whatItFixes:
      'That’s why stretching buys twenty minutes of relief and then it’s back, and it’s part of why the same hamstring has now gone twice. The fix is upstream: get the pelvis back underneath you, and teach your glutes to take over the hip extension your hamstrings have been covering for.',
    whatChanges:
      'When the pelvis stacks, the lower belly flattens out and your glutes sit underneath you instead of behind you — which is most of what people are actually chasing when they train glutes.',
    video: V.harrisHamstrings,
  },
  {
    id: 'why-not-stretch',
    title: 'Why we’re not stretching it',
    whatsHappening:
      'A strained muscle is healing tissue, and pulling on a repair slows it down. In your case the muscle was already living at long length before it tore — stretching adds to the exact problem that caused it.',
    whatItFixes:
      'Loading it instead — gently at first, then at longer and longer lengths — is what makes it resilient. That’s the entire logic of this program, and it comes from the protocol with the lowest reinjury rate on record.',
    whatChanges:
      'A hamstring that’s strong through full range holds a fuller, tighter line down the back of the leg than one that’s permanently hanging on.',
    video: V.malek,
  },
  {
    id: 'second-time',
    title: 'Why it happened twice',
    whatsHappening:
      'Reinjury after a hamstring strain is common — roughly a third of people do it again — and the single biggest driver is coming back before the muscle is genuinely ready. Resting until it stops hurting is not the same as being ready.',
    whatItFixes:
      'Nothing here advances on a calendar. You move forward when you pass a test. Protocols that gate progress on an objective test report reinjury rates of about 1–4% instead of 30%.',
    whatChanges:
      'It also means you get to sprint again — and keep sprinting — instead of managing a hamstring for the rest of your life.',
    video: V.e3Hamstring,
  },
  {
    id: 'glutes-outvoted',
    title: 'Your glutes aren’t lazy. They’re outvoted.',
    whatsHappening:
      'Hip extension can be done by your glutes or your hamstrings. With a forward-tipped pelvis, your hamstrings are already in position to take the job — so they take it, every time, and your glutes never get the rep.',
    whatItFixes:
      'Every hinge, bridge and thrust in this program is built to make the glute take the work instead. That’s what permanently takes load off the hamstring.',
    whatChanges:
      'It’s also the only thing that actually builds them. Glutes grow from doing hip extension under load — not from being squeezed.',
    video: V.kaylaLee,
  },
  {
    id: 'the-pooch',
    title: 'The lower belly isn’t all fat',
    whatsHappening:
      'A forward-tipped pelvis increases the arch in your low back, which pushes the lower abdomen forward. That’s position, not body fat. The butt sticking out is partly lumbar extension too — not glute mass.',
    whatItFixes:
      'Breathing, ribcage stacking and anterior core control bring the pelvis back under you. If bloating is also in play that’s a separate thing worth looking into — but the postural half is real and it’s yours to change.',
    whatChanges:
      'The lower belly visually flattens without losing a single pound. Most people are surprised how much of it was posture.',
    video: V.duvall,
  },
  {
    id: 'model-walk',
    title: 'Model posture, and how you actually get it',
    whatsHappening:
      'Model posture is a stack — ribs over pelvis, pelvis level, head on top. A good walk is driven from behind you: the back leg extends, the glute pushes, and the foot lands under your hip rather than reaching out front.',
    whatItFixes:
      'A tipped pelvis cannot extend behind you, so the stride gets taken in front — heel reaching, a small brake every step, quads doing all of it. The cue is to push the ground away behind you.',
    whatChanges:
      'What people call elegant is mostly hip extension and a stacked ribcage — long through the front, shoulders open, glutes working on every step.',
    video: V.harrisGait,
  },
  {
    id: 'rounded-shoulders',
    title: 'Your shoulders round because of where your ribcage is',
    whatsHappening:
      'When the pelvis tips forward, the ribcage flares up and back to balance it. Your shoulder blades sit on that ribcage — so once it tilts, the shoulders roll forward with it. They are following, not failing.',
    whatItFixes:
      'That is why pulling your shoulders back never holds for more than a minute, and why stretching your chest buys an afternoon at best. We move the ribs first with the breathing work, then teach the shoulder blade to hold onto them — serratus with wall slides, lower traps with the Y. Position first, then the strength to keep it.',
    whatChanges:
      'An open chest and a long neck read as confidence before anyone consciously works out why, and it changes how you photograph without changing anything else.',
    video: V.harrisShoulders,
  },
  {
    id: 'hips-turned-out',
    title: 'Your legs are turned out, and it is keeping your glutes flat',
    whatsHappening:
      'A forward-tipped pelvis parks your femurs in external rotation — legs turned out, glutes gripping constantly to hold you there. What is missing is the other direction. You have plenty of turn-out and almost no turn-in.',
    whatItFixes:
      'A glute can only do real work through range. Clenched is not the same as strong, and a hip that cannot rotate inward never lets the glute lengthen — which means it never properly contracts either. Hip switches and seated internal rotation give that range back, and then the bridges and thrusts finally have somewhere to work.',
    whatChanges:
      'This is the real difference between a gripped, flat-looking backside and a full, rounded one. It is a position problem long before it is a training-volume problem, which is why more sets never fixed it.',
    video: V.harrisHipIR,
  },
  {
    id: 'ankles-knees',
    title: 'Your ankles decide what your knees do',
    whatsHappening:
      'If your ankle can’t bend forward over your foot, that range has to come from somewhere else — usually the knee caving inward, or the quad taking over the whole movement.',
    whatItFixes:
      'Ankle range unlocks squat depth, quiets the front of the knee, and lets you actually sit back into a hinge.',
    whatChanges:
      'And sitting back into a hinge is where glutes get built — so the ankles are quietly upstream of the whole thing.',
    video: V.esquer,
  },
  {
    id: 'sprinting',
    title: 'Sprinting is the goal, not the risk',
    whatsHappening:
      'Hamstrings tear at high speed, in the instant before the foot lands. Avoiding sprinting forever doesn’t protect you — it just keeps the muscle permanently unprepared for the one thing that tests it.',
    whatItFixes:
      'We rebuild speed deliberately at the end, once the strength gates are passed. That exposure is what makes it durable for good.',
    whatChanges:
      'It’s also the best-looking training stimulus there is. There’s a reason sprinters look the way they do.',
  },
];

// ---------------------------------------------------------------- the why

export const GOALS = [
  {
    title: 'Move like an athlete again',
    body: 'Sprint, cut, play — with no part of you bracing for it. That’s the endpoint, and everything here is built backwards from it.',
  },
  {
    title: 'Healthy, beautiful posture',
    body: 'Pelvis stacked under ribs, shoulders open, walking tall. This is the piece almost nobody trains, and it changes how you look more than another set of anything.',
  },
  {
    title: 'Glutes that actually do their job',
    body: 'Which — not coincidentally — is also how they grow. Strong and built are the same project here, not two.',
  },
  {
    title: 'Strong, not bulky. Lean, not depleted.',
    body: 'Enough strength to be hard to hurt. Steps and consistency for leanness and confidence.',
  },
  {
    title: 'Never hurt the hamstring again',
    body: 'Twice is a pattern. The third one is optional, and this is how you opt out.',
  },
];

/** Shown on the check-in when something needs a real person, not an app. */
export const RED_FLAGS = [
  'Still can’t walk normally about a week in',
  'Pain suddenly spikes or a sharp new pain appears',
  'A large bruise spreads down the back of the thigh',
  'Numbness or pins and needles down the leg',
  'Pain sits right up at the sit bone rather than mid-thigh',
];
