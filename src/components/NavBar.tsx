import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useTheme } from "next-themes";
import {
  Plus,
  BookOpen,
  Edit3,
  LogOut,
  User,
  BookDashed,
  Sun,
  Moon,
  Map,
  FileText,
  Tag,
  Grid,
} from "lucide-react";

interface NavBarProps {
  isAuthenticated: boolean;
  userProfile?: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  isAuthenticated,
  userProfile,
  onLogout,
}) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <Map size={18} /> },
    { name: "Posts", path: "/posts", icon: <FileText size={18} /> },
    { name: "Categories", path: "/categories", icon: <Grid size={18} /> },
    { name: "Tags", path: "/tags", icon: <Tag size={18} /> },
  ];

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="mb-6 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
      maxWidth="xl"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <BookOpen size={24} className="text-primary" />
          <Link to="/" className="font-bold text-inherit ml-2">
            Tour Guide
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          <BookOpen size={24} className="text-primary" />
          <Link to="/" className="font-bold text-inherit ml-2">
            Tour Guide
          </Link>
        </NavbarBrand>
        {menuItems.map((item) => (
          <NavbarItem
            key={item.path}
            isActive={location.pathname === item.path}
          >
            <Link
              to={item.path}
              className={`text-sm flex items-center gap-1 transition-colors hover:text-primary ${
                location.pathname === item.path
                  ? "text-primary font-medium"
                  : "text-default-600"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            aria-label="Toggle theme"
            className="rounded-full"
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </NavbarItem>

        {!isAuthenticated ? (
          <>
            <NavbarItem>
              <Button
                as={Link}
                to="/login"
                variant="flat"
                color="primary"
                size="sm"
                className="font-medium"
              >
                Log In
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                to="/signup"
                variant="flat"
                size="sm"
                className="font-medium"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button
                as={Link}
                to="/posts/drafts"
                color="secondary"
                variant="flat"
                startContent={<BookDashed size={16} />}
                className="font-medium"
                size="sm"
              >
                Drafts
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                to="/posts/new"
                color="primary"
                variant="flat"
                startContent={<Plus size={16} />}
                className="font-medium"
                size="sm"
              >
                New Post
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    color="primary"
                    size="sm"
                    className="transition-transform hover:scale-105"
                    src={userProfile?.avatar}
                    name={userProfile?.name}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem key="profile" startContent={<User size={16} />}>
                    <Link to="/profile">My Profile</Link> {/* TODO: Create a ProfilePage? */}
                  </DropdownItem>
                  <DropdownItem key="drafts" startContent={<Edit3 size={16} />}>
                    <Link to="/posts/drafts">My Drafts</Link>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    startContent={<LogOut size={16} />}
                    className="text-danger"
                    color="danger"
                    onPress={onLogout}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="pt-6">
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.path}>
            <Link
              to={item.path}
              className={`w-full flex items-center gap-2 py-2 ${
                location.pathname === item.path
                  ? "text-primary font-medium"
                  : "text-default-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {isAuthenticated && (
          <NavbarMenuItem>
            <Link
              to="/posts/drafts"
              className="w-full flex items-center gap-2 py-2 text-default-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookDashed size={18} />
              My Drafts
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </Navbar>
  );
};

export default NavBar;
