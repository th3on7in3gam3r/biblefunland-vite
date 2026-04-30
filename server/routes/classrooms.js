/**
 * server/routes/classrooms.js — Classroom management endpoints
 * Get classrooms and students for teachers
 */

const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../lib/turso');

// GET /api/classrooms — Get classrooms for a teacher
router.get('/', async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    const { data, error } = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM classroom_students WHERE classroom_id = c.id) as student_count
       FROM classrooms c 
       WHERE c.teacher_id = ? 
       ORDER BY c.created_at DESC`,
      [teacherId]
    );

    if (error) throw error;

    res.json({ data: data || [] });
  } catch (err) {
    console.error('Error getting classrooms:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classrooms/:classroomId/students — Get students in a classroom
router.get('/:classroomId/students', async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      return res.status(400).json({ error: 'classroomId is required' });
    }

    const { data, error } = await query(
      `SELECT * FROM classroom_students WHERE classroom_id = ? ORDER BY joined_at DESC`,
      [classroomId]
    );

    if (error) throw error;

    res.json({ data: { students: data || [] } });
  } catch (err) {
    console.error('Error getting classroom students:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
