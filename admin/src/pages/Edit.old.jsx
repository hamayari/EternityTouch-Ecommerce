import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/product/single`, { productId: id });
      if (response.data.success) {
        const product = response.data.product;
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category);
        setSubCategory(product.subCategory);
        setBestseller(product.bestseller);
        setSizes(product.sizes);
        setExistingImages(product.image);
        setLoading(false);
      } else {
        toast.error(response.data.message);
        navigate('/list');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate('/list');
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("productId", id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(`${backendUrl}/api/product/update`, formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2 text-lg font-semibold'>Edit Product Images</p>
        <p className='mb-4 text-sm text-gray-600'>Upload new images to replace existing ones (optional)</p>
      </div>
      
      <div className='grid grid-flow-row-dense grid-cols-2 grid-rows-2 gap-8'>
        <label htmlFor="image1" className='col-span-1'>
          <img 
            className='w-20' 
            src={!image1 ? (existingImages[0] || assets.upload_area) : URL.createObjectURL(image1)} 
            alt="" 
          />
          <input onChange={(e) => setImage1(e.target.files[0])} type="file" id='image1' hidden />
        </label>
        <label htmlFor="image2" className='col-span-1'>
          <img 
            className='w-20' 
            src={!image2 ? (existingImages[1] || assets.upload_area) : URL.createObjectURL(image2)} 
            alt="" 
          />
          <input onChange={(e) => setImage2(e.target.files[0])} type="file" id='image2' hidden />
        </label>
        <label htmlFor="image3">
          <img 
            className='w-20' 
            src={!image3 ? (existingImages[2] || assets.upload_area) : URL.createObjectURL(image3)} 
            alt="" 
          />
          <input onChange={(e) => setImage3(e.target.files[0])} type="file" id='image3' hidden />
        </label>
        <label htmlFor="image4">
          <img 
            className='w-20' 
            src={!image4 ? (existingImages[3] || assets.upload_area) : URL.createObjectURL(image4)} 
            alt="" 
          />
          <input onChange={(e) => setImage4(e.target.files[0])} type="file" id='image4' hidden />
        </label>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input 
          onChange={(e) => setName(e.target.value)} 
          value={name} 
          className='w-full max-w-[500px] px-3 py-2 border border-gray-300' 
          type="text" 
          placeholder='Type here' 
          required
        />
      </div>
      
      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea 
          onChange={(e) => setDescription(e.target.value)} 
          value={description} 
          className='w-full max-w-[500px] px-3 py-2 border border-gray-300' 
          placeholder='Write description here' 
          required
        />
      </div>
      
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product category</p>
          <select 
            onChange={(e) => setCategory(e.target.value)} 
            value={category} 
            className='w-full px-3 py-2 border border-gray-300'
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub category</p>
          <select 
            onChange={(e) => setSubCategory(e.target.value)} 
            value={subCategory} 
            className='w-full px-3 py-2 border border-gray-300'
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product price</p>
          <input 
            onChange={(e) => setPrice(e.target.value)} 
            value={price} 
            className='w-full px-3 py-2 sm:w-[120px] border border-gray-300' 
            type="number" 
            placeholder="25" 
            required
          />
        </div>
      </div>

      <div>
        <p className='mb-2'>Product Sizes</p>
        <div className='flex gap-3'>
          <div onClick={() => setSizes(prev => prev.includes("S") ? prev.filter(item => item !== "S") : [...prev, "S"])}>
            <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>S</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("M") ? prev.filter(item => item !== "M") : [...prev, "M"])}>
            <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>M</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("L") ? prev.filter(item => item !== "L") : [...prev, "L"])}>
            <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>L</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("XL") ? prev.filter(item => item !== "XL") : [...prev, "XL"])}>
            <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>XL</p>
          </div>
          <div onClick={() => setSizes(prev => prev.includes("XXL") ? prev.filter(item => item !== "XXL") : [...prev, "XXL"])}>
            <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>XXL</p>
          </div>
        </div>
      </div>
      
      <div className='flex gap-2 mt-2'>
        <input 
          onChange={() => setBestseller(prev => !prev)} 
          checked={bestseller} 
          type="checkbox" 
          id='bestseller'
        />
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
      </div>
      
      <div className='flex gap-4 mt-4'>
        <button type='submit' className='w-32 py-3 bg-black text-white'>UPDATE</button>
        <button 
          type='button' 
          onClick={() => navigate('/list')} 
          className='w-32 py-3 bg-gray-500 text-white'
        >
          CANCEL
        </button>
      </div>
    </form>
  );
};

export default Edit;
