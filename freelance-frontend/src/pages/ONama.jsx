import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Fade,
  Button, // <-- added
} from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import useCitat from "../hooks/useCitat"; // <-- added

const ONama = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { quote, author, loading, error, refresh } = useCitat(); // <-- added

  const values = [
    {
      title: "Naša misija",
      description:
        "Pomažemo klijentima da pronađu savršene usluge kroz transparentnost, kvalitet i posvećenost svakom projektu.",
      icon: <BusinessCenterIcon fontSize="large" sx={{ color: "#D42700" }} />,
    },
    {
      title: "Naše vrednosti",
      description:
        "Verujemo u iskrenost, profesionalizam i međusobno poverenje kao temelj dugoročne saradnje.",
      icon: <FavoriteIcon fontSize="large" sx={{ color: "#D42700" }} />,
    },
    {
      title: "Naš tim",
      description:
        "Stručnjaci iz različitih oblasti okupljeni sa jednim ciljem – da vaša ideja postane realnost.",
      icon: <GroupsIcon fontSize="large" sx={{ color: "#D42700" }} />,
    },
    {
      title: "Inovacija",
      description:
        "Neprestano se razvijamo i istražujemo nove tehnologije kako bismo unapredili korisničko iskustvo.",
      icon: <EmojiObjectsIcon fontSize="large" sx={{ color: "#D42700" }} />,
    },
  ];

  return (
    <Box sx={{ px: { xs: 2, md: 10 }, py: 6, marginLeft:"90px" }}>
      <Fade in timeout={600}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#D42700" }}
        >
          O nama
        </Typography>
      </Fade>

      <Typography
        variant="h6"
        align="center"
        color="text.secondary"
        sx={{ maxWidth: 800, mx: "auto", mb: 5 }}
      >
        Mi smo platforma koja povezuje korisnike sa profesionalnim pružaocima
        usluga. Naša misija je da svaki korisnik lako pronađe ono što mu
        najviše odgovara – kvalitet, sigurnost i jednostavnost na jednom mestu.
      </Typography>

      <Grid container spacing={4}>
        {values.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Fade in timeout={600 + index * 200} sx={{padding:"20px"}}>
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  boxShadow: 4,
                  borderRadius: 3,
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.03)" }
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: "#FFF0ED",
                      color: "#D42700",
                      width: 56,
                      height: 56,
                      mb: 2,
                    }}
                    variant="rounded"
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* === New: Citat card (same width as one column sm=6) === */}
      <Grid container justifyContent="center" sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Fade in timeout={600}>
            <Card
              sx={{
                p: 3,
                boxShadow: 4,
                borderRadius: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.03)" }
              }}
            >
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Citat o napornom radu
                </Typography>

                {loading && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Učitavanje citata...
                  </Typography>
                )}

                {error && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}

                {!loading && !error && (
                  <>
                    <Typography variant="h6" sx={{ mt: 1, fontStyle: "italic" }}>
                      “{quote}”
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }} align="right">
                      — {author}
                    </Typography>
                  </>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    size="small"
                    onClick={refresh}
                    sx={{ textTransform: "none", color: "#D42700" }}
                  >
                    Osveži citat
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
        © {new Date().getFullYear()} Promo Pulse – Sva prava zadržana.
      </Typography>
    </Box>
  );
};

export default ONama;
