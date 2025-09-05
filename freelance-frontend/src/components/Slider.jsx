import React, { useState, useEffect } from "react";
import { Box, Fade, CircularProgress } from "@mui/material";

const Slider = () => {
  // List the slider images located in public/assets/slider-images/
  const images = [
    "/assets/slider-images/slider1.jpg",
    "/assets/slider-images/slider2.jpg",
    "/assets/slider-images/slider3.jpg",
    "/assets/slider-images/slider4.jpg",
    "/assets/slider-images/slider5.jpg",
    "/assets/slider-images/slider6.jpg",
    // add additional images as needed
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images on mount
  useEffect(() => {
    const preloadImages = async () => {
      const promises = images.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      try {
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading images", error);
      }
    };

    preloadImages();
  }, [images]);

  // Start slider interval only once images are loaded
  useEffect(() => {
    if (imagesLoaded) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [imagesLoaded, images.length]);

  if (!imagesLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto",
        my: 2,
      }}
    >
      <Fade in key={currentIndex} timeout={1000}>
        <Box
          component="img"
          src={images[currentIndex]}
          alt={`Slider image ${currentIndex + 1}`}
          sx={{
            width: "100%",
            borderRadius: 2,
            objectFit: "cover",
            boxShadow: 3,
          }}
        />
      </Fade>
    </Box>
  );
};

export default Slider;