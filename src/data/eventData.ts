// Official Speaker & Leadership Portrait Assets (optimized WebP)
import imgAbdelRazak from '../assets/speakers/opt/abdel_razak_yakubu.webp';
import imgColRobert from '../assets/speakers/opt/col_robert_narh.webp';
import imgDrApril from '../assets/speakers/opt/dr_april_dobson.webp';
import imgFidelNyarko from '../assets/speakers/opt/fidel_kojo_fih_nyarko.webp';
import imgDorcasWumbee from '../assets/speakers/opt/dorcas_adisah_wumbee.webp';
import imgGeorgeNutor from '../assets/speakers/opt/george_nutor.webp';
import imgProphetKofi from '../assets/speakers/opt/prophet_kofi_boakye_fosuhene.webp';
import imgBernardSackitey from '../assets/speakers/opt/bernard_sackitey.webp';
import imgBenjaminDarko from '../assets/speakers/opt/rev_dr_benjamin_darko_asamoah.webp';
import imgSueMusu from '../assets/speakers/opt/sue_musu_kiawu.webp';

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  category: 'moderator' | 'host' | 'president' | 'speaker';
  categoryLabel: string;
  roleLabel: string;
  initials: string;
  imageUrl: string;
  bioNote?: string;
}

export interface Pillar {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
}

export const EVENT_DETAILS = {
  name: 'SHIFT 1.0',
  theme: 'Beyond the Degree',
  tagline: 'Building Your Career, Purpose & Legacy',
  coreMessage: 'BEYOND THE DEGREE. BUILD YOUR PURPOSE. LEAVE A LEGACY.',
  dateDisplay: 'Saturday, 28 November 2026',
  timeDisplay: '9:00 AM – 2:00 PM',
  isoDate: '2026-11-28T09:00:00Z',
  venue: 'Old Auditorium, University of Energy and Natural Resources (UENR)',
  city: 'Sunyani, Ghana',
  organizers: 'Worldwide Evangelism Service (WES), in collaboration with UENR SCC',
  registrationUrl: 'https://forms.gle/2twNhHwTT5Aq4GQA6',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=University+of+Energy+and+Natural+Resources+Sunyani+Ghana',
};

export const PILLARS: Pillar[] = [
  {
    id: 'education',
    number: '01',
    title: 'EDUCATION',
    tagline: 'A degree is the beginning of your journey, not the limit of your potential.',
    description: 'A degree is the beginning of your journey, not the limit of your potential.',
    iconName: 'GraduationCap',
  },
  {
    id: 'career',
    number: '02',
    title: 'CAREER',
    tagline: 'Learn to navigate and build a meaningful professional path with intention.',
    description: 'Learn to navigate and build a meaningful professional path with intention.',
    iconName: 'Briefcase',
  },
  {
    id: 'purpose',
    number: '03',
    title: 'PURPOSE',
    tagline: 'Discover that your future extends beyond simply securing a job.',
    description: 'Discover that your future extends beyond simply securing a job.',
    iconName: 'Compass',
  },
  {
    id: 'mentorship',
    number: '04',
    title: 'MENTORSHIP',
    tagline: 'Gain direction from professionals who have already walked the path.',
    description: 'Gain direction from professionals who have already walked the path.',
    iconName: 'Users',
  },
  {
    id: 'growth',
    number: '05',
    title: 'GROWTH',
    tagline: 'Develop the mindsets, skills, character and discipline needed to move forward.',
    description: 'Develop the mindsets, skills, character and discipline needed to move forward.',
    iconName: 'TrendingUp',
  },
  {
    id: 'impact',
    number: '06',
    title: 'IMPACT',
    tagline: 'Use your gifts and career to serve others and create lasting change.',
    description: 'Use your gifts and career to serve others and create lasting change.',
    iconName: 'Sparkles',
  },
  {
    id: 'faith',
    number: '07',
    title: 'FAITH',
    tagline: "Understand your ambitions and future through the lens of God's Word and His purpose.",
    description: "Understand your ambitions and future through the lens of God's Word and His purpose.",
    iconName: 'Anchor',
  },
  {
    id: 'legacy',
    number: '08',
    title: 'LEGACY',
    tagline: 'Focus on what you will leave behind, not just what you will achieve.',
    description: 'Focus on what you will leave behind, not just what you will achieve.',
    iconName: 'Crown',
  },
];

export const MENTORSHIP_PRINCIPLES = [
  {
    title: 'HERE IS WHAT I KNOW.',
    subtitle: 'The Proven Foundation',
    description: 'Tested principles, industry standards, and uncompromised professional ethics discovered across decades of real leadership.',
    index: '01',
  },
  {
    title: 'HERE IS WHAT I WISH I KNEW.',
    subtitle: 'The Costly Blindspots',
    description: 'Honest conversations about the pitfalls, unwritten corporate codes, emotional hurdles, and missteps that no textbook prepares you for.',
    index: '02',
  },
  {
    title: 'HERE IS HOW YOU CAN GET THERE FASTER.',
    subtitle: 'The Accelerated Route',
    description: 'Actionable mentorship frameworks and strategic relationship-building to accelerate your journey without cutting moral corners.',
    index: '03',
  },
];

// Single shared person record for Rev. Dr. Benjamin Darko Asamoah
// referenced by both Moderator and Host presentations
export const SHARED_BENJAMIN_DARKO = {
  id: 'rev-dr-benjamin-darko-asamoah',
  name: 'Rev. Dr. Benjamin Darko Asamoah',
  initials: 'BA',
  imageUrl: imgBenjaminDarko,
};

