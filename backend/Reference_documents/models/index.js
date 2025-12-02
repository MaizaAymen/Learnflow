// Model initialization file to avoid circular dependencies
// All models should be required first, then relationships are defined here

// Import sequelize instance for factory function models
const sequelize = require('../../auth-service/config');

const Niveau = require('./Niveau');
const Classe = require('./Classe');
const Specialite = require('./Specialite');
const Departement = require('./Département');
const Salle = require('./Salle');
const Matiere = require('./Matiére');
const Course = require('./Course');
const Schedule = require('./Schedule');
const TimeSlot = require('./TimeSlot');
const Booking = require('./Booking');
const MatiereEnseignant = require('./MatiereEnseignant');
const MatiereClasse = require('./MatiereClasse');
const Absence = require('./Absence');
const Rattrapage = require('./Rattrapage');
const Student = require('./Student');
const StudentAbsence = require('./StudentAbsence');
const AbsenceJustification = require('./AbsenceJustification');
const StudentElimination = require('./StudentElimination');

// Import User model from auth-service for cross-schema relationships
// Students are users with role='etudiant'
const User = require('../../auth-service/models/userModel');

// ============================================================================
// CORE HIERARCHY: Département → Spécialité → Niveau → Classe
// ============================================================================

// 1. Département → Spécialité (One-to-Many)
// A Spécialité CANNOT exist without a Département
Departement.hasMany(Specialite, {
  foreignKey: 'departementId',
  onDelete: 'RESTRICT', // Prevent deletion if Spécialités exist
  onUpdate: 'CASCADE',
  as: 'specialites'
});
Specialite.belongsTo(Departement, { 
  foreignKey: 'departementId',
  allowNull: false, // Spécialité MUST have a Département
  as: 'departement',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});

// 2. Spécialité → Niveau (One-to-Many)
// A Niveau MUST belong to one Spécialité
Specialite.hasMany(Niveau, {
  foreignKey: 'specialiteId',
  onDelete: 'RESTRICT', // Prevent deletion if Niveaux exist
  onUpdate: 'CASCADE',
  as: 'niveaux'
});
Niveau.belongsTo(Specialite, { 
  foreignKey: 'specialiteId',
  allowNull: false, // Niveau MUST have a Spécialité
  as: 'specialite',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});

// 3. Niveau → Classe (One-to-Many)
// A Classe depends on a Niveau
Niveau.hasMany(Classe, {
  foreignKey: 'niveau_id',
  onDelete: 'RESTRICT', // Prevent deletion if Classes exist
  onUpdate: 'CASCADE',
  as: 'classes'
});
Classe.belongsTo(Niveau, { 
  foreignKey: 'niveau_id',
  allowNull: false, // Classe MUST have a Niveau
  as: 'niveau',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});

// ============================================================================
// INFRASTRUCTURE: Département → Salle
// ============================================================================

// Département → Salle (One-to-Many)
// Salles belong to a Département
Departement.hasMany(Salle, {
  foreignKey: 'departement_id',
  onDelete: 'RESTRICT', // Prevent deletion if Salles exist with bookings
  onUpdate: 'CASCADE',
  as: 'salles'
});
Salle.belongsTo(Departement, { 
  foreignKey: 'departement_id',
  allowNull: false, // Salle MUST belong to a Département
  as: 'departement',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});

// ============================================================================
// ACADEMIC: Matière Relationships
// ============================================================================

// Niveau → Matière (One-to-Many)
// A Matière is associated with a specific academic level
Niveau.hasMany(Matiere, {
  foreignKey: 'niveauId',
  onDelete: 'RESTRICT', // Prevent deletion if Matières exist
  onUpdate: 'CASCADE',
  as: 'matieres'
});
Matiere.belongsTo(Niveau, { 
  foreignKey: 'niveauId',
  allowNull: false, // Matière MUST belong to a Niveau
  as: 'niveau',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});

// Matière ↔ Classe (Many-to-Many through MatiereClasse)
// A Matière can be taught to multiple Classes
// A Classe can have multiple Matières
// Note: This is already defined in MatiereClasse.js

// Matière ↔ Enseignant (Many-to-Many through MatiereEnseignant)
// An Enseignant can teach multiple Matières
// A Matière can be taught by multiple Enseignants
// Note: This is already defined in MatiereEnseignant.js

