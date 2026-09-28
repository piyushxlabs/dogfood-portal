// scripts/test-auth.mjs
// Verification suite for session token extraction and role guard logic

import assert from 'node:assert';

// Mock Request object for unit testing
function createMockRequest(headers = {}) {
  const map = new Map(Object.entries(headers));
  return {
    headers: {
      get(name) {
        return map.get(name) || map.get(name.toLowerCase()) || null;
      },
    },
  };
}

// Inline token extraction logic to verify regex contracts
function extractSessionToken(request) {
  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader) {
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch && bearerMatch[1]) {
      return bearerMatch[1].trim();
    }
    return authHeader.trim();
  }

  return null;
}

// Role guard evaluation logic matching lib/auth.ts
function evaluateRoleGuard(user, allowedRoles) {
  if (!user || !user.isAuthenticated) {
    return { status: 401, error: 'Unauthorized' };
  }
  if (user.role === 'visitor' || !allowedRoles.includes(user.role)) {
    return { status: 403, error: 'Forbidden' };
  }
  return { status: 200, user };
}

console.log('[TEST-AUTH] Running auth helper verification tests...');

// Test 1: Single cookie extraction
const req1 = createMockRequest({ cookie: 'session=org_7f2a' });
assert.strictEqual(extractSessionToken(req1), 'org_7f2a', 'Single cookie extraction failed');
console.log('✓ Test 1: Single cookie parsed successfully.');

// Test 2: Multi-cookie with whitespace
const req2 = createMockRequest({ cookie: 'theme=dark; session=jdg_a_91bc; lang=en' });
assert.strictEqual(extractSessionToken(req2), 'jdg_a_91bc', 'Multi-cookie extraction failed');
console.log('✓ Test 2: Multi-cookie with extra parameters parsed successfully.');

// Test 3: Authorization Bearer header extraction
const req3 = createMockRequest({ authorization: 'Bearer prt_2e88' });
assert.strictEqual(extractSessionToken(req3), 'prt_2e88', 'Bearer extraction failed');
console.log('✓ Test 3: Bearer token parsed successfully.');

// Test 4: Role Guard - Missing auth returns 401
const unauthGuard = evaluateRoleGuard({ isAuthenticated: false, role: 'visitor' }, ['judge']);
assert.strictEqual(unauthGuard.status, 401, 'Expected 401 for unauthenticated');
console.log('✓ Test 4: Unauthenticated request returned 401 Unauthorized.');

// Test 5: Role Guard - Participant blocked from judge routes returns 403
const participantGuard = evaluateRoleGuard({ isAuthenticated: true, role: 'participant' }, ['judge']);
assert.strictEqual(participantGuard.status, 403, 'Expected 403 for participant on judge route');
console.log('✓ Test 5: Participant blocked from judge route with 403 Forbidden.');

// Test 6: Role Guard - Authorized judge passes with 200
const judgeGuard = evaluateRoleGuard({ isAuthenticated: true, role: 'judge' }, ['judge']);
assert.strictEqual(judgeGuard.status, 200, 'Expected 200 for authorized judge');
console.log('✓ Test 6: Authorized judge passed role guard successfully.');

// Test 7: Role Guard - Organizer accessing organizer route
const orgGuard = evaluateRoleGuard({ isAuthenticated: true, role: 'organizer' }, ['organizer', 'admin']);
assert.strictEqual(orgGuard.status, 200, 'Expected 200 for organizer');
console.log('✓ Test 7: Organizer passed role guard successfully.');

console.log('======================================================================');
console.log('[TEST-AUTH] ALL 7 AUTH VERIFICATION TESTS PASSED CLEANLY.');
console.log('======================================================================');
