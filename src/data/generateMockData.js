import {
  BED_LABELS,
  CAPACITY_BY_TYPE,
  DEFAULT_MONTHLY_RENT,
  FLOOR_NUMBERS,
  OCCUPANCY_DOUBLE,
  OCCUPANCY_SINGLE,
  TRIPLE_MEMBER_LIMIT_THREE,
  TRIPLE_MEMBER_LIMIT_TWO,
  ROOMS_PER_FLOOR,
  getRoomNumber,
  getRoomType,
} from './buildingConfig';

const FIRST_NAMES = [
  'Ravi', 'Suresh', 'Amit', 'Vikram', 'Rohit', 'Arjun', 'Nikhil', 'Karan',
  'Deepak', 'Manoj', 'Ankit', 'Sanjay', 'Rahul', 'Pradeep', 'Gaurav', 'Ajay',
  'Vivek', 'Naveen', 'Harish', 'Siddharth', 'Aditya', 'Yash', 'Kunal', 'Pavan',
  'Mahesh', 'Dinesh', 'Sunil', 'Ashok', 'Rajesh', 'Vishal', 'Sagar', 'Mohit',
  'Abhishek', 'Varun', 'Tushar', 'Imran', 'Farhan', 'Joseph', 'Daniel', 'Pranav',
  'Harsh', 'Ritesh', 'Lokesh', 'Nitin', 'Sandeep', 'Uday', 'Tejas', 'Akash',
  'Bharat', 'Chetan', 'Dev', 'Eshan', 'Girish', 'Hemant', 'Ishan', 'Jatin',
  'Kartik', 'Lalit', 'Mayur', 'Omkar', 'Parth', 'Qadir', 'Rakesh', 'Saurabh',
  'Tanmay', 'Umesh', 'Vinay', 'Wasim', 'Yuvraj', 'Zaid', 'Anirudh', 'Bhuvan',
  'Chirag', 'Darshan', 'Eknath', 'Faisal', 'Ganesh', 'Hitesh', 'Iqbal', 'Jeevan',
  'Kiran', 'Laxman', 'Madhav', 'Nishant', 'Puneet', 'Ranjit', 'Shyam', 'Tarun',
  'Utkarsh', 'Venu', 'Waseem', 'Yogesh', 'Zaheer', 'Anuj', 'Balaji', 'Chaitanya',
  'Dhruv', 'Eshwar', 'Faizan', 'Gopal', 'Hari', 'Jagdish', 'Kamal', 'Lohith',
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Reddy', 'Patel', 'Singh', 'Nair', 'Iyer', 'Das',
  'Mehta', 'Joshi', 'Verma', 'Gupta', 'Rao', 'Pillai', 'Chopra', 'Malhotra',
  'Bhat', 'Shetty', 'Khan', 'Ahmed', 'Thomas', 'Fernandes', 'Naidu', 'Desai',
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildEmptyFloors() {
  return FLOOR_NUMBERS.map((floorNumber) => {
    const rooms = [];
    for (let seq = 1; seq <= ROOMS_PER_FLOOR; seq += 1) {
      const type = getRoomType(seq);
      const capacity = CAPACITY_BY_TYPE[type];
      const roomNumber = getRoomNumber(floorNumber, seq);
      const beds = BED_LABELS.slice(0, capacity).map((label) => ({
        bedId: `${roomNumber}-${label}`,
        bedLabel: label,
        status: 'VACANT',
        residentId: null,
      }));
      rooms.push({
        roomNumber,
        floorNumber,
        type,
        capacity,
        occupancyMode: type === 'SINGLE_BED' ? OCCUPANCY_SINGLE : OCCUPANCY_DOUBLE,
        tripleMemberLimit:
          type === 'THREE_BED' ? TRIPLE_MEMBER_LIMIT_THREE : null,
        beds,
      });
    }
    return { floorNumber, rooms };
  });
}

/**
 * Creates realistic mock dataset:
 * floors → rooms → beds, residents, payments, transfers.
 * Occupancy is intentionally mixed (full / partial / vacant).
 */
export function generateMockData(options = {}) {
  const {
    month = 8,
    year = 2026,
    seed = 42,
    emptyDataset = false,
  } = options;

  const floors = buildEmptyFloors();

  if (emptyDataset) {
    return {
      floors,
      residents: [],
      pastResidents: [],
      payments: [],
      transfers: [],
      admin: {
        id: 'admin-1',
        name: 'Admin',
        role: 'Administrator',
      },
      meta: { month, year },
    };
  }

  const rand = seededRandom(seed);
  const allRooms = floors.flatMap((f) => f.rooms);
  const residents = [];
  const payments = [];
  const transfers = [];

  let nameIndex = 0;
  let phoneBase = 9876500000;

  // Target roughly ~109 occupied beds (11 vacant of 120) with variety per floor
  const occupancyPlan = {
    // roomNumber → number of beds to fill
  };

  allRooms.forEach((room) => {
    const roll = rand();
    let fill;
    if (roll < 0.55) fill = room.capacity; // full
    else if (roll < 0.85) fill = Math.max(1, room.capacity - 1); // partial
    else fill = 0; // vacant
    occupancyPlan[room.roomNumber] = fill;
  });

  // Ensure some clearly vacant and partial rooms for demos
  occupancyPlan[101] = 0;
  occupancyPlan[212] = 0;
  occupancyPlan[312] = 0;
  occupancyPlan[202] = 1;
  occupancyPlan[305] = 1;
  occupancyPlan[408] = 1;
  occupancyPlan[512] = 2; // triple room with 2 of 3 beds
  // 2-bed rooms given as single sharing (whole room, one person)
  occupancyPlan[104] = 1;
  occupancyPlan[406] = 1;
  occupancyPlan[510] = 1;

  const singleSharingRooms = new Set([104, 406, 510]);

  const tripleTwoMemberDemoRooms = new Set([512]);

  allRooms.forEach((room) => {
    const fill = occupancyPlan[room.roomNumber] ?? 0;
    if (room.type === 'THREE_BED' && tripleTwoMemberDemoRooms.has(room.roomNumber) && fill === 2) {
      room.tripleMemberLimit = TRIPLE_MEMBER_LIMIT_TWO;
      const bedC = room.beds.find((b) => b.bedLabel === 'C');
      if (bedC) {
        bedC.status = 'BLOCKED';
        bedC.residentId = null;
      }
    }
    for (let i = 0; i < fill; i += 1) {
      const bed = room.beds[i];
      const first = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
      const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
      nameIndex += 1;
      const id = `res-${String(nameIndex).padStart(3, '0')}`;
      const phone = String(phoneBase + nameIndex);
      const joiningOffset = Math.floor(rand() * 400);
      const joiningDate = new Date(2025, 0, 15 + joiningOffset)
        .toISOString()
        .slice(0, 10);
      const asSingleSharing = room.type === 'TWO_BED' && singleSharingRooms.has(room.roomNumber);
      const sharingType =
        room.type === 'SINGLE_BED' || asSingleSharing
          ? 'SINGLE'
          : room.type === 'TWO_BED'
            ? 'DOUBLE'
            : null;
      const monthlyRent =
        asSingleSharing ? DEFAULT_MONTHLY_RENT.TWO_BED_AS_SINGLE : DEFAULT_MONTHLY_RENT[room.type];

      const resident = {
        id,
        name: `${first} ${last}`,
        phone,
        joiningDate,
        roomNumber: room.roomNumber,
        bedId: bed.bedId,
        monthlyRent,
        deposit: monthlyRent,
        depositRefundable: rand() > 0.08,
        sharingType,
        notes: '',
      };
      resident.refundAmount = resident.depositRefundable ? monthlyRent : 0;
      residents.push(resident);
      bed.status = 'OCCUPIED';
      bed.residentId = id;

      if (asSingleSharing) {
        room.occupancyMode = OCCUPANCY_SINGLE;
        room.beds.forEach((other) => {
          other.status = 'OCCUPIED';
          other.residentId = id;
        });
      }

      const isPending = rand() < 0.16;
      const methodRoll = rand();
      const paymentMethod = isPending
        ? null
        : methodRoll < 0.4
          ? 'CASH'
          : methodRoll < 0.75
            ? 'UPI'
            : 'CARD';
      payments.push({
        id: `pay-${id}-${year}-${month}`,
        residentId: id,
        month,
        year,
        amount: monthlyRent,
        status: isPending ? 'PENDING' : 'PAID',
        paymentMethod,
        paidDate: isPending
          ? null
          : `${year}-${String(month).padStart(2, '0')}-${String(1 + Math.floor(rand() * 18)).padStart(2, '0')}`,
        receivedBy: isPending ? null : 'Admin',
      });
    }
  });

  // A few prior-month paid records for history browsing
  residents.slice(0, 20).forEach((r, idx) => {
    payments.push({
      id: `pay-${r.id}-2026-07`,
      residentId: r.id,
      month: 7,
      year: 2026,
      amount: r.monthlyRent,
      status: 'PAID',
      paymentMethod: idx % 3 === 0 ? 'CASH' : idx % 3 === 1 ? 'UPI' : 'CARD',
      paidDate: '2026-07-05',
      receivedBy: 'Admin',
    });
  });

  // Sample transfers (at least 5 for "last 5" UI)
  const sample = residents.filter((r) => r.roomNumber !== 201).slice(0, 7);
  sample.forEach((r, idx) => {
    transfers.push({
      id: `tr-${idx + 1}`,
      residentId: r.id,
      fromRoomNumber: r.roomNumber === 201 ? 105 : 201 + (idx % 5),
      fromBedId: r.roomNumber === 201 ? '105-A' : `${201 + (idx % 5)}-A`,
      toRoomNumber: r.roomNumber,
      toBedId: r.bedId,
      transferDate: `2026-07-${String(8 + idx).padStart(2, '0')}`,
      note: idx === 0 ? 'Requested quieter room' : '',
    });
  });

  // Past residents (checked out — not currently staying)
  const pastResidents = [
    {
      id: 'past-001',
      name: 'Kiran Deshmukh',
      phone: '9876500101',
      joiningDate: '2025-02-10',
      checkoutDate: '2026-06-30',
      lastRoomNumber: 108,
      lastBedId: '108-A',
      monthlyRent: 9000,
      deposit: 9000,
      refundAmount: 9000,
      depositRefundable: true,
      sharingType: 'DOUBLE',
      notes: 'Moved to another city',
    },
    {
      id: 'past-002',
      name: 'Sneha Iyer',
      phone: '9876500102',
      joiningDate: '2025-05-01',
      checkoutDate: '2026-05-15',
      lastRoomNumber: 311,
      lastBedId: '311-B',
      monthlyRent: 8000,
      deposit: 8000,
      refundAmount: 8000,
      depositRefundable: true,
      sharingType: 'DOUBLE',
      notes: '',
    },
    {
      id: 'past-003',
      name: 'Aravind Nair',
      phone: '9876500103',
      joiningDate: '2024-11-20',
      checkoutDate: '2026-04-01',
      lastRoomNumber: 101,
      lastBedId: '101-A',
      monthlyRent: 12000,
      deposit: 12000,
      refundAmount: 0,
      depositRefundable: false,
      sharingType: 'SINGLE',
      notes: 'Completed internship',
    },
  ];

  return {
    floors,
    residents,
    pastResidents,
    payments,
    transfers,
    admin: {
      id: 'admin-1',
      name: 'Admin',
      role: 'Administrator',
    },
    meta: { month, year },
  };
}
