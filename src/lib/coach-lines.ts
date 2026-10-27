// Coach dialogue: what today's coach Pokémon says in its game-style text box.
//
// How it works:
//   1. Every type (fire, water, ...) has its own "voice". For each type and
//      each event (clock in, milestones, ...) there are 3 short line
//      templates in `coachLines`.
//   2. pickCoachLine() chooses one template. It uses the Pokémon's FIRST
//      type, and a `seed` number instead of Math.random, so the same inputs
//      always give the same line (no flicker between renders), but a new
//      seed (e.g. a new day) gives a different line.
//   3. fillCoachLine() swaps the placeholders for real values:
//        {pokemon}  the coach's name, upper-cased like the old games
//        {trainer}  the user's trainer name
//        {hours}    hours worked, e.g. "1" or "2.5"
//
// No database or network is needed: these are plain strings in code.

/** The 17 types the original 151 Pokémon have today (PokéAPI's lowercase names). */
export const COACH_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "fairy",
  "steel",
] as const;

/** A Pokémon type the coach has lines for. */
export type CoachType = (typeof COACH_TYPES)[number];

/** The moments when the coach speaks. */
export const COACH_EVENTS = [
  "greeting", // first visit of the day, not clocked in
  "clockIn",
  "milestone1h", // first hour worked today
  "milestone4h",
  "milestone8h",
  "longStretch", // 2+ hours without a break: kindly suggest one
  "clockOut",
  "levelUp", // the trainer reached a new level
  "idle", // clocked out, coming back later the same day
] as const;

/** One of the moments listed in COACH_EVENTS. */
export type CoachEvent = (typeof COACH_EVENTS)[number];

/** The type used when a Pokémon's type is missing or not in COACH_TYPES. */
export const FALLBACK_TYPE: CoachType = "normal";

/**
 * All the line templates: coachLines[type][event] is a list of 3 lines.
 * Rules for writing lines: short (fits a text box), kind, never pushes the
 * user to work longer or skip a break.
 */
