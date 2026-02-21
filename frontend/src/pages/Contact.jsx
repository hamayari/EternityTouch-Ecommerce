import React from 'react'
import SEO from '../components/SEO'
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div>
      <SEO 
        title="Contactez-nous - Eternity Touch"
        description="Besoin d'aide? Contactez Eternity Touch. Notre équipe est à votre écoute pour toute question sur nos produits mode et beauté."
        keywords="contact eternity touch, service client tunisie, aide, support"
      />
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACTEZ'} text2={'NOUS'}/>
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Eternity Touch</p>
          <p className='text-gray-500'>Boutique en ligne de Mode & Beauté <br /> Livraison dans toute la Tunisie</p>
          <p className='text-gray-500'>Tél: +216 51 700 968 <br /> Email: eternity@touch.tn</p>
          <p className='font-semibold text-xl text-gray-600'>Horaires de Service</p>
          <p className='text-gray-600'>Lundi - Samedi: 9h00 - 18h00<br />Réponse sous 24h</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Nous Écrire</button>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default Contact;
