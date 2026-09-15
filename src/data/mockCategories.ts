import { FacilityCategory } from '../types/category';

export const mockCategories: FacilityCategory[] = [
  {
    id: 'cat-classroom',
    name: 'Classroom',
    description: 'Blackboards, podiums, whiteboards, tiered seating, classroom layout',
    iconName: 'GraduationCap',
    defaultPriorityHint: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'cat-cr',
    name: 'Comfort Room',
    description: 'Restroom stalls, flush valves, hygiene fixtures, mirrors, exhaust vents',
    iconName: 'Bath',
    defaultPriorityHint: 'HIGH',
    status: 'ACTIVE'
  },
  {
    id: 'cat-lab',
    name: 'Laboratory',
    description: 'Fume hoods, chemical wash stations, specialized lab benches, gas lines',
    iconName: 'FlaskConical',
    defaultPriorityHint: 'HIGH',
    status: 'ACTIVE'
  },
  {
    id: 'cat-lib',
    name: 'Library',
    description: 'Book stacks, reading cubicles, digital catalog terminals, study carrels',
    iconName: 'BookOpen',
    defaultPriorityHint: 'LOW',
    status: 'ACTIVE'
  },
  {
    id: 'cat-office',
    name: 'Office',
    description: 'Faculty workstations, administrative counters, storage cabinets, filing units',
    iconName: 'Briefcase',
    defaultPriorityHint: 'LOW',
    status: 'ACTIVE'
  },
  {
    id: 'cat-hallway',
    name: 'Hallway',
    description: 'Corridors, handrails, staircases, evacuation pathways, lockers',
    iconName: 'Footprints',
    defaultPriorityHint: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'cat-exterior',
    name: 'Building Exterior',
    description: 'Façade tiles, guttering, roof shingles, exterior ramps, rain awnings',
    iconName: 'Building',
    defaultPriorityHint: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'cat-grounds',
    name: 'School Grounds',
    description: 'Campus pathways, courtyard benches, perimeter gates, covered walks, drainage',
    iconName: 'Trees',
    defaultPriorityHint: 'LOW',
    status: 'ACTIVE'
  },
  {
    id: 'cat-electrical',
    name: 'Electrical',
    description: 'Breaker panels, exposed wires, shorted circuits, power outlets, sparks',
    iconName: 'Zap',
    defaultPriorityHint: 'CRITICAL',
    status: 'ACTIVE'
  },
  {
    id: 'cat-plumbing',
    name: 'Plumbing',
    description: 'Burst pipes, clogged drains, leaking faucets, main water supply valves',
    iconName: 'Droplets',
    defaultPriorityHint: 'HIGH',
    status: 'ACTIVE'
  },
  {
    id: 'cat-internet',
    name: 'Internet',
    description: 'Access points, severed ethernet cables, router racks, poor Wi-Fi coverage',
    iconName: 'Wifi',
    defaultPriorityHint: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'cat-furniture',
    name: 'Furniture',
    description: 'Broken chairs, loose desk legs, fractured tablet arms, splintered benches',
    iconName: 'Armchair',
    defaultPriorityHint: 'LOW',
    status: 'ACTIVE'
  },
  {
    id: 'cat-doors',
    name: 'Doors',
    description: 'Damaged hinges, stuck door locks, broken handles, exit fire doors',
    iconName: 'DoorOpen',
    defaultPriorityHint: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'cat-windows',
    name: 'Windows',
    description: 'Cracked glass panes, stuck window louvers, broken latches, insect screens',
    iconName: 'Maximize2',
    defaultPriorityHint: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'cat-lighting',
    name: 'Lighting',
    description: 'Flickering fluorescent tubes, dead emergency lights, blown LED ballasts',
    iconName: 'Lightbulb',
    defaultPriorityHint: 'LOW',
    status: 'ACTIVE'
  },
  {
    id: 'cat-others',
    name: 'Others',
    description: 'Miscellaneous campus facility damages not categorized above',
    iconName: 'HelpCircle',
    defaultPriorityHint: 'MEDIUM',
    status: 'ACTIVE'
  }
];