export const coachLines: Record<CoachType, Record<CoachEvent, readonly string[]>> = {
  normal: {
    greeting: [
      "{pokemon} waves hello! Ready when you are, {trainer}.",
      "{pokemon} pops out to say hi! It's your coach today.",
      "{pokemon} is your coach today. Let's take it one step at a time!",
    ],
    clockIn: [
      "{trainer}, I choose you! One step at a time, and {pokemon} is right here with you!",
      "{trainer}, I choose you! {pokemon} used Helping Hand. Let's have a good day!",
      "{trainer}, I choose you! Nice and steady wins the day. You've got this!",
    ],
    milestone1h: [
      "One hour down! {pokemon} is proud of you.",
      "{pokemon} noticed your first hour. Nice and steady!",
      "First hour done! {pokemon} does a little hop.",
    ],
    milestone4h: [
      "{hours} hours today! {pokemon} thinks you're doing great.",
      "{pokemon} counts {hours} hours on its paws. Wow!",
      "{hours} hours in! {pokemon} reminds you to grab some water.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says that's a full day. Rest is good too!",
      "{pokemon} is amazed: {hours} hours! Time to think about winding down?",
      "What a day, {trainer}! {pokemon} suggests a cozy break soon.",
    ],
    longStretch: [
      "{pokemon} tugs your sleeve. How about a short break?",
      "You've been at it a while! {pokemon} suggests a stretch.",
      "{pokemon} yawns and stretches. Want to join it for a minute?",
    ],
    clockOut: [
      "That's enough, {trainer}. Come back and rest. You put in {hours}h today.",
      "That's enough, {trainer}. {pokemon} logged {hours}h for you. Great work!",
      "That's enough, {trainer}. Time for a cozy break. See you next time!",
    ],
    levelUp: [
      "{trainer} reached a new trainer level! {pokemon} cheers loudly!",
      "Level up! {pokemon} always knew you could do it.",
      "{pokemon} does a happy dance. {trainer} leveled up!",
    ],
    idle: [
      "Welcome back, {trainer}! {pokemon} saved you a seat.",
      "{pokemon} perks up. Ready for another round whenever you are.",
      "{pokemon} missed you! Clock in again whenever it feels right.",
    ],
  },

  fire: {
    greeting: [
      "{pokemon} is fired up to coach you today, {trainer}!",
      "{pokemon}'s flame flickers hello. Ready to warm up?",
      "Today's coach: {pokemon}! It's burning with excitement.",
    ],
    clockIn: [
      "{trainer}, I choose you! {pokemon} used Ember. Let's light up today's work!",
      "{trainer}, I choose you! Feel that warmth? Your focus is all fired up!",
      "{trainer}, I choose you! {pokemon} stokes the flames. Let's turn up the heat!",
    ],
    milestone1h: [
      "One hour! {pokemon}'s flame grows a little brighter.",
      "{pokemon} is all smoke and sparks. First hour done!",
      "First hour in the books! {pokemon} cheers in a burst of heat.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you're on fire today!",
      "{pokemon} blazes with pride: {hours} hours strong!",
      "{hours} hours in! Even a flame needs fuel. {pokemon} suggests a snack.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time to let the fire rest.",
      "A blazing {hours} hours! {pokemon} says embers need cool-down time too.",
      "{pokemon} is so proud! Banking the fire for tonight sounds nice.",
    ],
    longStretch: [
      "{pokemon} says even the hottest flame needs air. Take a breather?",
      "{pokemon} sits by the campfire. Join it for a short break?",
      "Long stretch! {pokemon} suggests cooling down for a few minutes.",
    ],
    clockOut: [
      "That's enough, {trainer}. Let the embers glow soft. You put in {hours}h today.",
      "That's enough, {trainer}. {hours}h of warm, steady work. Time to cool down!",
      "That's enough, {trainer}. Even the brightest flame rests. Great job today!",
    ],
    levelUp: [
      "Level up! {pokemon} sets off a victory fireworks show!",
      "{trainer} reached a new level! {pokemon} is burning with pride!",
      "{pokemon} spins a Flame Wheel of joy! A new trainer level!",
    ],
    idle: [
      "{pokemon} kept the embers warm for you. Welcome back!",
      "Welcome back, {trainer}! {pokemon} is ready to rekindle.",
      "{pokemon}'s flame flickers happily. Back for another round?",
    ],
  },

  water: {
    greeting: [
      "{pokemon} drifts by with a calm splash. Hello, {trainer}!",
      "Today's coach is {pokemon}. Let's go with the flow.",
      "{pokemon} blows a friendly bubble. Ready when you are.",
    ],
    clockIn: [
      "{trainer}, I choose you! Find your current and flow through today's work!",
      "{trainer}, I choose you! {pokemon} used Aqua Ring. Calm focus, one wave at a time.",
      "{trainer}, I choose you! Dive in! {pokemon} will keep the waters calm.",
    ],
    milestone1h: [
      "One hour flowed by! {pokemon} splashes softly.",
      "{pokemon} says your first hour went swimmingly.",
      "First hour done! {pokemon} bubbles with quiet pride.",
    ],
    milestone4h: [
      "{hours} hours, smooth as a tide! {pokemon} is impressed.",
      "{pokemon} reminds you: {hours} hours in, time for a sip of water!",
      "{hours} hours! {pokemon} says you're riding a steady wave.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says even the tide goes out. Rest soon?",
      "{pokemon} floats in awe: {hours} hours! Calm waters await you.",
      "What a current, {trainer}! {pokemon} suggests drifting toward rest.",
    ],
    longStretch: [
      "{pokemon} says still waters refresh. How about a short break?",
      "Long swim! {pokemon} suggests surfacing for some air.",
      "{pokemon} floats on its back. Join it for a quick stretch?",
    ],
    clockOut: [
      "That's enough, {trainer}. Return and rest; {hours}h flowed by nicely today.",
      "That's enough, {trainer}. The tide goes out for now. Lovely work today!",
      "That's enough, {trainer}. {pokemon} splashes goodbye. {hours}h logged!",
    ],
    levelUp: [
      "Level up! {pokemon} makes a fountain of celebration!",
      "{trainer} reached a new level! {pokemon} splashes happily!",
      "A wave of progress! {pokemon} cheers your new trainer level.",
    ],
    idle: [
      "Welcome back! {pokemon} kept the water warm.",
      "{pokemon} bobs to the surface. Ready to dive back in?",
      "{pokemon} missed you, {trainer}! The current's here when you are.",
    ],
  },

  grass: {
    greeting: [
      "{pokemon} sways in the sunlight. Good to see you, {trainer}!",
      "Today's coach is {pokemon}. Let's grow a little today.",
      "{pokemon} rustles hello. Ready to put down some roots?",
    ],
    clockIn: [
      "{trainer}, I choose you! Soak up the sun and let your work grow!",
      "{trainer}, I choose you! {pokemon} used Growth. Little by little, you'll bloom!",
      "{trainer}, I choose you! Plant a few good seeds today. {pokemon} believes in you!",
    ],
    milestone1h: [
      "One hour! {pokemon} spots a tiny new sprout.",
      "{pokemon} says your first hour took root nicely.",
      "First hour done! {pokemon}'s leaves rustle in applause.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you're growing strong.",
      "{pokemon} blooms with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} says plants need water, and so do you.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says even trees rest at night.",
      "A full harvest: {hours} hours! {pokemon} suggests some shade.",
      "{pokemon} is in full bloom for you. Time to rest your roots?",
    ],
    longStretch: [
      "{pokemon} stretches toward the sky. Stretch with it?",
      "Long stretch! {pokemon} suggests a breath of fresh air.",
      "{pokemon} found a shady spot. Take a short break with it?",
    ],
    clockOut: [
      "That's enough, {trainer}. Time to rest your roots. You grew {hours}h today.",
      "That's enough, {trainer}. Every garden needs rest. Lovely work today!",
      "That's enough, {trainer}. {pokemon} rustles happily. {hours}h well tended!",
    ],
    levelUp: [
      "Level up! {pokemon} bursts into bloom for you!",
      "{trainer} reached a new level! {pokemon} sheds happy petals.",
      "{pokemon} does a Petal Dance of joy! New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept your garden tidy.",
      "{pokemon} perks up its leaves. Ready to grow some more?",
      "{pokemon} soaked up sun while you were away. Hi, {trainer}!",
    ],
  },

  electric: {
    greeting: [
      "{pokemon} crackles hello! Charged up to coach you, {trainer}!",
      "Today's coach is {pokemon}. It's buzzing with energy!",
      "{pokemon} sends a tiny spark your way. Ready to power up?",
    ],
    clockIn: [
      "{trainer}, I choose you! Let's spark some focus and charge through today's work!",
      "{trainer}, I choose you! {pokemon} used Charge. You're powered up and ready!",
      "{trainer}, I choose you! Zap! {pokemon} feels the energy. Let's go!",
    ],
    milestone1h: [
      "One hour! {pokemon}'s battery bar ticks up.",
      "{pokemon} zaps a tiny celebration. First hour done!",
      "First hour charged! {pokemon} hums happily.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you're electric today!",
      "{pokemon} buzzes with pride: {hours} hours of power!",
      "{hours} hours in! {pokemon} says recharge with a snack.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time to recharge.",
      "A powerful {hours} hours! {pokemon} suggests powering down soon.",
      "{pokemon} is dazzled! Even batteries need a full night's charge.",
    ],
    longStretch: [
      "{pokemon} flickers. Time for a quick recharge break?",
      "Long stretch! {pokemon} suggests unplugging for a few minutes.",
      "{pokemon} says: low battery! How about a short break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Time to recharge. You powered through {hours}h today.",
      "That's enough, {trainer}. Power down and rest. {pokemon} is so proud!",
      "That's enough, {trainer}. {hours}h of bright sparks! Go recharge your batteries.",
    ],
    levelUp: [
      "Level up! {pokemon} lights up the whole room!",
      "{trainer} reached a new level! {pokemon} fires a Thunderbolt of joy!",
      "{pokemon} is overcharged with pride. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept the lights on for you.",
      "{pokemon} sparks awake. Ready to plug back in?",
      "{pokemon} is fully recharged. Hi again, {trainer}!",
    ],
  },

  ice: {
    greeting: [
      "{pokemon} glides in on a snowflake. Hello, {trainer}!",
      "Today's coach is {pokemon}. Cool, calm and ready.",
      "{pokemon} sparkles like frost. Ready to start fresh?",
    ],
    clockIn: [
      "{trainer}, I choose you! Stay cool and clear. Let's glide through today!",
      "{trainer}, I choose you! {pokemon} used Mist. Calm, crisp focus ahead.",
      "{trainer}, I choose you! Fresh as new snow! {pokemon} is ready to coach.",
    ],
    milestone1h: [
      "One hour! {pokemon} adds a snowflake to your pile.",
      "{pokemon} says your first hour was smooth as ice.",
      "First hour done! {pokemon} twirls on the ice.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you're on a cool streak.",
      "{pokemon} shimmers with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} suggests a warm drink.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time to thaw out and rest.",
      "A crystal-clear {hours} hours! {pokemon} suggests a cozy blanket.",
      "{pokemon} is frosty with pride. Time to wind down?",
    ],
    longStretch: [
      "{pokemon} says frozen shoulders need a stretch. Quick break?",
      "Long stretch! {pokemon} suggests stepping out for fresh air.",
      "{pokemon} builds a tiny snow fort. Take a break and visit?",
    ],
    clockOut: [
      "That's enough, {trainer}. Time to thaw out and rest. You did {hours}h today.",
      "That's enough, {trainer}. Cozy up somewhere warm. Cool work today!",
      "That's enough, {trainer}. {pokemon} waves a frosty goodbye. {hours}h logged!",
    ],
    levelUp: [
      "Level up! {pokemon} makes it snow glitter!",
      "{trainer} reached a new level! {pokemon} spins on the ice!",
      "{pokemon} sculpts an ice trophy. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept your seat frosty-fresh.",
      "{pokemon} skates over to greet you. Ready for more?",
      "{pokemon} is happy to see you, {trainer}. No rush!",
    ],
  },

  fighting: {
    greeting: [
      "{pokemon} bows with respect. Ready to train, {trainer}?",
      "Today's coach is {pokemon}! Warm-ups first, champ.",
      "{pokemon} flexes hello. Let's give it a good effort!",
    ],
    clockIn: [
      "{trainer}, I choose you! Warm up, stay loose, and give it your best!",
      "{trainer}, I choose you! {pokemon} used Bulk Up. You're ready for today!",
      "{trainer}, I choose you! Good form beats rushing. Let's train smart!",
    ],
    milestone1h: [
      "One hour! {pokemon} gives you a mighty high five.",
      "{pokemon} nods. First round complete!",
      "First hour done! {pokemon} cheers from your corner.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says your form is excellent.",
      "{pokemon} salutes {hours} hours of solid effort!",
      "{hours} hours in! {pokemon} says champions refuel. Snack time?",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says recovery is part of training.",
      "A champion's {hours} hours! {pokemon} bows. Rest is earned.",
      "{pokemon} says the best fighters know when to rest. Wind down soon?",
    ],
    longStretch: [
      "{pokemon} calls a time-out! Stretch those muscles?",
      "Long round! {pokemon} says even champs take breaks.",
      "{pokemon} starts cool-down stretches. Join in for a minute?",
    ],
    clockOut: [
      "That's enough, {trainer}. Every champion rests. You trained {hours}h today.",
      "That's enough, {trainer}. {pokemon} bows with respect. Strong work today!",
      "That's enough, {trainer}. Cool down and stretch. {hours}h of solid training!",
    ],
    levelUp: [
      "Level up! {pokemon} lifts you up in celebration!",
      "{trainer} reached a new level! {pokemon} strikes a victory pose!",
      "{pokemon} shouts with pride. Your training paid off!",
    ],
    idle: [
      "Welcome back! {pokemon} kept the dojo ready.",
      "{pokemon} bows again. Round two whenever you like.",
      "{pokemon} is glad you're back, {trainer}. No pressure!",
    ],
  },

  poison: {
    greeting: [
      "{pokemon} oozes a friendly hello. Hi, {trainer}!",
      "Today's coach is {pokemon}. Don't worry, it's sweet.",
      "{pokemon} bubbles happily. Ready to brew up some focus?",
    ],
    clockIn: [
      "{trainer}, I choose you! {pokemon} used Toxic... on distractions only!",
      "{trainer}, I choose you! Let's ooze some focus into today's work!",
      "{trainer}, I choose you! {pokemon} bubbles with energy. Time to get going!",
    ],
    milestone1h: [
      "One hour! {pokemon} makes a happy bubble.",
      "{pokemon} says your first hour was potent!",
      "First hour done! {pokemon} wiggles in delight.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says your focus is extra strong.",
      "{pokemon} bubbles with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} prescribes an antidote: a snack!",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time for some self-care.",
      "A potent {hours} hours! {pokemon} suggests resting up.",
      "{pokemon} is so proud of you. Time to brew some tea and relax?",
    ],
    longStretch: [
      "{pokemon} says a break is the best antidote. Rest a bit?",
      "Long stretch! {pokemon} suggests some fresh air.",
      "{pokemon} oozes into a comfy puddle. Join it for a break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Time to rest. You put in {hours}h today.",
      "That's enough, {trainer}. {pokemon} drips with pride. Great work today!",
      "That's enough, {trainer}. {hours}h done! Go relax; you've earned it.",
    ],
    levelUp: [
      "Level up! {pokemon} bubbles over with joy!",
      "{trainer} reached a new level! {pokemon} does a squishy dance!",
      "{pokemon} brews a celebration potion. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept the cauldron warm.",
      "{pokemon} burbles hello. Ready for another batch?",
      "{pokemon} missed you, {trainer}. Come in whenever!",
    ],
  },

  ground: {
    greeting: [
      "{pokemon} pops up from the dirt. Hello, {trainer}!",
      "Today's coach is {pokemon}. Let's build on solid ground.",
      "{pokemon} stomps a friendly hello. Ready to dig in?",
    ],
    clockIn: [
      "{trainer}, I choose you! Dig in and build on solid ground today!",
      "{trainer}, I choose you! {pokemon} used Mud-Slap on distractions. Let's go!",
      "{trainer}, I choose you! Feet firm, one shovel at a time. You've got this!",
    ],
    milestone1h: [
      "One hour! {pokemon} dug the first tunnel.",
      "{pokemon} says your first hour is on solid ground.",
      "First hour done! {pokemon} kicks up a happy dust cloud.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you've laid a strong foundation.",
      "{pokemon} rumbles with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} suggests refueling with a snack.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says the ground rests at night too.",
      "A grounded {hours} hours! {pokemon} suggests settling in to rest.",
      "{pokemon} is impressed. Time to dig into some downtime?",
    ],
    longStretch: [
      "{pokemon} pokes its head up. Time to resurface for a break?",
      "Long stretch! {pokemon} suggests a walk on solid ground.",
      "{pokemon} digs a cozy nap hole. Take a short break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Time to rest your feet. You dug in for {hours}h today.",
      "That's enough, {trainer}. {pokemon} pats the earth. Solid work today!",
      "That's enough, {trainer}. {hours}h of steady digging! Go take it easy.",
    ],
    levelUp: [
      "Level up! {pokemon} makes the ground rumble with joy!",
      "{trainer} reached a new level! {pokemon} digs up a trophy!",
      "{pokemon} stomps a victory beat. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept your tunnel open.",
      "{pokemon} pops back up. Ready to dig in again?",
      "{pokemon} is happy you're back, {trainer}. Take your time!",
    ],
  },

  flying: {
    greeting: [
      "{pokemon} swoops in to say hi. Hello, {trainer}!",
      "Today's coach is {pokemon}. Let's soar today!",
      "{pokemon} flaps a cheerful hello. Ready for takeoff?",
    ],
    clockIn: [
      "{trainer}, I choose you! Spread your wings and catch a good breeze today!",
      "{trainer}, I choose you! {pokemon} used Tailwind. Smooth flying ahead!",
      "{trainer}, I choose you! Up, up and away! {pokemon} is soaring with you.",
    ],
    milestone1h: [
      "One hour! {pokemon} does a loop-the-loop.",
      "{pokemon} says your first hour flew by!",
      "First hour done! {pokemon} chirps with joy.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you're flying high.",
      "{pokemon} circles with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} lands for a snack break. Join it?",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time to return to the nest.",
      "A sky-high {hours} hours! {pokemon} suggests a soft landing.",
      "{pokemon} glides in awe. Time to fold your wings for today?",
    ],
    longStretch: [
      "{pokemon} lands on a branch to rest. Join it for a break?",
      "Long flight! {pokemon} suggests stretching your wings.",
      "{pokemon} says every flyer needs a perch. Quick break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Glide home and rest. You flew {hours}h today.",
      "That's enough, {trainer}. Time to roost. {pokemon} loved flying with you!",
      "That's enough, {trainer}. {hours}h in the sky! Fold your wings and relax.",
    ],
    levelUp: [
      "Level up! {pokemon} does a victory lap in the sky!",
      "{trainer} reached a new level! {pokemon} soars with pride!",
      "{pokemon} sings from the treetops. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept the nest cozy.",
      "{pokemon} swoops down to greet you. Ready to fly again?",
      "{pokemon} is glad to see you, {trainer}. Fly whenever!",
    ],
  },

  psychic: {
    greeting: [
      "{pokemon} sensed you coming. Hello, {trainer}!",
      "Today's coach is {pokemon}. It foresees a good day.",
      "{pokemon} smiles knowingly. Ready to focus your mind?",
    ],
    clockIn: [
      "{trainer}, I choose you! {pokemon} used Calm Mind. Clear focus starts now!",
      "{trainer}, I choose you! {pokemon} foresaw a good day. Let's make it real!",
      "{trainer}, I choose you! Breathe in, focus up. Your mind is ready!",
    ],
    milestone1h: [
      "One hour! {pokemon} predicted this exact moment.",
      "{pokemon} senses a great first hour. Well done!",
      "First hour done! {pokemon} nods. Just as foreseen.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} reads your mind: you're doing great.",
      "{pokemon} glows with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} foresees a snack in your future.",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} foresees a restful evening for you.",
      "A mindful {hours} hours! {pokemon} senses it's time to unwind.",
      "{pokemon} sees it clearly: rest will make tomorrow brighter.",
    ],
    longStretch: [
      "{pokemon} foresees a break in your near future. Take it?",
      "Long stretch! {pokemon} senses your mind wants a rest.",
      "{pokemon} gently levitates a snack over. Break time?",
    ],
    clockOut: [
      "That's enough, {trainer}. Rest your mind. You focused for {hours}h today.",
      "That's enough, {trainer}. {pokemon} senses a well-earned break. Great work!",
      "That's enough, {trainer}. {hours}h of clear thinking! Let your mind wander now.",
    ],
    levelUp: [
      "Level up! {pokemon} saw this coming all along!",
      "{trainer} reached a new level! {pokemon} glows with joy!",
      "{pokemon} foresaw your growth. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} knew you'd return.",
      "{pokemon} senses you're ready for more. Whenever you like!",
      "{pokemon} was meditating. Hello again, {trainer}!",
    ],
  },

  bug: {
    greeting: [
      "{pokemon} buzzes over to say hi. Hello, {trainer}!",
      "Today's coach is {pokemon}. Busy day ahead!",
      "{pokemon} wiggles its antennae. Ready to get busy?",
    ],
    clockIn: [
      "{trainer}, I choose you! Busy as a bee! Let's buzz through today's work.",
      "{trainer}, I choose you! {pokemon} used String Shot on distractions. Go!",
      "{trainer}, I choose you! Small steps add up. {pokemon} is buzzing for you!",
    ],
    milestone1h: [
      "One hour! {pokemon} adds a cell to the hive.",
      "{pokemon} buzzes: first hour done!",
      "First hour done! {pokemon} does a busy little dance.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says your colony would be proud.",
      "{pokemon} hums with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} found you a snack. Nibble break?",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says even busy bugs rest.",
      "A busy {hours} hours! {pokemon} spins you a cozy cocoon.",
      "{pokemon} is impressed. Time to crawl home and rest?",
    ],
    longStretch: [
      "{pokemon} lands on a leaf to rest. Join it for a break?",
      "Long stretch! {pokemon} says stretch all six legs. Er, both!",
      "{pokemon} buzzes gently. How about a short break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Back to the nest and rest. You did {hours}h today.",
      "That's enough, {trainer}. {pokemon} chirps goodbye. Busy, happy work today!",
      "That's enough, {trainer}. {hours}h of buzzing along! Time to cocoon and relax.",
    ],
    levelUp: [
      "Level up! {pokemon} flutters with joy!",
      "{trainer} reached a new level! {pokemon} buzzes in circles!",
      "{pokemon} spins a victory banner. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept the hive humming.",
      "{pokemon} scuttles over. Ready to get busy again?",
      "{pokemon} missed you, {trainer}. Buzz in whenever!",
    ],
  },

  rock: {
    greeting: [
      "{pokemon} rolls in steady. Hello, {trainer}.",
      "Today's coach is {pokemon}. Solid and steady.",
      "{pokemon} gives a firm nod. Ready to build something?",
    ],
    clockIn: [
      "{trainer}, I choose you! Steady and solid, just like {pokemon}. Let's go!",
      "{trainer}, I choose you! {pokemon} used Rock Polish. You're ready to roll!",
      "{trainer}, I choose you! One stone at a time builds something great!",
    ],
    milestone1h: [
      "One hour! {pokemon} sets the first stone.",
      "{pokemon} rumbles: first hour, rock solid.",
      "First hour done! {pokemon} is steady as ever.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says your wall is getting tall.",
      "{pokemon} rumbles with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} says even rocks need rain. Water break?",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says a good foundation needs rest.",
      "A rock-solid {hours} hours! {pokemon} suggests settling down.",
      "{pokemon} is proud. Mountains rest at night too.",
    ],
    longStretch: [
      "{pokemon} says even boulders stop rolling. Break time?",
      "Long stretch! {pokemon} suggests a short walk.",
      "{pokemon} sits like a statue. Rest with it for a bit?",
    ],
    clockOut: [
      "That's enough, {trainer}. Rest easy. You stood strong for {hours}h today.",
      "That's enough, {trainer}. {pokemon} settles in for the night. Rock-solid work!",
      "That's enough, {trainer}. {hours}h, steady as a boulder. Go take a load off.",
    ],
    levelUp: [
      "Level up! {pokemon} rumbles with joy!",
      "{trainer} reached a new level! {pokemon} stacks a victory cairn!",
      "{pokemon} rolls in a happy circle. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} held your spot. Steady as ever.",
      "{pokemon} hasn't moved an inch. Ready when you are.",
      "{pokemon} is glad you're back, {trainer}. No rush.",
    ],
  },

  ghost: {
    greeting: [
      "Boo! {pokemon} giggles. Hello, {trainer}!",
      "Today's coach is {pokemon}. Spooky, but super sweet.",
      "{pokemon} floats through the wall to say hi!",
    ],
    clockIn: [
      "{trainer}, I choose you! Boo! {pokemon} is here to haunt your to-do list.",
      "{trainer}, I choose you! {pokemon} used Curse... on procrastination only!",
      "{trainer}, I choose you! Spooky focus mode on! {pokemon} floats beside you.",
    ],
    milestone1h: [
      "One hour! {pokemon} does a happy phantom twirl.",
      "{pokemon} whispers: first hour done... nice!",
      "First hour done! {pokemon} glows a friendly purple.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} is spooked by how well you're doing.",
      "{pokemon} haunts with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} conjures a snack. Boo-licious!",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time to rest, not haunt.",
      "A spooktacular {hours} hours! {pokemon} suggests a cozy night.",
      "{pokemon} fades softly. Even ghosts need their rest.",
    ],
    longStretch: [
      "{pokemon} floats by. Psst... time for a little break?",
      "Long stretch! {pokemon} says go haunt the kitchen for a snack.",
      "{pokemon} drifts in circles. Float away for a short break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Vanish and rest! You haunted {hours}h of work today.",
      "That's enough, {trainer}. {pokemon} fades away with a friendly wave. Nice work!",
      "That's enough, {trainer}. {hours}h logged! Go rest; {pokemon} will guard the ball.",
    ],
    levelUp: [
      "Level up! {pokemon} spooks the room with joy!",
      "{trainer} reached a new level! {pokemon} does a ghostly cheer!",
      "{pokemon} glows extra bright. New trainer level!",
    ],
    idle: [
      "Boo! Welcome back! {pokemon} was hiding.",
      "{pokemon} reappears. Ready to haunt more tasks?",
      "{pokemon} missed you, {trainer}. Float back in anytime!",
    ],
  },

  dragon: {
    greeting: [
      "{pokemon} lands with a mighty whoosh. Hello, {trainer}!",
      "Today's coach is {pokemon}. Legendary vibes only.",
      "{pokemon} lets out a friendly roar. Ready, {trainer}?",
    ],
    clockIn: [
      "{trainer}, I choose you! {pokemon} used Dragon Dance. You're powered up!",
      "{trainer}, I choose you! Bold and steady, like a dragon. Let's soar!",
      "{trainer}, I choose you! {pokemon} roars with pride. Today is yours!",
    ],
    milestone1h: [
      "One hour! {pokemon} adds a gem to your hoard.",
      "{pokemon} roars softly: first hour done!",
      "First hour done! {pokemon} beams with dragon pride.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says that's legendary effort.",
      "{pokemon} soars with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} says even dragons snack. Treat time?",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time to rest in your lair.",
      "An epic {hours} hours! {pokemon} suggests a long rest.",
      "{pokemon} curls up proudly. Your hoard of hours is full!",
    ],
    longStretch: [
      "{pokemon} folds its wings to rest. Join it for a break?",
      "Long flight! {pokemon} says even dragons land to stretch.",
      "{pokemon} yawns a tiny puff of smoke. Short break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Return to your lair and rest. You did {hours}h today.",
      "That's enough, {trainer}. Even dragons nap on their treasure. Great work!",
      "That's enough, {trainer}. {hours}h of legendary effort! {pokemon} is impressed.",
    ],
    levelUp: [
      "Level up! {pokemon} roars to the sky!",
      "{trainer} reached a new level! {pokemon} is beaming!",
      "{pokemon} adds a golden gem to your hoard. New level!",
    ],
    idle: [
      "Welcome back! {pokemon} guarded your spot.",
      "{pokemon} stirs from its nap. Ready to soar again?",
      "{pokemon} is glad you're back, {trainer}. Whenever you like!",
    ],
  },

  fairy: {
    greeting: [
      "{pokemon} sprinkles sparkles. Hello, {trainer}!",
      "Today's coach is {pokemon}. Magic is in the air!",
      "{pokemon} twirls hello. Ready for a charming day?",
    ],
    clockIn: [
      "{trainer}, I choose you! A sprinkle of fairy dust, and off you go!",
      "{trainer}, I choose you! {pokemon} used Sweet Kiss. You're going to shine!",
      "{trainer}, I choose you! Let's make today a little magical, together!",
    ],
    milestone1h: [
      "One hour! {pokemon} gives you a gold star.",
      "{pokemon} twinkles: first hour done!",
      "First hour done! {pokemon} spins in a sparkly circle.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you're simply magical.",
      "{pokemon} glitters with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} bakes a fairy cake. Snack break?",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time for sweet dreams.",
      "A magical {hours} hours! {pokemon} suggests some cozy rest.",
      "{pokemon} tucks the stars in. Time to wind down too?",
    ],
    longStretch: [
      "{pokemon} flutters over. A little break would be lovely!",
      "Long stretch! {pokemon} suggests a sparkly stretch.",
      "{pokemon} pours you some tea. Short break together?",
    ],
    clockOut: [
      "That's enough, {trainer}. Rest and sparkle. You put in {hours}h today.",
      "That's enough, {trainer}. {pokemon} twirls goodbye. Magical work today!",
      "That's enough, {trainer}. {hours}h of charm and care! Go treat yourself.",
    ],
    levelUp: [
      "Level up! {pokemon} showers you in sparkles!",
      "{trainer} reached a new level! {pokemon} squeals with joy!",
      "{pokemon} casts a happy charm. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} saved you some sparkles.",
      "{pokemon} flutters over. Ready for more magic?",
      "{pokemon} missed you, {trainer}. Come back anytime!",
    ],
  },

  steel: {
    greeting: [
      "{pokemon} clanks hello. Systems ready, {trainer}!",
      "Today's coach is {pokemon}. Strong as steel.",
      "{pokemon} gleams in the light. Ready to forge ahead?",
    ],
    clockIn: [
      "{trainer}, I choose you! {pokemon} used Iron Defense. Let's build something strong!",
      "{trainer}, I choose you! Steady as steel! {pokemon} is ready when you are.",
      "{trainer}, I choose you! Gears turning, focus sharp. Let's get to work!",
    ],
    milestone1h: [
      "One hour! {pokemon} polishes your first gear.",
      "{pokemon} beeps: first hour complete!",
      "First hour done! {pokemon} gleams with pride.",
    ],
    milestone4h: [
      "{hours} hours! {pokemon} says you're made of steel.",
      "{pokemon} shines with pride: {hours} hours today!",
      "{hours} hours in! {pokemon} says machines need fuel. Snack?",
    ],
    milestone8h: [
      "{hours} hours! {pokemon} says it's time to cool the forge.",
      "A sturdy {hours} hours! {pokemon} suggests powering down.",
      "{pokemon} is impressed. Even steel needs maintenance: rest!",
    ],
    longStretch: [
      "{pokemon} says: oil those joints! Quick stretch break?",
      "Long stretch! {pokemon} suggests a cool-down break.",
      "{pokemon} hums softly. Time for a short break?",
    ],
    clockOut: [
      "That's enough, {trainer}. Time to cool the forge. You put in {hours}h today.",
      "That's enough, {trainer}. {pokemon} gives a shiny salute. Sturdy work today!",
      "That's enough, {trainer}. {hours}h, strong as iron! Go rest and recharge.",
    ],
    levelUp: [
      "Level up! {pokemon} rings like a bell with joy!",
      "{trainer} reached a new level! {pokemon} gleams with pride!",
      "{pokemon} forges you a medal. New trainer level!",
    ],
    idle: [
      "Welcome back! {pokemon} kept the forge warm.",
      "{pokemon} whirs back on. Ready for more?",
      "{pokemon} is glad you're back, {trainer}. Whenever you like!",
    ],
  },
};

