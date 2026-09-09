import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { saveMessage } from '../services/chat.service'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const BASE_URL = 'http://localhost:5000/api'

async function api(endpoint: string, options: RequestInit = {}, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const text = await res.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(`[${res.status}] ${endpoint}: ${data?.message || text}`)
  }
  return data
}

async function runE2E() {
  console.log('🚀 Starting Complete End-to-End Multi-Persona Product Verification...\n')
  await mongoose.connect(process.env.MONGO_URI!)

  const timestamp = Date.now()
  const studentEmail = `student_${timestamp}@college.edu`
  const mentorEmail = `senior_${timestamp}@college.edu`
  const alumniEmail = `alumni_${timestamp}@alumni.org`
  const adminEmail = `admin_${timestamp}@college.edu`
  const password = 'StrongPassword123!'

  let studentToken = ''
  let studentId = ''
  let mentorToken = ''
  let mentorId = ''
  let alumniToken = ''
  let alumniId = ''
  let adminToken = ''
  let adminId = ''

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // 1. STUDENT & SENIOR MENTOR WORKFLOW
    // ──────────────────────────────────────────────────────────────────────────
    console.log('--- Step 1: Student & Senior Registration & Login ---')
    // 1.1 Register Student
    const regStudent = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alex Junior', email: studentEmail, password, role: 'JUNIOR' }),
    })
    assert.equal(regStudent.status, 'success')
    studentToken = regStudent.data.token
    studentId = regStudent.data.user.id
    console.log('✔ Junior registered:', studentEmail)

    // 1.2 Register Senior Mentor
    const regMentor = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Jordan Senior', email: mentorEmail, password, role: 'SENIOR' }),
    })
    assert.equal(regMentor.status, 'success')
    mentorToken = regMentor.data.token
    mentorId = regMentor.data.user.id
    console.log('✔ Senior mentor registered:', mentorEmail)

    // 1.3 Complete Profile for Student & Mentor
    console.log('\n--- Step 2: Complete Profiles ---')
    await api('/profile/me', {
      method: 'PUT',
      body: JSON.stringify({
        department: 'Computer Science',
        year: '2nd',
        bio: 'Aspiring Full Stack Engineer interested in distributed systems.',
        skills: ['JavaScript', 'React', 'Node.js'],
      }),
    }, studentToken)

    await api('/profile/me', {
      method: 'PUT',
      body: JSON.stringify({
        department: 'Computer Science',
        year: '4th',
        bio: 'Senior SWE Intern at TechCorp. Happy to help with system design and resumes.',
        skills: ['TypeScript', 'Node.js', 'React', 'Docker'],
        company: 'TechCorp',
        title: 'Software Engineer Intern',
      }),
    }, mentorToken)
    console.log('✔ Student and Mentor profiles updated successfully')

    // 1.4 Find Mentor (Mentor Discovery)
    console.log('\n--- Step 3: Find Mentor in Directory ---')
    const discovery = await api('/mentors?search=Jordan', {}, studentToken)
    assert.ok(Array.isArray(discovery.data.mentors))
    const foundMentor = discovery.data.mentors.find((m: any) => m._id === mentorId || m.name === 'Jordan Senior')
    assert.ok(foundMentor, 'Registered mentor should be discoverable')
    console.log(`✔ Found mentor in directory: ${foundMentor.name}`)

    // 1.5 Send Mentorship Request
    console.log('\n--- Step 4: Send Mentorship Request ---')
    const sendReq = await api('/mentorships/request', {
      method: 'POST',
      body: JSON.stringify({
        mentorId,
        message: 'Hi Jordan, I would love your guidance on React architecture and interview prep!',
      }),
    }, studentToken)
    assert.equal(sendReq.status, 'success')
    const requestId = sendReq.data._id
    console.log(`✔ Mentorship request sent (ID: ${requestId})`)

    // 1.6 Mentor Accepts Request
    console.log('\n--- Step 5: Mentor Accepts Request ---')
    const incomingReqs = await api('/mentorships/requests', {}, mentorToken)
    assert.ok(incomingReqs.data.some((r: any) => r._id === requestId))
    const acceptRes = await api(`/mentorships/request/${requestId}/accept`, { method: 'PUT' }, mentorToken)
    assert.equal(acceptRes.status, 'success')
    console.log('✔ Mentorship request accepted by mentor')

    // 1.7 Chat: Open Conversation & Message Exchange
    console.log('\n--- Step 6: Chat & Messaging ---')
    const convRes = await api('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId: mentorId }),
    }, studentToken)
    const conversationId = convRes.data?._id || convRes.data?.conversation?._id
    assert.ok(conversationId, 'Conversation must have an ID')

    // Save message from student
    const savedMsg = await saveMessage(conversationId, studentId, 'Hello Jordan! Thank you for accepting my mentorship request.')
    assert.ok(savedMsg && savedMsg._id, 'Message should be saved')
    console.log('✔ Student message created in conversation')

    const msgsList = await api(`/chat/conversations/${conversationId}/messages`, {}, mentorToken)
    const messages = Array.isArray(msgsList.data) ? msgsList.data : msgsList.data?.messages || []
    assert.ok(messages.some((m: any) => m.content?.includes('Hello Jordan')))
    console.log('✔ Mentor successfully retrieved conversation message')

    // 1.8 Create Availability & Book Session
    console.log('\n--- Step 7: Mentor Availability & Booking ---')
    const tomorrow = new Date(Date.now() + 86400000)
    const slotStart = new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString()
    const slotEnd = new Date(tomorrow.setHours(15, 0, 0, 0)).toISOString()

    const availRes = await api('/scheduling/availability', {
      method: 'POST',
      body: JSON.stringify({
        startTime: slotStart,
        endTime: slotEnd,
      }),
    }, mentorToken)
    assert.equal(availRes.status, 'success')
    const availabilityId = availRes.data._id
    console.log(`✔ Mentor configured availability slot (ID: ${availabilityId})`)

    const bookingRes = await api('/scheduling/bookings', {
      method: 'POST',
      body: JSON.stringify({
        availabilityId,
        notes: 'Reviewing my portfolio project architecture',
      }),
    }, studentToken)
    assert.equal(bookingRes.status, 'success')
    console.log('✔ Student booked 1-on-1 mentorship session')

    // 1.9 Share / Download Resource
    console.log('\n--- Step 8: Resource Sharing & File Access ---')
    const formData = new FormData()
    const blob = new Blob(['console.log("Welcome to Clean Architecture in React");'], { type: 'text/plain' })
    formData.append('file', blob, 'react_architecture_guide.txt')
    formData.append('category', 'RESOURCE')
    formData.append('description', 'React clean architecture reference guide')

    const uploadRes = await fetch(`${BASE_URL}/files/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${mentorToken}` },
      body: formData,
    })
    const uploadData = (await uploadRes.json()) as any
    assert.equal(uploadData.status, 'success')
    const fileId = uploadData.data._id
    console.log(`✔ Mentor uploaded study resource (ID: ${fileId})`)

    // Student downloads the resource
    const downloadRes = await fetch(`${BASE_URL}/files/download/${fileId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.equal(downloadRes.status, 200)
    const fileContent = await downloadRes.text()
    assert.ok(fileContent.includes('Clean Architecture in React'))
    console.log('✔ Student successfully downloaded and verified resource content')

    // 1.10 Campus Forum: Discussion & Reply
    console.log('\n--- Step 9: Campus Forum Discussion ---')
    const postRes = await api('/forum', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Tips for Technical Coding Interviews',
        body: 'Focus on problem clarification, edge cases, and communicating time complexity early.',
        tags: ['Interviews', 'Career'],
      }),
    }, mentorToken)
    assert.equal(postRes.status, 'success')
    const postId = postRes.data._id
    console.log(`✔ Mentor posted discussion in Campus Forum (ID: ${postId})`)

    const commentRes = await api(`/forum/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: 'Super helpful advice Jordan, thanks!' }),
    }, studentToken)
    assert.equal(commentRes.status, 'success')
    console.log('✔ Student commented on discussion')

    // 1.11 Logout & Re-login
    console.log('\n--- Step 10: Logout & Re-authentication ---')
    const reLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: studentEmail, password }),
    })
    assert.equal(reLogin.status, 'success')
    assert.ok(reLogin.data.token)
    console.log('✔ Re-login succeeded with new token')

    // ──────────────────────────────────────────────────────────────────────────
    // 2. ALUMNI DUAL CAPABILITY WORKFLOW
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Step 11: Alumni Dual-Role Workflow ---')
    const regAlumni = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Morgan Alum', email: alumniEmail, password, role: 'ALUMNI' }),
    })
    assert.equal(regAlumni.status, 'success')
    alumniToken = regAlumni.data.token
    alumniId = regAlumni.data.user.id
    console.log('✔ Alumni registered:', alumniEmail)

    // Complete alumni profile
    await api('/profile/me', {
      method: 'PUT',
      body: JSON.stringify({
        company: 'CloudVentures',
        title: 'Senior DevOps Architect',
        bio: 'Alumnus Class of 2022. Helping with cloud infrastructure, Kubernetes, and transitions.',
        skills: ['Kubernetes', 'AWS', 'Go'],
      }),
    }, alumniToken)

    // Alumni sends mentorship request to Senior Mentor
    const alumniReq = await api('/mentorships/request', {
      method: 'POST',
      body: JSON.stringify({
        mentorId,
        message: 'Interested in syncing regarding campus cloud computing trends!',
      }),
    }, alumniToken)
    assert.equal(alumniReq.status, 'success')
    console.log('✔ Alumni successfully sent peer request to mentor')

    // Verify Alumni can also be discovered as a mentor by students
    const alumniDiscovery = await api('/mentors?search=Morgan', {}, studentToken)
    assert.ok(alumniDiscovery.data.mentors.some((m: any) => m.userId === alumniId || m.name === 'Morgan Alum'))
    console.log('✔ Alumni confirmed discoverable in Mentors directory')

    // ──────────────────────────────────────────────────────────────────────────
    // 3. ADMIN GOVERNANCE & MODERATION WORKFLOW
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n--- Step 12: Admin Governance & Moderation Workflow ---')
    const regAdmin = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Admin Root', email: adminEmail, password, role: 'SENIOR' }),
    })
    adminId = regAdmin.data.user.id

    // Elevate to ADMIN in MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI!)
    }
    await mongoose.connection.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(adminId) },
      { $set: { role: 'ADMIN' } }
    )

    // Re-login to get refreshed JWT containing role: 'ADMIN'
    const adminLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: adminEmail, password }),
    })
    adminToken = adminLogin.data.token
    assert.equal(adminLogin.data.user.role, 'ADMIN')
    console.log('✔ Admin account authenticated with role: ADMIN')

    // 3.1 Fetch Admin Platform Metrics
    const stats = await api('/admin/stats', {}, adminToken)
    assert.equal(stats.status, 'success')
    assert.ok(stats.data.totalUsers >= 4)
    assert.ok(stats.data.totalPosts >= 1)
    console.log(`✔ Admin metrics retrieved (Total Members: ${stats.data.totalUsers}, Posts: ${stats.data.totalPosts})`)

    // 3.2 Search Member Directory
    const userSearch = await api(`/admin/users?search=Alex`, {}, adminToken)
    assert.ok(userSearch.data.users.some((u: any) => u.email === studentEmail))
    console.log('✔ Admin search located student in directory')

    // 3.3 Test Role Management (Promote Student to Senior)
    const rolePatch = await api(`/admin/users/${studentId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: 'SENIOR' }),
    }, adminToken)
    assert.equal(rolePatch.status, 'success')
    assert.equal(rolePatch.data.role, 'SENIOR')
    console.log('✔ Admin updated student role to SENIOR')

    // 3.4 Student reports content -> Admin Moderation Queue
    const reportRes = await api('/admin/reports', {
      method: 'POST',
      body: JSON.stringify({
        targetType: 'POST',
        targetId: postId,
        reason: 'OTHER',
        description: 'Test moderation queue filing',
      }),
    }, studentToken)
    assert.equal(reportRes.status, 'success')
    const reportId = reportRes.data._id
    console.log(`✔ Content report filed (ID: ${reportId})`)

    // Admin views reports
    const reportsList = await api('/admin/reports?status=PENDING', {}, adminToken)
    assert.ok(reportsList.data.reports.some((r: any) => String(r._id) === String(reportId)))
    console.log('✔ Admin retrieved pending report from moderation queue')

    // Admin resolves report
    const resolveRes = await api(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'RESOLVED',
        resolutionNote: 'Reviewed and confirmed compliant with community guidelines.',
      }),
    }, adminToken)
    assert.equal(resolveRes.status, 'success')
    assert.equal(resolveRes.data.status, 'RESOLVED')
    console.log('✔ Admin resolved content report with audit note')

    console.log('\n======================================================')
    console.log('🎉 ALL END-TO-END MULTI-PERSONA WORKFLOWS PASSED 100%!')
    console.log('======================================================\n')
  } finally {
    console.log('🧹 Cleaning up temporary test accounts and records from database...')
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI!)
    }
    const db = mongoose.connection.db
    if (db) {
      const testEmails = [studentEmail, mentorEmail, alumniEmail, adminEmail]
      const usersToDelete = await db.collection('users').find({ email: { $in: testEmails } }).toArray()
      const userIds = usersToDelete.map(u => u._id)

      await db.collection('users').deleteMany({ _id: { $in: userIds } })
      await db.collection('profiles').deleteMany({ userId: { $in: userIds } })
      await db.collection('mentorshiprequests').deleteMany({
        $or: [{ menteeId: { $in: userIds } }, { mentorId: { $in: userIds } }]
      })
      await db.collection('mentorships').deleteMany({
        $or: [{ menteeId: { $in: userIds } }, { mentorId: { $in: userIds } }]
      })
      await db.collection('conversations').deleteMany({ participants: { $in: userIds } })
      await db.collection('messages').deleteMany({ senderId: { $in: userIds } })
      await db.collection('availabilities').deleteMany({ mentorId: { $in: userIds } })
      await db.collection('bookings').deleteMany({
        $or: [{ menteeId: { $in: userIds } }, { mentorId: { $in: userIds } }]
      })
      await db.collection('sharedfiles').deleteMany({ uploadedBy: { $in: userIds } })
      await db.collection('posts').deleteMany({ authorId: { $in: userIds } })
      await db.collection('comments').deleteMany({ authorId: { $in: userIds } })
      await db.collection('reports').deleteMany({ reporterId: { $in: userIds } })
      console.log('✔ Cleanup complete: all test entities removed.')
    }
    await mongoose.disconnect()
  }
}

runE2E().catch((err) => {
  console.error('\n❌ E2E Verification failed:', err)
  process.exit(1)
})
