/**
 * server/routes/familyGroups.js
 * Real family group management — create, join, fetch by code
 */
const express = require('express');
const router = express.Router();
const { execute, query, queryOne } = require('../lib/turso');

// ── DB init ───────────────────────────────────────────────────────────────────
async function initTables() {
  await execute(`CREATE TABLE IF NOT EXISTS family_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).catch(() => {});

  await execute(`CREATE TABLE IF NOT EXISTS family_group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    user_id TEXT,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    family_role TEXT,
    emoji TEXT DEFAULT '👤',
    streak INTEGER DEFAULT 0,
    badges INTEGER DEFAULT 0,
    joined_at TEXT NOT NULL
  )`).catch(() => {});
}
initTables();

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── POST /api/family-groups/create ───────────────────────────────────────────
router.post('/create', async (req, res) => {
  const { name, userId, displayName, familyRole } = req.body;
  if (!name || !userId) return res.status(400).json({ error: 'name and userId required' });

  const id = require('crypto').randomUUID();
  const code = makeCode();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO family_groups (id, name, code, created_by, created_at) VALUES (?, ?, ?, ?, ?)`,
      [id, name.trim(), code, userId, now]
    );

    const memberId = require('crypto').randomUUID();
    const roleEmoji = getFamilyRoleEmoji(familyRole);
    await execute(
      `INSERT INTO family_group_members (id, group_id, user_id, display_name, role, family_role, emoji, streak, badges, joined_at)
       VALUES (?, ?, ?, ?, 'Admin', ?, ?, 0, 0, ?)`,
      [memberId, id, userId, displayName || 'Family Member', familyRole || 'Admin', roleEmoji, now]
    );

    res.json({ success: true, group: { id, name: name.trim(), code } });
  } catch (err) {
    console.error('[FamilyGroups /create]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/family-groups/code/:code — look up group by invite code ─────────
router.get('/code/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const { data: group } = await queryOne(
      `SELECT * FROM family_groups WHERE code = ?`,
      [code.toUpperCase()]
    );
    if (!group) return res.status(404).json({ error: 'Group not found. Check the code and try again.' });

    const { data: members } = await query(
      `SELECT * FROM family_group_members WHERE group_id = ? ORDER BY joined_at ASC`,
      [group.id]
    );

    res.json({ group: { ...group, members: members || [], memberCount: (members || []).length, isFull: (members || []).length >= 5 } });
  } catch (err) {
    console.error('[FamilyGroups /code]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/family-groups/join — join a group by code ──────────────────────
router.post('/join', async (req, res) => {
  const { code, userId, displayName, familyRole, streak, badges } = req.body;
  if (!code || !displayName || !familyRole) {
    return res.status(400).json({ error: 'code, displayName, and familyRole are required' });
  }

  try {
    const { data: group } = await queryOne(
      `SELECT * FROM family_groups WHERE code = ?`,
      [code.toUpperCase()]
    );
    if (!group) return res.status(404).json({ error: 'Invalid invite code. Group not found.' });

    // Check if already a member (by userId if provided)
    if (userId) {
      const { data: existing } = await queryOne(
        `SELECT id FROM family_group_members WHERE group_id = ? AND user_id = ?`,
        [group.id, userId]
      );
      if (existing) return res.status(409).json({ error: 'You are already a member of this group.' });
    }

    // Enforce 5-member limit
    const { data: memberCount } = await queryOne(
      `SELECT COUNT(*) as count FROM family_group_members WHERE group_id = ?`,
      [group.id]
    );
    if ((memberCount?.count ?? 0) >= 5) {
      return res.status(403).json({ error: 'This family group is full (5 members maximum). The group admin would need to upgrade or remove a member.' });
    }

    const memberId = require('crypto').randomUUID();
    const roleEmoji = getFamilyRoleEmoji(familyRole);
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO family_group_members (id, group_id, user_id, display_name, role, family_role, emoji, streak, badges, joined_at)
       VALUES (?, ?, ?, ?, 'Member', ?, ?, ?, ?, ?)`,
      [memberId, group.id, userId || null, displayName, familyRole, roleEmoji, streak || 0, badges || 0, now]
    );

    // Return full group with all members
    const { data: members } = await query(
      `SELECT * FROM family_group_members WHERE group_id = ? ORDER BY streak DESC`,
      [group.id]
    );

    res.json({ success: true, group: { ...group, members: members || [] } });
  } catch (err) {
    console.error('[FamilyGroups /join]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/family-groups/user/:userId — get all groups for a user ──────────
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data: memberships } = await query(
      `SELECT group_id FROM family_group_members WHERE user_id = ?`,
      [userId]
    );
    if (!memberships || memberships.length === 0) return res.json({ groups: [] });

    const groupIds = memberships.map((m) => m.group_id);
    const placeholders = groupIds.map(() => '?').join(',');
    const { data: groups } = await query(
      `SELECT * FROM family_groups WHERE id IN (${placeholders})`,
      groupIds
    );

    // Attach members to each group
    const enriched = await Promise.all(
      (groups || []).map(async (g) => {
        const { data: members } = await query(
          `SELECT * FROM family_group_members WHERE group_id = ? ORDER BY streak DESC`,
          [g.id]
        );
        return { ...g, members: members || [] };
      })
    );

    res.json({ groups: enriched });
  } catch (err) {
    console.error('[FamilyGroups /user]', err);
    res.status(500).json({ error: err.message });
  }
});

function getFamilyRoleEmoji(role) {
  const map = {
    Father: '👨',
    Mother: '👩',
    Son: '👦',
    Daughter: '👧',
    Grandfather: '👴',
    Grandmother: '👵',
    Uncle: '👨',
    Aunt: '👩',
    Guardian: '🧑',
    Admin: '👑',
    Member: '👤',
  };
  return map[role] || '👤';
}

module.exports = router;

// ── POST /api/family-groups/leave — leave a group ────────────────────────────
router.post('/leave', async (req, res) => {
  const { groupId, userId } = req.body;
  if (!groupId || !userId) return res.status(400).json({ error: 'groupId and userId required' });
  try {
    await execute(
      `DELETE FROM family_group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[FamilyGroups /leave]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/family-groups/:groupId — delete entire group (admin only) ────
router.delete('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  if (!groupId || !userId) return res.status(400).json({ error: 'groupId and userId required' });
  try {
    // Verify requester is admin
    const { data: member } = await queryOne(
      `SELECT role FROM family_group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ error: 'Only the group Admin can delete the group' });
    }
    await execute(`DELETE FROM family_group_members WHERE group_id = ?`, [groupId]);
    await execute(`DELETE FROM family_groups WHERE id = ?`, [groupId]);
    res.json({ success: true });
  } catch (err) {
    console.error('[FamilyGroups /delete]', err);
    res.status(500).json({ error: err.message });
  }
});
