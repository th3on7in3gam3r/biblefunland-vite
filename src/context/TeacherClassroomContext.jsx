import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as db from '../lib/db';

const TeacherClassroomContext = createContext(null);

export function TeacherClassroomProvider({ children }) {
  const { user, profile } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load classrooms when teacher logs in
  useEffect(() => {
    if (user?.id && profile?.role === 'Teacher') {
      loadClassrooms();
    }
  }, [user?.id, profile?.role]);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      const { data } = await db.getTeacherClassrooms(user.id);
      setClassrooms(data || []);
      if (data?.length > 0 && !activeClassroom) {
        setActiveClassroom(data[0]);
      }
    } catch (error) {
      console.error('Error loading classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async (classroomData) => {
    try {
      const newClassroom = {
        teacher_id: user.id,
        name: classroomData.name,
        grade_level: classroomData.gradeLevel,
        subject: classroomData.subject || 'Bible Study',
        description: classroomData.description || '',
        max_students: classroomData.maxStudents || 30,
        settings: {
          allowParentAccess: classroomData.allowParentAccess || false,
          requireApproval: classroomData.requireApproval || true,
          autoAssignVerses: classroomData.autoAssignVerses || false,
        },
      };

      const result = await db.createClassroom(newClassroom);
      await loadClassrooms();
      return result;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  };

  const addStudentToClassroom = async (classroomId, studentData) => {
    try {
      const student = {
        classroom_id: classroomId,
        student_name: studentData.name,
        parent_email: studentData.parentEmail,
        grade: studentData.grade,
        age: studentData.age,
        notes: studentData.notes || '',
      };

      await db.addStudentToClassroom(student);

      // Refresh classroom data
      if (activeClassroom?.id === classroomId) {
        const updatedClassroom = await db.getClassroomWithStudents(classroomId);
        setActiveClassroom(updatedClassroom.data);
      }

      return student;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const removeStudentFromClassroom = async (classroomId, studentId) => {
    try {
      await db.removeStudentFromClassroom(studentId);

      // Refresh classroom data
      if (activeClassroom?.id === classroomId) {
        const updatedClassroom = await db.getClassroomWithStudents(classroomId);
        setActiveClassroom(updatedClassroom.data);
      }
    } catch (error) {
      console.error('Error removing student:', error);
      throw error;
    }
  };

  const assignActivityToClassroom = async (classroomId, activityData) => {
    try {
      const activity = {
        classroom_id: classroomId,
        title: activityData.title,
        description: activityData.description,
        type: activityData.type, // 'lesson', 'quiz', 'memory_verse', 'project'
        content: activityData.content,
        due_date: activityData.dueDate,
        points: activityData.points || 10,
        difficulty: activityData.difficulty || 'medium',
      };

      await db.assignActivityToClassroom(activity);
      return activity;
    } catch (error) {
      console.error('Error assigning activity:', error);
      throw error;
    }
  };

  const getClassroomProgress = async (classroomId) => {
    try {
      const { data } = await db.getClassroomProgress(classroomId);
      return data;
    } catch (error) {
      console.error('Error getting classroom progress:', error);
      return null;
    }
  };

  const updateClassroomSettings = async (classroomId, settings) => {
    try {
      await db.updateClassroomSettings(classroomId, settings);

      // Refresh active classroom
      if (activeClassroom?.id === classroomId) {
        const updatedClassroom = await db.getClassroomWithStudents(classroomId);
        setActiveClassroom(updatedClassroom.data);
      }
    } catch (error) {
      console.error('Error updating classroom settings:', error);
      throw error;
    }
  };

  return (
    <TeacherClassroomContext.Provider
      value={{
        classrooms,
        activeClassroom,
        setActiveClassroom,
        loading,
        createClassroom,
        addStudentToClassroom,
        removeStudentFromClassroom,
        assignActivityToClassroom,
        getClassroomProgress,
        updateClassroomSettings,
        loadClassrooms,
      }}
    >
      {children}
    </TeacherClassroomContext.Provider>
  );
}

export const useTeacherClassroom = () => {
  const ctx = useContext(TeacherClassroomContext);
  if (!ctx) throw new Error('useTeacherClassroom must be inside TeacherClassroomProvider');
  return ctx;
};
