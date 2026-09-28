require('dotenv').config()
const mongoose    = require('mongoose')
const connectDB   = require('./config/db')

const User        = require('./models/User')
const Incident    = require('./models/Incident')
const Survivor    = require('./models/Survivor')
const Team        = require('./models/Team')
const Resource    = require('./models/Resource')
const ActivityLog = require('./models/ActivityLog')

async function seed() {
  await connectDB()
  console.log('\n🌱  Seeding HyperRescue demo data...\n')

  // ── Wipe existing ──────────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Incident.deleteMany({}),
    Survivor.deleteMany({}),
    Team.deleteMany({}),
    Resource.deleteMany({}),
    ActivityLog.deleteMany({}),
  ])
  console.log('  🗑️  Cleared existing data')

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = await User.create([
    { name: 'Admin User',         email: 'admin@hyperrescue.local',     password: 'admin123',  role: 'admin' },
    { name: 'Field Coordinator',  email: 'coord@hyperrescue.local',     password: 'coord123',  role: 'coordinator' },
    { name: 'Dr. Meera Singh',    email: 'meera@hyperrescue.local',     password: 'coord123',  role: 'medic' },
    { name: 'Ravi Kumar',         email: 'ravi@hyperrescue.local',      password: 'coord123',  role: 'responder' },
    { name: 'Anita Gupta',        email: 'logistics@hyperrescue.local', password: 'coord123',  role: 'logistics' },
  ])
  const admin = users[0]
  console.log(`  👥 Created ${users.length} users`)

  // ── Teams ──────────────────────────────────────────────────────────────────
  const teams = await Team.create([
    { name: 'Alpha Squad',    type: 'Search & Rescue', status: 'deployed',  leader_name: 'Ravi Kumar',     leader_phone: '+91-9876543210', member_count: 8,  base_location: 'Fire Station 4',   latitude: 28.5355, longitude: 77.3910, created_by: admin._id },
    { name: 'Bravo Medical',  type: 'Medical',         status: 'deployed',  leader_name: 'Dr. Meera Singh',leader_phone: '+91-9876543211', member_count: 5,  base_location: 'City Hospital',    latitude: 28.5400, longitude: 77.3850, created_by: admin._id },
    { name: 'Charlie Hazmat', type: 'Hazmat',          status: 'standby',   leader_name: 'Lt. Sharma',     leader_phone: '+91-9876543212', member_count: 6,  base_location: 'Industrial Zone',  latitude: 28.5280, longitude: 77.4000, created_by: admin._id },
    { name: 'Delta Rescue',   type: 'Search & Rescue', status: 'available', leader_name: 'Capt. Singh',    leader_phone: '+91-9876543213', member_count: 7,  base_location: 'Police HQ',        latitude: 28.5450, longitude: 77.3750, created_by: admin._id },
    { name: 'Eagle Air',      type: 'Air',             status: 'available', leader_name: 'Pilot Verma',    leader_phone: '+91-9876543214', member_count: 4,  base_location: 'City Airport',     latitude: 28.5550, longitude: 77.4100, created_by: admin._id },
    { name: 'Fox Logistics',  type: 'Logistics',       status: 'deployed',  leader_name: 'Anita Gupta',    leader_phone: '+91-9876543215', member_count: 6,  base_location: 'Supply Depot',     latitude: 28.5200, longitude: 77.3600, created_by: admin._id },
  ])
  console.log(`  🚁 Created ${teams.length} teams`)

  // ── Incidents ──────────────────────────────────────────────────────────────
  const incidents = await Incident.create([
    { title: 'Flash Flood — River District',       type: 'Flood',          priority: 'critical', status: 'active',      description: 'Severe flooding in residential area, multiple families trapped.',  latitude: 28.5320, longitude: 77.3890, address: 'River District, Sector 12', affected_count: 250, assigned_team: teams[0]._id, reported_by: admin._id },
    { title: 'Building Collapse — Oak Avenue',     type: 'Structural',     priority: 'critical', status: 'in_progress', description: 'Partial building collapse, rescue operations ongoing.',             latitude: 28.5380, longitude: 77.3950, address: 'Oak Avenue, Block 7',       affected_count: 45,  assigned_team: teams[1]._id, reported_by: admin._id },
    { title: 'Gas Leak — Industrial Zone',         type: 'Hazmat',         priority: 'high',     status: 'active',      description: 'Major gas pipeline rupture, evacuation radius 500m.',              latitude: 28.5280, longitude: 77.4010, address: 'Industrial Zone, Plot 23',  affected_count: 0,   assigned_team: teams[2]._id, reported_by: admin._id },
    { title: 'Wildfire — Northern Hills',          type: 'Fire',           priority: 'high',     status: 'in_progress', description: 'Forest fire spreading toward residential zone.',                   latitude: 28.5600, longitude: 77.4150, address: 'Northern Hills Reserve',    affected_count: 0,   reported_by: admin._id },
    { title: 'Power Grid Failure — Sector 7',      type: 'Infrastructure', priority: 'medium',   status: 'pending',     description: 'Multiple substations offline, affecting 3000 homes.',             latitude: 28.5150, longitude: 77.3700, address: 'Sector 7, Grid Station B',  affected_count: 0,   reported_by: admin._id },
    { title: 'Road Collapse — Highway 9',          type: 'Infrastructure', priority: 'medium',   status: 'resolved',    description: 'Sinkhole formation on major highway, traffic diverted.',          latitude: 28.5480, longitude: 77.3820, address: 'Highway 9, KM 23',          affected_count: 0,   reported_by: admin._id },
    { title: 'Chemical Spill — Warehouse District',type: 'Hazmat',         priority: 'high',     status: 'active',      description: 'Unknown chemical spill from storage facility.',                   latitude: 28.5220, longitude: 77.4080, address: 'Warehouse District, Gate 5',affected_count: 0,   reported_by: admin._id },
    { title: 'Earthquake — City Center',           type: 'Earthquake',     priority: 'critical', status: 'active',      description: 'Magnitude 5.2 earthquake, structural damage reported.',           latitude: 28.5490, longitude: 77.3920, address: 'City Center',               affected_count: 800, reported_by: admin._id },
  ])
  console.log(`  🚨 Created ${incidents.length} incidents`)

  // ── Survivors ──────────────────────────────────────────────────────────────
  const survivors = await Survivor.create([
    { name: 'Ramesh Sharma',  age: 45, gender: 'male',    status: 'critical', medical_condition: 'critical', needs: 'Medical',    latitude: 28.5322, longitude: 77.3892, address: 'River District, H-12',  notes: 'Chest injury, needs immediate evacuation', incident: incidents[0]._id, reported_by: admin._id },
    { name: 'Priya Sharma',   age: 38, gender: 'female',  status: 'found',    medical_condition: 'stable',   needs: 'Shelter',    latitude: 28.5325, longitude: 77.3888, address: 'River District, H-12',  notes: 'Wife of Ramesh, minor cuts',               incident: incidents[0]._id, reported_by: admin._id },
    { name: 'Unknown Child',  age: 7,  gender: 'unknown', status: 'critical', medical_condition: 'critical', needs: 'Medical',    latitude: 28.5318, longitude: 77.3895, address: 'River District, H-14',  notes: 'Unaccompanied minor, hypothermia',         incident: incidents[0]._id, reported_by: admin._id },
    { name: 'Arun Kumar',     age: 62, gender: 'male',    status: 'rescued',  medical_condition: 'stable',   needs: 'None',       latitude: 28.5380, longitude: 77.3952, address: 'Oak Avenue, B-701',      notes: 'Evacuated safely',                         incident: incidents[1]._id, reported_by: admin._id },
    { name: 'Sunita Devi',    age: 55, gender: 'female',  status: 'found',    medical_condition: 'serious',  needs: 'Medical',    latitude: 28.5378, longitude: 77.3948, address: 'Oak Avenue, B-703',      notes: 'Leg fracture from debris',                 incident: incidents[1]._id, reported_by: admin._id },
    { name: 'Vijay Singh',    age: 30, gender: 'male',    status: 'missing',  medical_condition: 'unknown',  needs: 'Evacuation', latitude: 28.5600, longitude: 77.4152, address: 'Northern Hills, Trail 3',notes: 'Last seen near firebreak',                 incident: incidents[3]._id, reported_by: admin._id },
    { name: 'Meena Gupta',    age: 28, gender: 'female',  status: 'rescued',  medical_condition: 'stable',   needs: 'None',       latitude: 28.5155, longitude: 77.3705, address: 'Sector 7, Block C',      notes: 'Power outage victim, no injuries',         incident: incidents[4]._id, reported_by: admin._id },
    { name: 'Elderly Man',    age: 78, gender: 'male',    status: 'critical', medical_condition: 'serious',  needs: 'Medical',    latitude: 28.5321, longitude: 77.3886, address: 'River District, H-9',    notes: 'Cardiac history, needs medication',        incident: incidents[0]._id, reported_by: admin._id },
  ])
  console.log(`  👤 Created ${survivors.length} survivors`)

  // ── Resources ──────────────────────────────────────────────────────────────
  const resources = await Resource.create([
    { name: 'First Aid Kits',          type: 'Medical Supplies',  status: 'available',  quantity: 50,  unit: 'kits',    location: 'Supply Depot A',          created_by: admin._id },
    { name: 'Emergency Food Packs',    type: 'Food & Water',      status: 'available',  quantity: 200, unit: 'packs',   location: 'Warehouse 3',             created_by: admin._id },
    { name: 'Water Purification Units',type: 'Food & Water',      status: 'allocated',  quantity: 10,  unit: 'units',   location: 'Field Hospital 1',        created_by: admin._id },
    { name: 'Rescue Boats',            type: 'Rescue Equipment',  status: 'deployed',   quantity: 6,   unit: 'boats',   location: 'River District',          incident: incidents[0]._id, created_by: admin._id },
    { name: 'Hydraulic Cutters',       type: 'Rescue Equipment',  status: 'deployed',   quantity: 4,   unit: 'sets',    location: 'Oak Avenue Site',         incident: incidents[1]._id, created_by: admin._id },
    { name: 'Ambulances',              type: 'Vehicles',          status: 'deployed',   quantity: 8,   unit: 'vehicles',location: 'City Hospital',           created_by: admin._id },
    { name: 'Generators (10kW)',       type: 'Power',             status: 'available',  quantity: 12,  unit: 'units',   location: 'Logistics Base',          created_by: admin._id },
    { name: 'Hazmat Suits',            type: 'Rescue Equipment',  status: 'allocated',  quantity: 20,  unit: 'suits',   location: 'Charlie Hazmat Team',     team: teams[2]._id, created_by: admin._id },
    { name: 'Emergency Tents',         type: 'Shelter',           status: 'available',  quantity: 150, unit: 'tents',   location: 'Supply Depot B',          created_by: admin._id },
    { name: 'Satellite Phones',        type: 'Communication',     status: 'available',  quantity: 25,  unit: 'units',   location: 'Command Center',          created_by: admin._id },
    { name: 'Drones (Search)',         type: 'Rescue Equipment',  status: 'deployed',   quantity: 5,   unit: 'units',   location: 'Eagle Air Team',          team: teams[4]._id, created_by: admin._id },
    { name: 'Blood Units (O+)',        type: 'Medical Supplies',  status: 'available',  quantity: 80,  unit: 'units',   location: 'City Hospital Blood Bank',created_by: admin._id },
  ])
  console.log(`  📦 Created ${resources.length} resources`)

  // ── Activity Log ───────────────────────────────────────────────────────────
  await ActivityLog.create([
    { type: 'incident', message: 'Flash Flood incident reported in River District',    severity: 'critical', entity_type: 'incident', entity_id: incidents[0]._id, user: admin._id },
    { type: 'survivor', message: '3 survivors located near River District H-12',      severity: 'high',     entity_type: 'survivor',  entity_id: survivors[0]._id, user: admin._id },
    { type: 'team',     message: 'Alpha Squad dispatched to River District',          severity: 'medium',   entity_type: 'team',      entity_id: teams[0]._id,     user: admin._id },
    { type: 'incident', message: 'Building Collapse reported on Oak Avenue',          severity: 'critical', entity_type: 'incident',  entity_id: incidents[1]._id, user: admin._id },
    { type: 'resource', message: 'Rescue boats allocated to River District operation',severity: 'medium',   entity_type: 'resource',  entity_id: resources[3]._id, user: admin._id },
    { type: 'survivor', message: 'Arun Kumar evacuated safely from Oak Avenue',       severity: 'low',      entity_type: 'survivor',  entity_id: survivors[3]._id, user: admin._id },
    { type: 'incident', message: 'Highway 9 Road Collapse marked as resolved',        severity: 'low',      entity_type: 'incident',  entity_id: incidents[5]._id, user: admin._id },
    { type: 'team',     message: 'Bravo Medical deployed to Oak Avenue site',         severity: 'medium',   entity_type: 'team',      entity_id: teams[1]._id,     user: admin._id },
  ])
  console.log(`  📋 Created 8 activity log entries`)

  console.log('\n✅ Seed complete!\n')
  console.log('  📋 Demo credentials:')
  console.log('     admin@hyperrescue.local  /  admin123')
  console.log('     coord@hyperrescue.local  /  coord123\n')

  await mongoose.connection.close()
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
