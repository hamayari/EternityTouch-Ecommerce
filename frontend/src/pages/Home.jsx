import React, { useContext } from 'react'
import SEO from '../components/SEO'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import ProductRecommendations from '../components/ProductRecommendations'
import { ShopContext } from '../context/ShopContext'

const Home = () => {
  const { backendUrl, currency, token } = useContext(ShopContext);
  const userId = localStorage.getItem('userId');

  return (
    <div>
      <SEO 
        title="Eternity Touch - Votre Boutique Mode & Beauté en Ligne"
        description="Découvrez Eternity Touch, votre destination mode et beauté en Tunisie. Collections tendance, produits de qualité, livraison dans toute la Tunisie."
        keywords="mode tunisie, beauté tunisie, boutique en ligne, vêtements, cosmétiques, livraison tunisie, eternity touch"
      />
      <Hero/>
      
      {/* Trending Products */}
      <ProductRecommendations
        title="🔥 Trending Now"
        type="trending"
        limit={8}
        backendUrl={backendUrl}
        currency={currency}
      />

      {/* Personalized Recommendations */}
      {userId && (
        <ProductRecommendations
          title="✨ Recommended For You"
          type="personalized"
          userId={userId}
          limit={8}
          backendUrl={backendUrl}
          currency={currency}
        />
      )}

      <LatestCollection/>
      <BestSeller/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home;
