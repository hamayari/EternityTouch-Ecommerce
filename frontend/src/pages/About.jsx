import React from 'react'
import SEO from '../components/SEO'
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div>
      <SEO 
        title="À Propos - Eternity Touch"
        description="Découvrez Eternity Touch, votre boutique en ligne spécialisée en mode et beauté en Tunisie. Qualité, style et service client d'excellence."
        keywords="à propos eternity touch, mode tunisie, beauté tunisie, boutique en ligne"
      />
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'À PROPOS'} text2 = {'DE NOUS'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Bienvenue chez <strong>Eternity Touch</strong>, votre destination mode et beauté en ligne en Tunisie.</p>
          <p>Nous sommes passionnés par la mode et la beauté, et nous nous engageons à vous offrir une sélection soignée de produits tendance et de qualité. Notre mission est de rendre le shopping en ligne simple, agréable et accessible à tous.</p>
          <b className='text-gray-800'>Notre Engagement</b>
          <p>Chez Eternity Touch, nous croyons que chaque personne mérite de se sentir belle et confiante. C'est pourquoi nous proposons une large gamme de vêtements, accessoires et produits de beauté pour tous les styles et toutes les occasions, avec une livraison rapide dans toute la Tunisie.</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'POURQUOI'} text2={'NOUS CHOISIR'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Qualité Garantie:</b>
          <p className='text-gray-600'>Nous sélectionnons rigoureusement chaque produit pour vous garantir la meilleure qualité.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Livraison Rapide:</b>
          <p className='text-gray-600'>Livraison dans toute la Tunisie avec suivi de commande en temps réel.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Service Client:</b>
          <p className='text-gray-600'>Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About;