// Unified Moderator & Host Profile (Merged from duplicate entries)
export const MODERATOR_HOST_PROFILE: Speaker = {
  id: 'rev-dr-benjamin-darko-asamoah',
  name: SHARED_BENJAMIN_DARKO.name,
  role: 'University Chaplain & Senior Lecturer · Summit Moderator',
  organization: 'University of Energy and Natural Resources (UENR)',
  category: 'host',
  categoryLabel: 'Host & Moderator',
  roleLabel: 'HOST & MODERATOR',
  initials: SHARED_BENJAMIN_DARKO.initials,
  imageUrl: SHARED_BENJAMIN_DARKO.imageUrl,
  bioNote: 'Serving as University Chaplain & Senior Lecturer at UENR, and Summit Moderator for SHIFT 1.0, welcoming delegates and leading the interactive dialogue, plenary discourse and audience Q&A.',
};

// Aliases for backwards compatibility
export const MODERATOR_PROFILE: Speaker = MODERATOR_HOST_PROFILE;
export const HOST_PROFILE: Speaker = MODERATOR_HOST_PROFILE;

// 2. WES President Spotlight
export const WES_PRESIDENT_PROFILE: Speaker = {
  id: 'wes-president-sackitey',
  name: 'Bernard Sackitey',
  role: 'WES President & HSE Superintendent',
  organization: 'Eni Ghana Exploration and Production Limited',
  category: 'president',
  categoryLabel: 'WES President',
  roleLabel: 'WES PRESIDENT',
  initials: 'BS',
  imageUrl: imgBernardSackitey,
  bioNote: 'Leading the Worldwide Evangelism Service (WES) initiative in empowering youth beyond academic credentials.',
};

// 4. The Official Eight Keynote Speakers
export const MAIN_SPEAKERS: Speaker[] = [
  {
    id: 'prophet-kofi-boakye-fosuhene',
    name: 'Prophet Kofi Boakye Fosuhene',
    role: 'WES General Overseer & Head Pastor',
    organization: 'Family of Gold City Church',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 01',
    initials: 'KF',
    imageUrl: imgProphetKofi,
  },
  {
    id: 'sue-musu-kiawu',
    name: 'Sue Musu Kiawu',
    role: 'General Manager',
    organization: 'Bremenenergie Services Limited',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 02',
    initials: 'SK',
    imageUrl: imgSueMusu,
  },
  {
    id: 'george-nutor',
    name: 'George Nutor',
    role: 'General Manager, Wassa Mine',
    organization: 'Golden Star Resources',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 03',
    initials: 'GN',
    imageUrl: imgGeorgeNutor,
  },
  {
    id: 'fidel-kojo-fih-nyarko',
    name: 'Fidel Kojo Fih Nyarko',
    role: 'Electrical & Instrumentation Engineer',
    organization: 'Yinson Production',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 04',
    initials: 'FN',
    imageUrl: imgFidelNyarko,
  },
  {
    id: 'dr-april-dobson',
    name: 'Dr. April Dobson',
    role: 'CEO & Human Capital Director',
    organization: 'Purposed Today Global LLC / US Air Force Veteran',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 05',
    initials: 'AD',
    imageUrl: imgDrApril,
  },
  {
    id: 'dorcas-adisah-wumbee',
    name: 'Dorcas Adisah Wumbee',
    role: 'Lawyer & Human Resource Officer',
    organization: 'Eni Ghana Exploration & Production Limited',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 06',
    initials: 'DW',
    imageUrl: imgDorcasWumbee,
  },
  {
    id: 'abdel-razak-yakubu',
    name: 'Abdel-Razak Yakubu',
    role: 'Executive Secretary',
    organization: 'Gold Fields Ghana Foundation',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 07',
    initials: 'AY',
    imageUrl: imgAbdelRazak,
  },
  {
    id: 'col-robert-narh',
    name: 'Col. Robert Narh',
    role: 'Commander',
    organization: 'Ghana Army Training School',
    category: 'speaker',
    categoryLabel: 'Speaker',
    roleLabel: 'SPEAKER 08',
    initials: 'RN',
    imageUrl: imgColRobert,
  },
];

// Combined list with all unique speakers and leadership profiles
export const SPEAKERS: Speaker[] = [
  ...MAIN_SPEAKERS,
  MODERATOR_HOST_PROFILE,
  WES_PRESIDENT_PROFILE,
];

export const SCHEDULE_FLOW = [
  {
    time: '09:00 AM',
    title: 'Doors Open & Delegate Check-In',
    description: 'Welcome reception, seating, and introductory briefing at the UENR Old Auditorium.',
  },
  {
    time: '09:30 AM',
    title: 'Opening & Setting the Shift Context',
    description: 'Official opening remarks from the WES President and UENR leadership on looking beyond academic qualifications.',
  },
  {
    time: '10:00 AM',
    title: 'Industry Realities & Corporate Navigation',
    description: 'Executive speakers discuss real workplace dynamics, character, technical mastery, and professional trajectory.',
  },
  {
    time: '11:15 AM',
    title: 'The Mentorship Bridge',
    description: 'Interactive leadership panel and candid discussions: what leaders know, what they wish they knew, and accelerating your growth.',
  },
  {
    time: '12:30 PM',
    title: 'Word of God & Spiritual Purpose',
    description: 'The spiritual climax: aligning human ambition and gifts with divine calling and Kingdom legacy.',
  },
  {
    time: '01:45 PM',
    title: 'Benediction & Networking',
    description: 'Closing prayers, personal interactions with mentors, and next-step resources.',
  },
];
