import React from "react";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Box,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 220;
const collapsedWidth = 70;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  width: collapsedWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

const CustomDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  flexShrink: 0,
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: "#fff",
  color: "#333",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

function NavMenu({ userData, onLogout }) {
  const { userName, userRole } = userData;
  const firstLetter = userName.charAt(0).toUpperCase();

  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: "Početna", icon: <HomeIcon sx={{ color: "#D42700" }} />, route: "/pocetna" },
    { text: "Usluge", icon: <BuildIcon sx={{ color: "#D42700" }} />, route: "/usluge" },
    { text: "O Nama", icon: <InfoIcon sx={{ color: "#D42700" }} />, route: "/onama" },
  ];

  const handleItemClick = (route) => {
    navigate(route);
  };

  return (
    <>
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left: Toggle + Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              {open ? (
                <ChevronLeftIcon sx={{ color: "#D42700" }} />
              ) : (
                <MenuIcon sx={{ color: "#D42700" }} />
              )}
            </IconButton>
            <img
              src="/assets/logo.png"
              alt="Promo Pulse Logo"
              style={{ height: 40, objectFit: "contain" }}
            />
          </Box>

          {/* Right: User info + Logout */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ textAlign: "right", mr: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {userName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                {userRole}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: "#D42700", mr: 1 }}>{firstLetter}</Avatar>
            <Tooltip
              title="Logout"
              placement="bottom"
              componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: "0.9rem",
                    p: 1.5,
                  },
                },
              }}
            >
              <IconButton onClick={onLogout} aria-label="logout">
                <LogoutIcon sx={{ color: "#D42700" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <CustomDrawer variant="permanent" open={open}>
        <Toolbar />
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              {open ? (
                // Expanded: Show icon + text
                <ListItemButton
                  onClick={() => handleItemClick(item.route)}
                  sx={{
                    minHeight: 48,
                    justifyContent: "initial",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: "#333" }} />
                </ListItemButton>
              ) : (
                // Collapsed: Show icon with bigger tooltip
                <Tooltip
                  title={item.text}
                  placement="right"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        fontSize: "0.9rem",
                        p: 1.5,
                      },
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => handleItemClick(item.route)}
                    sx={{
                      minHeight: 48,
                      justifyContent: "center",
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              )}
            </ListItem>
          ))}
        </List>
      </CustomDrawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {/* Main content area */}
      </Box>
    </>
  );
}

export default NavMenu;
