import React, { useState, useEffect } from 'react';
import {
  Layout,
  Row,
  Col,
  Card,
  Table,
  List,
  Collapse,
  Statistic,
  Button,
  Space,
  Alert,
  Tag,
  Empty,
  Spin,
  message,
  Tooltip,
  Grid,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import './TeacherDashboard.css';
import teacherService from '../services/teacherService';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const TeacherDashboard = () => {
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [absenceAlerts, setAbsenceAlerts] = useState([]);

  const isMobile = !screens.md;

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchAllTeacherData();
    }
  }, [user?.id]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      message.error('Failed to fetch user information');
    }
  };

  const fetchAllTeacherData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [classesData, subjectsData, studentsData, schedulesData, absencesData, alertsData] =
        await Promise.allSettled([
          teacherService.getTeacherClasses(user?.id),
          teacherService.getTeacherSubjects(user?.id),
          teacherService.getTeacherStudents(user?.id),
          teacherService.getTeacherSchedules(),
          teacherService.getTeacherAbsences(user?.id),
          teacherService.getAbsenceAlerts(user?.id),
        ]);

      // Handle results
      if (classesData.status === 'fulfilled') {
        console.log('✅ Classes data:', classesData.value);
        setClasses(classesData.value || []);
      } else {
        console.error('❌ Classes fetch failed:', classesData.reason);
      }

      if (subjectsData.status === 'fulfilled') {
        console.log('✅ Subjects data:', subjectsData.value);
        setSubjects(subjectsData.value || []);
      } else {
        console.error('❌ Subjects fetch failed:', subjectsData.reason);
      }

      if (studentsData.status === 'fulfilled') {
        console.log('✅ Students data:', studentsData.value);
        setStudents(studentsData.value || {});
      } else {
        console.error('❌ Students fetch failed:', studentsData.reason);
      }

      if (schedulesData.status === 'fulfilled') {
        console.log('✅ Schedules data:', schedulesData.value);
        setSchedules(schedulesData.value || []);
      } else {
        console.error('❌ Schedules fetch failed:', schedulesData.reason);
      }

      if (absencesData.status === 'fulfilled') {
        console.log('✅ Absences data:', absencesData.value);
        setAbsences(absencesData.value || []);
      } else {
        console.error('❌ Absences fetch failed:', absencesData.reason);
      }

      if (alertsData.status === 'fulfilled') {
        console.log('✅ Alerts data:', alertsData.value);
        setAbsenceAlerts(alertsData.value || []);
      } else {
        console.error('❌ Alerts fetch failed:', alertsData.reason);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      message.error('Failed to fetch teacher dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateAbsenceStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const absencesThisWeek = absences.filter(
      (absence) => new Date(absence.date_debut) >= weekAgo
    ).length;

    const absencesThisMonth = absences.filter(
      (absence) => new Date(absence.date_debut) >= monthAgo
    ).length;

    const absenceRate = (absencesThisMonth / Math.max(schedules.length, 1)) * 100;

    return {
      week: absencesThisWeek,
      month: absencesThisMonth,
      rate: absenceRate.toFixed(1),
    };
  };

  // Get upcoming sessions for today and this week
  const getUpcomingSchedules = () => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return schedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.date_debut);
        return scheduleDate >= now && scheduleDate <= weekFromNow;
      })
      .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))
      .slice(0, 10); // Limit to next 10 sessions
  };

  const stats = calculateAbsenceStats();
  const upcomingSchedules = getUpcomingSchedules();

  if (loading) {
    return (
      <Content style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </Content>
    );
  }

  // ============================================================================
  // 1. MY CLASSES SECTION
  // ============================================================================
  const renderMyClasses = () => {
    if (classes.length === 0) {
      return <Empty description="No classes assigned" />;
    }

    const classCards = classes.map((classItem) => (
      <Card
        key={classItem.id}
        style={{ marginBottom: '12px' }}
        hoverable
        className="class-card"
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h3 style={{ margin: '0 0 8px 0' }}>{classItem.nom}</h3>
            <Space split="|" size="small">
              <span>
                <TeamOutlined /> {classItem.student_count || 0} Students
              </span>
              {classItem.subjects && classItem.subjects.length > 0 && (
                <span>
                  <BookOutlined /> {classItem.subjects.join(', ')}
                </span>
              )}
            </Space>
          </Col>
          <Button type="primary" ghost size="small">
            View Details
          </Button>
        </Row>
      </Card>
    ));

    return <List dataSource={classCards} renderItem={(item) => item} />;
  };

  // ============================================================================
  // 2. MY SUBJECTS SECTION
  // ============================================================================
  const subjectsColumns = [
    {
      title: 'Subject Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Level / Department',
      dataIndex: 'niveau',
      key: 'niveau',
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      align: 'center',
    },
  ];

  const subjectsData = subjects.map((subject, index) => ({
    key: index,
    name: subject.name || 'N/A',
    code: subject.code || 'N/A',
    niveau: subject.niveau || 'N/A',
    hours: subject.hours || 0,
  }));

  // ============================================================================
  // 3. MY STUDENTS SECTION
  // ============================================================================
  const renderMyStudents = () => {
    if (!students || Object.keys(students).length === 0) {
      return <Empty description="No students assigned" />;
    }

    const collapseItems = Object.entries(students).map(([className, classStudents]) => {
      console.log(`📚 Class: ${className}, Students:`, classStudents);
      const studentColumns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text, record) => `${record.prenom} ${record.nom}`,
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          render: (text) => (
            <a href={`mailto:${text}`}>
              <MailOutlined /> {text}
            </a>
          ),
        },
        {
          title: 'Student ID',
          dataIndex: 'numero_etudiant',
          key: 'numero_etudiant',
        },
        {
          title: 'Attendance',
          dataIndex: 'attendance_rate',
          key: 'attendance',
          align: 'center',
          render: (rate) => {
            const percentage = parseFloat(rate) || 0;
            let color = 'green';
            if (percentage < 80) color = 'orange';
            if (percentage < 60) color = 'red';
            return <Tag color={color}>{percentage.toFixed(1)}%</Tag>;
          },
        },
      ];

      return {
        key: className,
        label: (
          <strong>
            {className} ({classStudents.length} students)
          </strong>
        ),
        children: (
          <Table
            columns={studentColumns}
            dataSource={classStudents.map((student, idx) => ({
              ...student,
              key: idx,
            }))}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        ),
      };
    });

    return <Collapse items={collapseItems} />;
  };

  // ============================================================================
  // 4. ATTENDANCE OVERVIEW
  // ============================================================================
  const renderAttendanceOverview = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="Absences This Week"
            value={stats.week}
            prefix={<AlertOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="Absences This Month"
            value={stats.month}
            prefix={<AlertOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="Absence Rate"
            value={stats.rate}
            suffix="%"
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // ============================================================================
  // 5. UPCOMING COURSES (SCHEDULE)
  // ============================================================================
  const renderUpcomingCourses = () => {
    if (upcomingSchedules.length === 0) {
      return <Empty description="No upcoming courses this week" />;
    }

    return (
      <List
        dataSource={upcomingSchedules}
        renderItem={(schedule) => {
          const scheduleDate = new Date(schedule.date_debut);
          const scheduleTime = scheduleDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const scheduleDay = scheduleDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          return (
            <List.Item
              key={schedule.id}
              style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}
            >
              <List.Item.Meta
                avatar={<CalendarOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                title={
                  <Space size="large">
                    <strong>{schedule.matiere?.name || 'N/A'}</strong>
                    <Tag color="blue">{schedule.classe?.nom || 'N/A'}</Tag>
                  </Space>
                }
                description={
                  <Space split="|" size="small">
                    <span>{scheduleDay}</span>
                    <span>
                      <ClockCircleOutlined /> {scheduleTime}
                    </span>
                    <span>
                      <UserOutlined /> {schedule.salle?.nom || 'Room TBD'}
                    </span>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  // ============================================================================
  // 6. STUDENT ABSENCE ALERTS
  // ============================================================================
  const renderAbsenceAlerts = () => {
    if (absenceAlerts.length === 0) {
      return (
        <Alert
          message="All is well"
          description="No students with high absences"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      );
    }

    const criticalAlerts = absenceAlerts.filter((alert) => alert.severity === 'critical');
    const warningAlerts = absenceAlerts.filter((alert) => alert.severity === 'warning');

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {criticalAlerts.length > 0 && (
          <>
            <div>
              <h4 style={{ color: '#ff4d4f', marginBottom: '12px' }}>
                <ExclamationCircleOutlined /> Critical - Close to Elimination
              </h4>
              <Space wrap>
                {criticalAlerts.map((alert) => (
                  <Tag
                    key={alert.student_id}
                    color="red"
                    style={{ padding: '4px 8px' }}
                  >
                    {alert.student_name} ({alert.absence_rate}% absent)
                  </Tag>
                ))}
              </Space>
            </div>
          </>
        )}

        {warningAlerts.length > 0 && (
          <>
            <div>
              <h4 style={{ color: '#faad14', marginBottom: '12px' }}>
                <AlertOutlined /> Warning - High Absences
              </h4>
              <Space wrap>
                {warningAlerts.map((alert) => (
                  <Tag
                    key={alert.student_id}
                    color="orange"
                    style={{ padding: '4px 8px' }}
                  >
                    {alert.student_name} ({alert.absence_rate}% absent)
                  </Tag>
                ))}
              </Space>
            </div>
          </>
        )}
      </Space>
    );
  };

  // ============================================================================
  // 7. QUICK ACTIONS
  // ============================================================================
  const renderQuickActions = () => (
    <Space wrap size="large" style={{ width: '100%' }}>
      <Tooltip title="Record attendance for your next class">
        <Button type="primary" icon={<CheckCircleOutlined />} size="large">
          Take Attendance
        </Button>
      </Tooltip>
      <Tooltip title="Enter or update student grades">
        <Button icon={<BookOutlined />} size="large">
          Enter Grades
        </Button>
      </Tooltip>
      <Tooltip title="View and manage your class calendar">
        <Button icon={<CalendarOutlined />} size="large">
          View Calendar
        </Button>
      </Tooltip>
      <Tooltip title="Send messages to your students">
        <Button icon={<MailOutlined />} size="large">
          Message Students
        </Button>
      </Tooltip>
    </Space>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <Content style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Teacher Dashboard</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Welcome back, {user?.prenom} {user?.nom}! Here's your teaching overview.
        </p>
      </div>

      {/* Quick Actions */}
      <Card style={{ marginBottom: '24px', background: '#fafafa' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Quick Actions</h3>
        {renderQuickActions()}
      </Card>

      {/* Attendance Overview */}
      <Card style={{ marginBottom: '24px' }} title={<h3 style={{ margin: 0 }}>Attendance Overview</h3>}>
        {renderAttendanceOverview()}
      </Card>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        {/* My Classes */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <h3 style={{ margin: 0 }}>
                <TeamOutlined /> My Classes
              </h3>
            }
            style={{ height: '100%' }}
          >
            {renderMyClasses()}
          </Card>
        </Col>

        {/* My Subjects */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <h3 style={{ margin: 0 }}>
                <BookOutlined /> My Subjects
              </h3>
            }
            style={{ height: '100%' }}
          >
            {subjectsData.length > 0 ? (
              <Table
                columns={subjectsColumns}
                dataSource={subjectsData}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            ) : (
              <Empty description="No subjects assigned" />
            )}
          </Card>
        </Col>
      </Row>

      {/* My Students */}
      <Card
        style={{ marginTop: '24px' }}
        title={
          <h3 style={{ margin: 0 }}>
            <TeamOutlined /> My Students
          </h3>
        }
      >
        {renderMyStudents()}
      </Card>

      {/* Upcoming Courses */}
      <Card
        style={{ marginTop: '24px' }}
        title={
          <h3 style={{ margin: 0 }}>
            <CalendarOutlined /> Upcoming Courses (This Week)
          </h3>
        }
      >
        {renderUpcomingCourses()}
      </Card>

      {/* Absence Alerts */}
      <Card
        style={{ marginTop: '24px' }}
        title={
          <h3 style={{ margin: 0 }}>
            <AlertOutlined /> Student Absence Alerts
          </h3>
        }
      >
        {renderAbsenceAlerts()}
      </Card>
    </Content>
  );
};

export default TeacherDashboard;
