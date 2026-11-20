import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/db.js';

let server;
let baseUrl;

const getCookie = (response) => response.headers.get('set-cookie')?.split(';')[0];

before(async () => {
  await prisma.$connect();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

async function registerInstitution(label) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const response = await fetch(`${baseUrl}/api/v1/auth/register-institution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionName: `${label} ${suffix}`,
      institutionEmail: `contact-${suffix}@example.edu`,
      adminName: 'Test Administrator',
      adminEmail: `admin-${suffix}@example.edu`,
      password: 'Production123!',
      confirmPassword: 'Production123!',
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  return { cookie: getCookie(response), adminEmail: `admin-${suffix}@example.edu`, institutionId: body.data.institution.id };
}

describe('ManageHub API Production Readiness Test Suite', () => {
  test('health reports ManageHub', async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.product, 'ManageHub');
  });

  test('anonymous requests are rejected', async () => {
    const response = await fetch(`${baseUrl}/api/v1/programs`);
    assert.equal(response.status, 401);
  });

  test('institution registration and login set only HttpOnly cookies', async () => {
    const registered = await registerInstitution('Auth School');
    assert.ok(registered.cookie);
    assert.match(registered.cookie, /^managehub_token=/);

    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registered.adminEmail, password: 'Production123!' }),
    });
    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();
    assert.equal(loginBody.success, true);
    assert.equal(loginBody.data.role, 'ADMIN');
    assert.equal(loginBody.data.token, undefined);
  });

  test('cross-tenant student access is denied', async () => {
    const institutionA = await registerInstitution('Tenant A');
    const institutionB = await registerInstitution('Tenant B');

    const programResponse = await fetch(`${baseUrl}/api/v1/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ManageHub', Cookie: institutionA.cookie },
      body: JSON.stringify({ name: 'Computer Science', durationYears: 4 }),
    });
    assert.equal(programResponse.status, 201);
    const program = await programResponse.json();

    const semesterResponse = await fetch(`${baseUrl}/api/v1/programs/${program.data.id}/semesters`, {
      headers: { Cookie: institutionA.cookie },
    });
    const semesters = await semesterResponse.json();

    const classResponse = await fetch(`${baseUrl}/api/v1/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ManageHub', Cookie: institutionA.cookie },
      body: JSON.stringify({ programId: program.data.id, name: 'CSE 2026', batchYear: 2026, section: 'A' }),
    });
    assert.equal(classResponse.status, 201);
    const classData = await classResponse.json();

    const studentResponse = await fetch(`${baseUrl}/api/v1/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ManageHub', Cookie: institutionA.cookie },
      body: JSON.stringify({
        classId: classData.data.id,
        studentName: 'Tenant A Student',
        enrollmentNumber: `ENR-${Date.now()}`,
        rollNumber: 'A-01',
        admissionYear: 2026,
      }),
    });
    assert.equal(studentResponse.status, 201);
    const student = await studentResponse.json();

    const crossResponse = await fetch(`${baseUrl}/api/v1/students/${student.data.id}`, {
      headers: { Cookie: institutionB.cookie },
    });
    assert.equal(crossResponse.status, 404);
  });

  test('faculty cannot perform ADMIN-only program creation', async () => {
    const institution = await registerInstitution('Role School');
    const facultyEmail = `faculty-${Date.now()}@example.edu`;
    const createFaculty = await fetch(`${baseUrl}/api/v1/users/faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ManageHub', Cookie: institution.cookie },
      body: JSON.stringify({ name: 'Test Faculty', email: facultyEmail, password: 'Faculty123!' }),
    });
    assert.equal(createFaculty.status, 201);

    const login = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: facultyEmail, password: 'Faculty123!' }),
    });
    assert.equal(login.status, 200);
    const facultyCookie = getCookie(login);

    const response = await fetch(`${baseUrl}/api/v1/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ManageHub', Cookie: facultyCookie },
      body: JSON.stringify({ name: 'Unauthorized Program', durationYears: 4 }),
    });
    assert.equal(response.status, 403);
  });

  test('evil cross-origin mutations and login origins are blocked', async () => {
    const login = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
      body: JSON.stringify({ email: 'nobody@example.edu', password: 'invalid' }),
    });
    assert.equal(login.status, 403);
    assert.equal((await login.json()).error.code, 'CSRF_BLOCKED');

    const institution = await registerInstitution('CSRF School');
    const response = await fetch(`${baseUrl}/api/v1/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ManageHub',
        Cookie: institution.cookie,
        Origin: 'https://attacker.example',
      },
      body: JSON.stringify({ name: 'Injected Program', durationYears: 4 }),
    });
    assert.equal(response.status, 403);
  });

  test('weak registration passwords are rejected', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const response = await fetch(`${baseUrl}/api/v1/auth/register-institution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institutionName: 'Weak Password School',
        institutionEmail: `weak-${suffix}@example.edu`,
        adminName: 'Weak Admin',
        adminEmail: `weak-admin-${suffix}@example.edu`,
        password: '        ',
        confirmPassword: '        ',
      }),
    });
    assert.equal(response.status, 400);
  });
});
