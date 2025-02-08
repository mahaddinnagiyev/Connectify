import Header from "../../components/header/Header";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProfileInfo from "../../components/profile/ProfileInfo";
import "./style.css";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const ProfilePage = () => {
  const [value, setValue] = React.useState(0);
  const [isVertical, setIsVertical] = React.useState(window.innerWidth >= 886);

  React.useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerWidth >= 886);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Header />
      <div id="profile-container">
        <Box
          sx={{
            display: "flex",
            flexDirection: isVertical ? "row" : "column",
            height: "100%",
            paddingTop: "120px",
            paddingLeft: "0",
          }}
        >
          {/* Tab Menu */}
          <Tabs
            orientation={isVertical ? "vertical" : "horizontal"}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            value={value}
            onChange={handleChange}
            aria-label="Profile tabs"
            sx={{
              borderRight: isVertical ? 1 : 0,
              borderBottom: isVertical ? 0 : 1,
              borderColor: "divider",
              minWidth: isVertical ? 250 : "100%",
              position: isVertical ? "fixed" : "relative",
              top: isVertical ? "140px" : "0",
              left: isVertical ? "0" : "auto",
              width: isVertical ? "250px" : "100%",
              height: isVertical ? "calc(100% - 140px)" : "auto",
              overflowY: "auto",
              zIndex: 10,
              bgcolor: "background.paper",
              paddingLeft: 0
            }}
          >
            <Tab label="My Profile" {...a11yProps(0)} />
            <Tab label="Friend List" {...a11yProps(1)} />
            <Tab label="Friend Requests" {...a11yProps(2)} />
            <Tab label="Block List" {...a11yProps(3)} />
          </Tabs>

          {/* Content */}
          <Box
            sx={{
              marginLeft: isVertical ? "250px" : "0",
              flexGrow: 1, // Tam ekranı tutsun
              padding: 0,
              minWidth: 0, // Overflow problemini həll edir
              paddingLeft: 0
            }}
          >
            <TabPanel value={value} index={0}>
              <ProfileInfo />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Typography variant="h4" gutterBottom>
                Friend List
              </Typography>
              <Typography>Friend list content goes here...</Typography>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <Typography variant="h4" gutterBottom>
                Friend Requests
              </Typography>
              <Typography>Friend requests content goes here...</Typography>
            </TabPanel>
            <TabPanel value={value} index={3}>
              <Typography variant="h4" gutterBottom>
                Block List
              </Typography>
              <Typography>Block list content goes here...</Typography>
            </TabPanel>
          </Box>
        </Box>
      </div>
    </>
  );
};

export default ProfilePage;
