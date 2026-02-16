import { NavLink, Outlet } from "react-router-dom";
import { Card, Container } from "react-bootstrap";
import { Heading } from "@/components/common";

const DashboardLayout = () => {
  return (
    <section
      aria-labelledby="dashboard-layout-heading"
      className="my-3"
      role="region"
    >
      <Container>
        <Heading
          id="dashboard-layout-heading"
          title="Dashboard Layout"
          srOnly={true}
        />
        <Card className="viewport-card">
          <Card.Header>
            <div className="d-flex gap-2 justify-content-between align-items-center">
              <NavLink
                aria-label="Admin Dashboard | Manage Users"
                className={({ isActive }) =>
                  isActive
                    ? "link-opacity-100 text-decoration-none"
                    : "link-opacity-75 text-decoration-none"
                }
                to={`manage-users`}
              >
                Manage Users
              </NavLink>
              <NavLink
                aria-label="Admin Dashboard | Manage Categories"
                className={({ isActive }) =>
                  isActive
                    ? "link-opacity-100 text-decoration-none"
                    : "link-opacity-75 text-decoration-none"
                }
                to={`manage-categories`}
              >
                Manage Categories
              </NavLink>
            </div>
          </Card.Header>
          <Card.Body>
            <Outlet />
          </Card.Body>
          <Card.Footer>
            <div className="d-flex gap-2 justify-content-between align-items-center">
              <NavLink
                aria-label="Admin Dashboard | Manage Posts"
                className={({ isActive }) =>
                  isActive
                    ? "link-opacity-100 text-decoration-none"
                    : "link-opacity-75 text-decoration-none"
                }
                to={`manage-posts`}
              >
                Manage Posts
              </NavLink>
              <NavLink
                aria-label="Admin Dashboard | Manage Comments"
                className={({ isActive }) =>
                  isActive
                    ? "link-opacity-100 text-decoration-none"
                    : "link-opacity-75 text-decoration-none"
                }
                to={`manage-comments`}
              >
                Manage Comments
              </NavLink>
            </div>
          </Card.Footer>
        </Card>
      </Container>
    </section>
  );
};

export default DashboardLayout;
