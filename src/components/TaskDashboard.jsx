/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Modal, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';


const backendUrl = import.meta.env.VITE_BACKEND_URL;

const TaskDashboard = ({ priorityFilter }) => {
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [filteredTasks, setFilteredTasks] = useState([]); // Filtered tasks
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'low',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(null); // Error messages

  // Fetch tasks from backend on load
  useEffect(() => {
    fetchTasks();
    fetchUserName();
  }, []);

  // Refetch tasks whenever priority filter changes
  useEffect(() => {
    if (priorityFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter((task) => task.priority === priorityFilter);
      setFilteredTasks(filtered);
    }
  }, [priorityFilter, tasks]);

  const fetchUserName = () => {
    const storedName = localStorage.getItem('userName'); // Assuming name is stored
    if (storedName) setUserName(storedName);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      const response = await axios.get(`${backendUrl}api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err.response?.data || err.message);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${backendUrl}api/tasks`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks([...tasks, res.data]);
      setFormData({ title: '', description: '', deadline: '', priority: 'low' });
      setError(null);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Error adding task. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleEditClick = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      priority: task.priority,
    });
    setShowEditModal(true);
  };

  // Update Task
  const handleEditSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(`${backendUrl}api/tasks/${currentTask._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.map((task) => (task._id === currentTask._id ? res.data : task)));
      setShowEditModal(false);
      setFormData({ title: '', description: '', deadline: '', priority: 'low' });
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  // Greet users dynamically
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="container mt-4">
      {/* Error Alert */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Display Tasks */}
      <h3 className="text-center text-primary mb-4">{getGreeting()}, {userName || 'User'}! Here&apos;s your task list for today.</h3>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Col md={4} key={task._id} className="mb-3">
                <Card
                  className="shadow-sm"
                  style={{
                    borderLeft: `5px solid ${
                      task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'
                    }`,
                  }}
                >
                  <Card.Body>
                    <Card.Title>{task.title}</Card.Title>
                    <Card.Text>{task.description || 'No description provided.'}</Card.Text>
                    <Card.Text>
                      <strong>Deadline:</strong>{' '}
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                    </Card.Text>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(task._id)}
                    >
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center text-danger">No tasks available.</p>
          )}
        </Row>
      )}

      <div className="divider my-5" style={{ height: '2px', backgroundColor: '#ddd' }}></div>

      <div className="mt-5">
        {/* Add Task Form */}
      <h3 className="text-center mb-2 text-success">Add Tasks</h3>
      
      <Card className="p-3 shadow-sm " style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mb-2"
                required
              />
            </Col>
            <Col>
              <Form.Control
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="mb-2"
              />
            </Col>
          </Row>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mb-2"
          />
          <Form.Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mb-3"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
          <Button variant="warning" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Add Task'}
          </Button>
        </Form>
      </Card>
      </div>
      
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              placeholder="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mb-2"
              required
            />
            <Form.Control
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mb-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Form.Select>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSave} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskDashboard;
