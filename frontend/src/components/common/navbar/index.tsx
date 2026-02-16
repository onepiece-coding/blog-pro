// /src/components/common/navbar/index.tsx

import { Navbar as BsNavbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

interface NavbarProps {
  brandText?: string;
  children: React.ReactNode;
}

const Navbar = ({ brandText = "Blog Pro", children }: NavbarProps) => {
  return (
    <BsNavbar
      className={`bg-body-tertiary`}
      aria-label="Main navigation"
      role="navigation"
      expand={true}
      as={"nav"}
    >
      <Container>
        <BsNavbar.Brand
          as={Link}
          to={"/"}
          aria-label="Navigate to Blog Pro homepage"
        >
          {brandText}
        </BsNavbar.Brand>
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">{children}</Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
