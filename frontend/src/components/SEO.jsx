import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Eternity Touch - Premium Fashion E-commerce',
  description = 'Shop the latest fashion trends with Eternity Touch. Premium quality clothing, fast delivery, and excellent customer service.',
  keywords = 'fashion, clothing, e-commerce, online shopping, premium fashion',
  image = '/logo.png',
  url = window.location.href,
  type = 'website'
}) => {
  const siteTitle = 'Eternity Touch';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Eternity Touch" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
