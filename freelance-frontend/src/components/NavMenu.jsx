import React from "react";
import { styled } from "@mui/material/styles";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
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
  Breadcrumbs,
  Link,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import InfoIcon from "@mui/icons-material/Info";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import LogoutIcon from "@mui/icons-material/Logout";
import GavelIcon from "@mui/icons-material/Gavel";

////////////////////////////////////////////////////////////////////////////////
//  Podešavanje širina fioke
////////////////////////////////////////////////////////////////////////////////
const drawerWidth = 150;
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
  zIndex: 1000,
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

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.mixins.toolbar.minHeight + 8,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
  }),
  ...(!open && {
    marginLeft: collapsedWidth,
  }),
}));

// Za veće tooltip-ove
const tooltipProps = {
  componentsProps: {
    tooltip: {
      sx: { fontSize: "1.1rem", p: 2 },
    },
  },
};

// Mapa segmenata na čitljive nazive
const routeNames = {
  pocetna: "Početna",
  "moje-usluge": "Moje Usluge",
  "moji-zahtevi-ponudjac": "Moji Zahtevi",
  onama: "O Nama",
  usluge: "Usluge",
};

// Segmentiranje putanje "/usluge/12" => ["usluge", "12"]
function getPathSegments(path) {
  return path.split("/").filter((segment) => segment !== "");
}

// Komponenta Breadcrumbs
function MyBreadcrumbs({ pathname, userData }) {
  // npr. "/usluge/12" => ["usluge", "12"]
  const segments = getPathSegments(pathname);
  if (segments.length === 0) return null;

  // Tvoj link na "globalnu" početnu, zavisi od role
  const homeRoute = userData.userRole === "kupac" ? "/pocetna" : "/pocetna-ponudjac";

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link component={RouterLink} underline="hover" color="inherit" to={homeRoute}>
        Početna
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const linkTo = "/" + segments.slice(0, index + 1).join("/");

        // Ako je segment broj -> "Detalji Usluge"
        let label = routeNames[segment] || segment;
        if (/^\d+$/.test(segment)) {
          label = "Detalji Usluge";
        }

        if (isLast) {
          return (
            <Typography key={segment} color="text.primary">
              {label}
            </Typography>
          );
        } else {
          return (
            <Link
              key={segment}
              component={RouterLink}
              underline="hover"
              color="inherit"
              to={linkTo}
            >
              {label}
            </Link>
          );
        }
      })}
    </Breadcrumbs>
  );
}

function NavMenu({ userData, onLogout, children }) {
  const { userName, userRole } = userData;
  const firstLetter = userName.charAt(0).toUpperCase();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Definiši menije po role
  let menuItems = [];
  if (userRole === "kupac") {
    menuItems = [
      { text: "Početna", icon: <HomeIcon sx={{ color: "#D42700" }} />, route: "/pocetna" },
      { text: "Usluge", icon: <BuildIcon sx={{ color: "#D42700" }} />, route: "/usluge" },
      { text: "O Nama", icon: <InfoIcon sx={{ color: "#D42700" }} />, route: "/onama" },
    ];
  } else {
    menuItems = [
      {
        text: "Početna",
        icon: <HomeIcon sx={{ color: "#D42700" }} />,
        route: "/pocetna-ponudjac",
      },
      {
        text: "Moji Zahtevi",       
        icon: <GavelIcon sx={{ color: "#D42700" }} />,
        route: "/moji-zahtevi-ponudjac",
      },
      {
        text: "Moje Usluge",
        icon: <MiscellaneousServicesIcon sx={{ color: "#D42700" }} />,
        route: "/moje-usluge",
      },
      { text: "O Nama", icon: <InfoIcon sx={{ color: "#D42700" }} />, route: "/onama" },
    ];
  }

  const handleItemClick = (route) => {
    navigate(route);
  };

  // Putanje na kojima ne želimo breadcrumbs
  const hideBreadcrumbPaths = ["/", "/registracija", "/pocetna", "/pocetna-ponudjac"];
  const hideBreadcrumbs = hideBreadcrumbPaths.includes(location.pathname);

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
            <Tooltip title="Odjavi se" placement="bottom" {...tooltipProps}>
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
                  <ListItemText primary={item.text} sx={{ color: "#333", paddingLeft:"-20px" }} />
                </ListItemButton>
              ) : (
                // Collapsed: Show icon with bigger tooltip
                <Tooltip title={item.text} placement="right" {...tooltipProps}>
                  <ListItemButton
                    onClick={() => handleItemClick(item.route)}
                    sx={{
                      minHeight: 48,
                      justifyContent: "center",
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              )}
            </ListItem>
          ))}
        </List>
      </CustomDrawer>

      <Main open={open}>
        {/* Prikažemo breadcrumbs samo ako nismo na početnoj putanji */}
        {!hideBreadcrumbs && <MyBreadcrumbs pathname={location.pathname} userData={userData} />}

        {children}
      </Main>
    </>
  );
}

export default NavMenu;
