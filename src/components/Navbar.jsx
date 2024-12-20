/* eslint-disable react/prop-types */
import { Navbar, Nav, Container, Form } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


const AppNavbar = ({ priorityFilter, handleFilterChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [location]); // Run this check when location changes

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    localStorage.removeItem('userName');
    setIsAuthenticated(false); // Update state
    navigate('/login'); // Redirect to Login page
  };

  return (
    <Navbar expand="lg" className="bg-warning">
      <Container fluid>
        <Navbar.Brand >Task Master</Navbar.Brand>
        <Navbar.Toggle aria-controls="taskMaster" />
        <Navbar.Collapse id="taskMaster">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }}>

            {/* Show Login/Register if user is NOT authenticated */}
            {!isAuthenticated && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  active={location.pathname === '/login'}
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register" 
                  active={location.pathname === '/register'}
                >
                  Register
                </Nav.Link>
              </>
            )}

            {/* Show Logout button if user IS authenticated */}
            {isAuthenticated && (
              <Nav.Link 
                as="button" 
                onClick={handleLogout} 
                className="btn btn-link text-danger"
              >
                Logout
              </Nav.Link>
            )}
          </Nav>

          {/* Filter/Search Form */}
          { isAuthenticated && (
            <Form.Select
            value={priorityFilter}
            onChange={handleFilterChange}
            style={{ maxWidth: '200px' }}
            className="ms-auto"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
