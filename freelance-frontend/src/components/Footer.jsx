import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f8f8f8',
        py: 2,
        mt: 'auto',
        textAlign: 'center',
        borderTop: '1px solid #e0e0e0',
        px: 2,
      }}
    >
      <Typography variant="body2" sx={{ color: '#333', fontSize: '0.9rem' }}>
        Potrebna Vam je podrška? Pošaljite mejl na{' '}
        <Link
          href="mailto:promo-pulse@support.rs"
          underline="hover"
          sx={{ color: '#D42700', fontWeight: 'bold' }}
        >
          promo-pulse@support.rs
        </Link>{' '}
        |{' '}
        Imate problem? Prijavite ga na{' '}
        <Link
          href="mailto:promo-pulse@reportaproblem.rs"
          underline="hover"
          sx={{ color: '#D42700', fontWeight: 'bold' }}
        >
          promo-pulse@reportaproblem.rs
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
