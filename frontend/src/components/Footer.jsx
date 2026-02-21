import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
              Eternity Touch, votre destination mode et beauté en ligne en Tunisie. 
              Découvrez nos collections tendance et produits de qualité, livrés partout en Tunisie.
            </p>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>ENTREPRISE</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>Accueil</li>
                <li>À propos</li>
                <li>Livraison</li>
                <li>Politique de confidentialité</li>
            </ul>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>CONTACTEZ-NOUS</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+216 51 700 968</li>
                <li>eternity@touch.tn</li>
            </ul>
        </div>
        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024@ eternitytouch.tn - Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}

export default Footer;