/** True if `value` is one of the 17 coach types. */
export function isCoachType(value: string): value is CoachType {
  return (COACH_TYPES as readonly string[]).includes(value);
}

/**
 * Which type's voice to use: the Pokémon's FIRST type (e.g. ["grass", "poison"]
 * gives "grass"). Missing or unknown types fall back to "normal".
 */
export function coachTypeFor(types: readonly string[]): CoachType {
  const first = (types[0] ?? "").toLowerCase();
  return isCoachType(first) ? first : FALLBACK_TYPE;
}

/**
 * Pick one raw line template (placeholders still in it).
 *
 * `seed` replaces Math.random: the same seed always gives the same line.
 * Pass something that changes when you want a new line, e.g.
 * dayIndex + eventCount. The line is lines[seed mod 3].
 */
export function pickCoachLine({
  types,
  event,
  seed,
}: {
  types: readonly string[];
  event: CoachEvent;
  seed: number;
}): string {
  const lines = coachLines[coachTypeFor(types)][event];
  // Make any number a safe index: whole, non-negative, and NaN/Infinity -> 0.
  const whole = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 0;
  return lines[whole % lines.length];
}

/**
 * Format hours for a text box: at most 1 decimal, no trailing ".0".
 * 1 -> "1", 2.5 -> "2.5", 2.04 -> "2". Missing or invalid -> "0".
 */
export function formatCoachHours(hours: number | undefined): string {
  if (hours === undefined || !Number.isFinite(hours) || hours < 0) return "0";
  return String(Math.round(hours * 10) / 10);
}

/**
 * Fill a template's placeholders with real values, in one pass:
 *   {pokemon} -> the coach's name in CAPITALS (game style)
 *   {trainer} -> the trainer name
 *   {hours}   -> formatCoachHours(hours)
 * Any other {placeholder} is removed, so raw braces never reach the screen.
 * One pass also means a trainer name like "{hours}" is shown as typed.
 */
export function fillCoachLine(
  template: string,
  { pokemon, trainer, hours }: { pokemon: string; trainer: string; hours?: number },
): string {
  return template.replace(/\{(\w*)\}/g, (_match, key: string) => {
    if (key === "pokemon") return pokemon.toUpperCase();
    if (key === "trainer") return trainer;
    if (key === "hours") return formatCoachHours(hours);
    return ""; // unknown placeholder: drop it
  });
}