// ============================================================================
// CONTENT: Course (Lesson Content)
// ============================================================================

// Course → Matière (Many-to-One)
// Course represents lesson content/materials for a Matière
// Note: Already defined in Course.js but we ensure consistency here
Course.belongsTo(Matiere, { 
  foreignKey: 'matiereId',
  allowNull: false,
  as: 'matiere',
  onDelete: 'CASCADE', // If Matière deleted, remove all course content
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
Matiere.hasMany(Course, { 
  foreignKey: 'matiereId',
  as: 'courses'
});

// Course → Enseignant (Many-to-One)
// Course created by an Enseignant
Course.belongsTo(User, { 
  foreignKey: 'userId',
  allowNull: true,
  as: 'enseignant',
  onDelete: 'SET NULL', // Keep course even if teacher leaves
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
User.hasMany(Course, { 
  foreignKey: 'userId',
  as: 'courses'
});

// ============================================================================
// SCHEDULING: TimeSlot & Schedule
// ============================================================================

// TimeSlot → Schedule (One-to-Many)
// Note: Already defined in Schedule.js

// Schedule → Classe (Many-to-One)
Schedule.belongsTo(Classe, { 
  foreignKey: 'classe_id',
  allowNull: false,
  as: 'classe',
  onDelete: 'CASCADE', // If Classe deleted, remove schedules
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
Classe.hasMany(Schedule, { 
  foreignKey: 'classe_id',
  as: 'schedules'
});

// Schedule → Matière (Many-to-One)
Schedule.belongsTo(Matiere, { 
  foreignKey: 'matiere_id',
  allowNull: false,
  as: 'matiere',
  onDelete: 'RESTRICT', // Prevent Matière deletion if scheduled
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
Matiere.hasMany(Schedule, { 
  foreignKey: 'matiere_id',
  as: 'schedules'
});

// Schedule → Salle (Many-to-One)
Schedule.belongsTo(Salle, { 
  foreignKey: 'salle_id',
  allowNull: true, // Salle can be TBD
  as: 'salle',
  onDelete: 'SET NULL', // If Salle deleted, keep schedule but remove room
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
Salle.hasMany(Schedule, { 
  foreignKey: 'salle_id',
  as: 'schedules'
});

// Schedule → Enseignant (Many-to-One)
Schedule.belongsTo(User, { 
  foreignKey: 'enseignant_id',
  allowNull: true,
  as: 'enseignant',
  onDelete: 'RESTRICT', // Prevent teacher deletion if they have schedules
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
User.hasMany(Schedule, { 
  foreignKey: 'enseignant_id',
  as: 'schedules'
});

// Schedule → TimeSlot (Many-to-One)
Schedule.belongsTo(TimeSlot, { 
  foreignKey: 'time_slot_id',
  allowNull: false,
  as: 'timeSlot',
  onDelete: 'RESTRICT', // Prevent TimeSlot deletion if used in schedules
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
TimeSlot.hasMany(Schedule, { 
  foreignKey: 'time_slot_id',
  as: 'schedules'
});

// ============================================================================
// BOOKING: Student/Teacher Attendance
// ============================================================================

// Booking → Schedule (Many-to-One)
Schedule.hasMany(Booking, { 
  foreignKey: 'schedule_id',
  as: 'bookings',
  onDelete: 'CASCADE' // If schedule cancelled, remove bookings
});
Booking.belongsTo(Schedule, { 
  foreignKey: 'schedule_id',
  allowNull: false,
  as: 'schedule',
  onDelete: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});

// Booking → User (Many-to-One)
Booking.belongsTo(User, { 
  foreignKey: 'user_id',
  allowNull: false,
  as: 'user',
  onDelete: 'CASCADE', // If user deleted, remove their bookings
  onUpdate: 'CASCADE',
  constraints: false  // Disable FK constraint to avoid table creation order issues
});
User.hasMany(Booking, { 
  foreignKey: 'user_id',
  as: 'bookings'
});

// ============================================================================
// STUDENT RELATIONSHIPS (Students are Users with role='etudiant')
// ============================================================================
// Note: Foreign keys are already created in the database via migration script
// We only define the associations here for querying, without creating constraints

// User (Student) → Niveau (Many-to-One)
User.belongsTo(Niveau, {
  foreignKey: 'niveau_id',
  as: 'niveauStudent',
  constraints: false, // Don't create FK constraint (already exists in DB)
  foreignKeyConstraint: false
});

Niveau.hasMany(User, {
  foreignKey: 'niveau_id',
  as: 'students',
  constraints: false,
  foreignKeyConstraint: false
});

// User (Student) → Classe (Many-to-One)
User.belongsTo(Classe, {
  foreignKey: 'classe_id',
  as: 'classeStudent',
  constraints: false, // Don't create FK constraint (already exists in DB)
  foreignKeyConstraint: false
});

Classe.hasMany(User, {
  foreignKey: 'classe_id',
  as: 'students',
  constraints: false,
  foreignKeyConstraint: false
});

// ============================================================================
// TEACHER CALENDAR: Absence & Rattrapage
// ============================================================================

// Absence → Schedule (Many-to-One)
Absence.belongsTo(Schedule, {
  foreignKey: 'schedule_id',
  allowNull: false,
  as: 'schedule',
  onDelete: 'CASCADE',
  constraints: false
});
Schedule.hasMany(Absence, {
  foreignKey: 'schedule_id',
  as: 'absences'
});

// Absence → Enseignant (Many-to-One)
Absence.belongsTo(User, {
  foreignKey: 'enseignant_id',
  allowNull: false,
  as: 'enseignant',
  onDelete: 'RESTRICT',
  constraints: false
});
User.hasMany(Absence, {
  foreignKey: 'enseignant_id',
  as: 'absences'
});

// Absence → Director (Many-to-One)
Absence.belongsTo(User, {
  foreignKey: 'validated_by',
  allowNull: true,
  as: 'validator',
  constraints: false
});

// Rattrapage → OriginalSchedule (Many-to-One)
Rattrapage.belongsTo(Schedule, {
  foreignKey: 'original_schedule_id',
  allowNull: false,
  as: 'original_schedule',
  onDelete: 'CASCADE',
  constraints: false
});
Schedule.hasMany(Rattrapage, {
  foreignKey: 'original_schedule_id',
  as: 'rattrapages'
});

// Rattrapage → Enseignant (Many-to-One)
Rattrapage.belongsTo(User, {
  foreignKey: 'enseignant_id',
  allowNull: false,
  as: 'enseignant',
  onDelete: 'RESTRICT',
  constraints: false
});
User.hasMany(Rattrapage, {
  foreignKey: 'enseignant_id',
  as: 'rattrapages'
});

// Rattrapage → NewSchedule (One-to-One)
Rattrapage.belongsTo(Schedule, {
  foreignKey: 'new_schedule_id',
  allowNull: true,
  as: 'new_schedule',
  constraints: false
});

// Rattrapage → Director (Many-to-One)
Rattrapage.belongsTo(User, {
  foreignKey: 'validated_by',
  allowNull: true,
  as: 'validator',
  constraints: false
});

// ============================================================================
// STUDENT ABSENCE RELATIONSHIPS
// ============================================================================

// StudentAbsence → Schedule (Many-to-One)
StudentAbsence.belongsTo(Schedule, {
  foreignKey: 'schedule_id',
  allowNull: false,
  as: 'schedule',
  constraints: false
});
Schedule.hasMany(StudentAbsence, {
  foreignKey: 'schedule_id',
  as: 'attendance'
});

// StudentAbsence → Student (Many-to-One)
// Note: Changed to reference User model since students are Users with role='etudiant' from auth schema
StudentAbsence.belongsTo(User, {
  foreignKey: 'student_id',
  allowNull: false,
  as: 'student',
  constraints: false
});
User.hasMany(StudentAbsence, {
  foreignKey: 'student_id',
  as: 'student_absences'
});

// StudentAbsence → Teacher (Enseignant) (Many-to-One)
StudentAbsence.belongsTo(User, {
  foreignKey: 'enseignant_id',
  allowNull: false,
  as: 'teacher',
  constraints: false
});
User.hasMany(StudentAbsence, {
  foreignKey: 'enseignant_id',
  as: 'marked_absences'
});

// ============================================================================
// STUDENT RELATIONSHIPS
// ============================================================================

// Student → Classe (Many-to-One)
Student.belongsTo(Classe, {
  foreignKey: 'classe_id',
  allowNull: true,
  as: 'classe',
  constraints: false
});
Classe.hasMany(Student, {
  foreignKey: 'classe_id',
  as: 'directStudents'
});

// Student → Niveau (Many-to-One)
Student.belongsTo(Niveau, {
  foreignKey: 'niveau_id',
  allowNull: true,
  as: 'niveau',
  constraints: false
});

// ============================================================================
// ABSENCE JUSTIFICATION RELATIONSHIPS
// ============================================================================

// StudentAbsence → AbsenceJustification (One-to-One)
StudentAbsence.hasOne(AbsenceJustification, {
  foreignKey: 'student_absence_id',
  as: 'justification',
  onDelete: 'CASCADE',
  constraints: false
});
AbsenceJustification.belongsTo(StudentAbsence, {
  foreignKey: 'student_absence_id',
  allowNull: false,
  as: 'studentAbsence',
  constraints: false
});

// User (Student) → AbsenceJustification (One-to-Many)
User.hasMany(AbsenceJustification, {
  foreignKey: 'student_id',
  as: 'justifications',
  constraints: false
});
AbsenceJustification.belongsTo(User, {
  foreignKey: 'student_id',
  allowNull: false,
  as: 'student',
  constraints: false
});

// Schedule → AbsenceJustification (One-to-Many)
Schedule.hasMany(AbsenceJustification, {
  foreignKey: 'schedule_id',
  as: 'justifications',
  constraints: false
});
AbsenceJustification.belongsTo(Schedule, {
  foreignKey: 'schedule_id',
  allowNull: false,
  as: 'schedule',
  constraints: false
});

// Matière → AbsenceJustification (One-to-Many)
Matiere.hasMany(AbsenceJustification, {
  foreignKey: 'matiere_id',
  as: 'justifications',
  constraints: false
});
AbsenceJustification.belongsTo(Matiere, {
  foreignKey: 'matiere_id',
  as: 'matiere',
  constraints: false
});

// Classe → AbsenceJustification (One-to-Many)
Classe.hasMany(AbsenceJustification, {
  foreignKey: 'classe_id',
  as: 'justifications',
  constraints: false
});
AbsenceJustification.belongsTo(Classe, {
  foreignKey: 'classe_id',
  as: 'classe',
  constraints: false
});

// ============================================================================
// STUDENT ELIMINATION RELATIONSHIPS
// ============================================================================

// User (Student) → StudentElimination (One-to-Many)
User.hasMany(StudentElimination, {
  foreignKey: 'student_id',
  as: 'eliminations',
  constraints: false
});
StudentElimination.belongsTo(User, {
  foreignKey: 'student_id',
  allowNull: false,
  as: 'student',
  constraints: false
});

// Matière → StudentElimination (One-to-Many)
Matiere.hasMany(StudentElimination, {
  foreignKey: 'matiere_id',
  as: 'eliminations',
  constraints: false
});
StudentElimination.belongsTo(Matiere, {
  foreignKey: 'matiere_id',
  allowNull: false,
  as: 'matiere',
  constraints: false
});



// Import new professional feature models (factory functions)
const Grade = require('./Grade')(sequelize);
const Exam = require('./Exam')(sequelize);
const GradeHistory = require('./GradeHistory')(sequelize);
const Document = require('./Document')(sequelize);
const StudentRequest = require('./StudentRequest')(sequelize);
const Internship = require('./Internship')(sequelize);
const Project = require('./Project')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const Announcement = require('./Announcement')(sequelize);
const Comment = require('./Comment')(sequelize);

// Import service feature models (factory functions)
const Book = require('./Book')(sequelize);
const BookBorrowing = require('./BookBorrowing')(sequelize);
const BookReservation = require('./BookReservation')(sequelize);
const HelpDesk = require('./HelpDesk')(sequelize);
const HelpDeskMessage = require('./HelpDeskMessage')(sequelize);
const FAQ = require('./FAQ')(sequelize);
const Feedback = require('./Feedback')(sequelize);
const CourseFeedback = require('./CourseFeedback')(sequelize);
const TeacherFeedback = require('./TeacherFeedback')(sequelize);
const Survey = require('./Survey')(sequelize);
const SurveyQuestion = require('./SurveyQuestion')(sequelize);
const SurveyResponse = require('./SurveyResponse')(sequelize);
const ChatSupport = require('./ChatSupport')(sequelize);
const ChatMessage = require('./ChatMessage')(sequelize);

// ============================================================================
// LIBRARY SERVICE: Book, BookBorrowing, BookReservation
// ============================================================================

// BookBorrowing → Book (Many-to-One)
BookBorrowing.belongsTo(Book, {
  foreignKey: 'bookId',
  allowNull: false,
  as: 'book',
  constraints: false
});
Book.hasMany(BookBorrowing, {
  foreignKey: 'bookId',
  as: 'borrowings',
  constraints: false
});

// BookReservation → Book (Many-to-One)
BookReservation.belongsTo(Book, {
  foreignKey: 'bookId',
  allowNull: false,
  as: 'book',
  constraints: false
});
Book.hasMany(BookReservation, {
  foreignKey: 'bookId',
  as: 'reservations',
  constraints: false
});

// ============================================================================
// SUPPORT SERVICE: HelpDesk, HelpDeskMessage
// ============================================================================

// HelpDeskMessage → HelpDesk (Many-to-One)
HelpDeskMessage.belongsTo(HelpDesk, {
  foreignKey: 'ticketId',
  allowNull: false,
  as: 'ticket',
  constraints: false
});
HelpDesk.hasMany(HelpDeskMessage, {
  foreignKey: 'ticketId',
  as: 'messages',
  constraints: false
});

// ============================================================================
// SURVEY SERVICE: Survey, SurveyQuestion, SurveyResponse
// ============================================================================

// SurveyQuestion → Survey (Many-to-One)
SurveyQuestion.belongsTo(Survey, {
  foreignKey: 'surveyId',
  allowNull: false,
  as: 'survey',
  constraints: false
});
Survey.hasMany(SurveyQuestion, {
  foreignKey: 'surveyId',
  as: 'questions',
  constraints: false
});

// SurveyResponse → Survey (Many-to-One)
SurveyResponse.belongsTo(Survey, {
  foreignKey: 'surveyId',
  allowNull: false,
  as: 'survey',
  constraints: false
});
Survey.hasMany(SurveyResponse, {
  foreignKey: 'surveyId',
  as: 'responses',
  constraints: false
});

// SurveyResponse → SurveyQuestion (Many-to-One)
SurveyResponse.belongsTo(SurveyQuestion, {
  foreignKey: 'questionId',
  allowNull: false,
  as: 'question',
  constraints: false
});
SurveyQuestion.hasMany(SurveyResponse, {
  foreignKey: 'questionId',
  as: 'responses',
  constraints: false
});

// ============================================================================
// CHAT SUPPORT SERVICE: ChatSupport, ChatMessage
// ============================================================================

// ChatMessage → ChatSupport (Many-to-One)
ChatMessage.belongsTo(ChatSupport, {
  foreignKey: 'chatSupportId',
  allowNull: false,
  as: 'chatRoom',
  constraints: false
});
ChatSupport.hasMany(ChatMessage, {
  foreignKey: 'chatSupportId',
  as: 'messages',
  constraints: false
});

// ChatMessage → User (Many-to-One) - for author
ChatMessage.belongsTo(User, {
  foreignKey: 'userId',
  allowNull: false,
  as: 'author',
  constraints: false
});
User.hasMany(ChatMessage, {
  foreignKey: 'userId',
  as: 'chatMessages',
  constraints: false
});

module.exports = {
  Niveau,
  Classe,
  Specialite,
  Departement,
  Salle,
  Matiere,
  Course,
  Schedule,
  TimeSlot,
  Booking,
  MatiereEnseignant,
  MatiereClasse,
  Absence,
  Rattrapage,
  Student,
  StudentAbsence,
  AbsenceJustification,
  StudentElimination,
  User, // Students are Users with role='etudiant'
  // New professional feature models
  Grade,
  Exam,
  GradeHistory,
  Document,
  StudentRequest,
  Internship,
  Project,
  AuditLog,
  Announcement,
  Comment,
  // Service feature models
  Book,
  BookBorrowing,
  BookReservation,
  HelpDesk,
  HelpDeskMessage,
  FAQ,
  Feedback,
  CourseFeedback,
  TeacherFeedback,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  ChatSupport,
  ChatMessage
};