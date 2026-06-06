export const TASKS = [
  { id:'t1', type:'Delivery',  status:'In Transit', contractor:'ATCO',             address:'5302 Forand St SW, Calgary',  workers:['Marcus Reid'],                  items:2, due:'Jun 7',  notes:'Deliver to north gate. Ask for Greg.' },
  { id:'t2', type:'Pick Up',   status:'Assigned',   contractor:'Primany',           address:'880 24th Ave SE, Calgary',    workers:['Kayla Thompson'],               items:3, due:'Jun 6',  notes:'' },
  { id:'t3', type:'Set Up',    status:'Pending',    contractor:'Dunwald & Fleming', address:'2840 2 Ave SE, Calgary',      workers:['Marcus Reid','Priya Nair'],      items:3, due:'Jun 10', notes:'Highway 2 — full lane closure.' },
  { id:'t4', type:'Tear Down', status:'Completed',  contractor:'ATCO',             address:'5302 Forand St SW, Calgary',  workers:['Kayla Thompson'],               items:1, due:'Jun 6',  notes:'All items returned to warehouse.' },
];

export const INVENTORY = [
  { id:'i1',  name:'Arrow Board',            cat:'Signage',         total:12,  avail:9,   out:3  },
  { id:'i2',  name:'Traffic Cone',           cat:'Traffic Control', total:200, avail:147, out:53 },
  { id:'i3',  name:'Barricade Light',        cat:'Lighting',        total:60,  avail:44,  out:16 },
  { id:'i4',  name:'Type III Barricade',     cat:'Barricades',      total:40,  avail:28,  out:12 },
  { id:'i5',  name:'Road Closed Sign',       cat:'Signage',         total:20,  avail:20,  out:0  },
  { id:'i6',  name:'Channelizer Drum',       cat:'Traffic Control', total:80,  avail:55,  out:25 },
  { id:'i7',  name:'Variable Speed Sign',    cat:'Signage',         total:8,   avail:5,   out:3  },
  { id:'i8',  name:'LED Stop/Slow Paddle',   cat:'Traffic Control', total:30,  avail:22,  out:8  },
  { id:'i9',  name:'Reflective Safety Vest', cat:'PPE',             total:100, avail:78,  out:22 },
  { id:'i10', name:'Water-Filled Barrier',   cat:'Barricades',      total:25,  avail:18,  out:7  },
];

export const WORKERS = [
  { id:'w1', name:'Marcus Reid',    title:'Field Technician',    avail:true  },
  { id:'w2', name:'Kayla Thompson', title:'Equipment Specialist', avail:true  },
  { id:'w3', name:'Devon Clarke',   title:'Field Technician',    avail:false },
  { id:'w4', name:'Priya Nair',     title:'Senior Technician',   avail:true  },
  { id:'w5', name:'Ryan Okafor',    title:'Equipment Specialist', avail:false },
];

export const CONTRACTORS = [
  { id:'c1', name:'ATCO',             address:'5302 Forand St SW, Calgary AB T3E 8B4', contact:'Greg Linden',  phone:'+1 (403) 292-7500' },
  { id:'c2', name:'Primany',          address:'880 24th Ave SE, Calgary AB T2G 1P1',   contact:'Sandra Wu',    phone:'+1 (403) 555-0199' },
  { id:'c3', name:'Dunwald & Fleming',address:'2840 2 Ave SE, Calgary AB T2A 7X9',    contact:'Tom Fleming',  phone:'+1 (403) 555-0177' },
];

export const TIMESHEET = [
  { id:'ts1', day:'Monday',    date:'Jun 1', in:'07:02', out:'17:15', h:10.22, ot:2.22, tasks:1 },
  { id:'ts2', day:'Tuesday',   date:'Jun 2', in:'06:58', out:'15:30', h:8.53,  ot:0.53, tasks:0 },
  { id:'ts3', day:'Wednesday', date:'Jun 3', in:'07:00', out:'16:00', h:9.00,  ot:1.00, tasks:1 },
  { id:'ts4', day:'Thursday',  date:'Jun 4', in:'07:05', out:'15:45', h:8.67,  ot:0.67, tasks:0 },
  { id:'ts5', day:'Friday',    date:'Jun 5', in:'06:55', out:'17:00', h:10.08, ot:2.08, tasks:1 },
];

export const STATUS_STYLE: Record<string,{bg:string;text:string;dot:string}> = {
  'Pending':    { bg:'#F1F5F9', text:'#64748B', dot:'#94A3B8' },
  'Assigned':   { bg:'#EFF6FF', text:'#1D4ED8', dot:'#3B82F6' },
  'Accepted':   { bg:'#EFF6FF', text:'#1D4ED8', dot:'#1D4ED8' },
  'In Transit': { bg:'#FFFBEB', text:'#D97706', dot:'#F59E0B' },
  'Completed':  { bg:'#F0FDF4', text:'#16A34A', dot:'#22C55E' },
  'Cancelled':  { bg:'#FEF2F2', text:'#DC2626', dot:'#EF4444' },
};

export const TYPE_COLOR: Record<string,string> = {
  'Delivery': '#1D4ED8', 'Pick Up': '#D97706',
  'Set Up': '#16A34A',  'Tear Down': '#DC2626',
};

export function initials(name: string) {
  return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
}
