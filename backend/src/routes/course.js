const express = require('express');
const router = express.Router();
const c = require('../controllers/courseController');

// Course CRUD
router.post('/create', c.createCourseHandler);
router.get('/user/:clerkId', c.getUserCourses);
router.get('/:courseId', c.getCourseById);

// Subtopic actions
router.post('/:courseId/module/:moduleIndex/subtopic/:subtopicIndex/watched', c.markSubtopicWatched);
router.post('/:courseId/module/:moduleIndex/subtopic/:subtopicIndex/generate-quiz', c.generateAndSaveQuiz);

// Module-level quiz grading
router.post('/:courseId/module/:moduleIndex/grade-module', c.gradeModuleQuiz);

// Module prep status (for polling) & manual trigger
router.get('/:courseId/module/:moduleIndex/prep-status', c.getModulePrepStatus);
router.post('/:courseId/module/:moduleIndex/prepare', c.triggerPrepare);

module.exports = router;
